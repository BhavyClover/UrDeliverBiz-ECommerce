import { UtilityService } from 'src/app/components/shared/services/utility.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { State } from 'src/app/modals/state.modal';
import { ShippingAddress, UserServiceModal } from 'src/app/modals/userservice.modal';
import { OrderService } from '../../shared/services/order.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UserService } from '../../shared/services/user.service';
import { Cart1Service } from '../../shared/services/cart1.service';
import * as _ from 'lodash';
import { PersistentService } from '../../shared/services/persistent.service';
@Component({
    selector: 'app-shipping-address',
    templateUrl: './shippingaddress.component.html',
    styleUrls: ['./shippingaddress.component.scss']
})
export class ShippingAddressComponent implements OnInit {
    public userService: UserServiceModal;
    public newShipping: ShippingAddress = {} as ShippingAddress;
    public isStateRestrict: boolean;
    constructor(
        private router: Router,
        public apiService: RestApiService,
        public user: UserService,
        public orderService: OrderService,
        public translate: TranslateService,
        public titleService: Title,
        public cart1Service: Cart1Service,
        public utilityService: UtilityService,
        public persistentService: PersistentService
    ) {
        this.userService = user.userServiceModal;
        this.userService.newshippingAddress = {} as ShippingAddress;
        if (!this.utilityService.isEmptyObject(this.userService.customerData.DefaultShippingAddress)) {
            this.user.setShippingAddress();
            this.userService.newshippingAddress.Country = this.userService.shippingAddress?.CountryCode?.toUpperCase() || this.userService.customerData?.DefaultShippingAddress.MainCountry?.toUpperCase();
            this.userService.newshippingAddress.Country = this.userService.newshippingAddress?.Country?.toUpperCase();
        } else {
            this.userService.newshippingAddress.Country = sessionStorage.getItem('selectedCountry').toUpperCase() || this.userService.shippingAddress?.CountryCode?.toUpperCase();
        }

        // check restricated states
        if (this.userService.restrictedStates.length) {
            _.each(this.userService.restrictedStates, (state) => {
                if (this.userService.shippingAddress.Region && (state).toLowerCase() === (this.userService.shippingAddress.Region).toLowerCase()) {
                    this.isStateRestrict = true;
                }
            });
        }

    }
    public allowedCountries: any = [];
    states: Array<State> = [];
    ngOnInit() {
        this.translate.get('global_Company_Title').subscribe((text: string) => {
            this.titleService.setTitle(this.translate.instant('pagetitle_shipping') + ' | ' + text);
        });
        this.allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'));

        this.getCountryState();
    }

    getCountryState(country?: string) {
        this.apiService.getStates(country || 'US').subscribe((result) => {
            sessionStorage.setItem((country || 'US') + 'State', JSON.stringify(result.Data));
            this.states = result.Data;
        },
            (error) => {
            }, () => {

            });
    }

    nextStep(isChanged?: boolean) {
        if (this.userService.newshippingAddress && this.userService.newshippingAddress.Country && (this.userService.newshippingAddress.Country.toUpperCase() !== sessionStorage.getItem('selectedCountry').toUpperCase())) {
            sessionStorage.setItem('selectedCountry', this.userService.newshippingAddress.Country);
            const allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'));
            _.each(allowedCountries.Data, (item) => {
                if (item.CountryCode.toLowerCase() == this.userService.newshippingAddress.Country.toLowerCase()) {
                    sessionStorage.setItem('selectedLanguageCode', item.CountryLanguages[0].LanguageCode);
                }
            });
        }
        if (isChanged) {
            if (this.userService.newshippingAddress && this.userService.newshippingAddress.Street1 && this.userService.newshippingAddress.PostalCode) {
                this.userService.selectedShippingMethod = 0;
                this.userService.newshippingAddress.FullName = this.userService.newshippingAddress.FirstName + ' ' + this.userService.newshippingAddress.LastName;
                this.userService.shippingAddress = cloneDeep(this.userService.newshippingAddress);
                this.userService.isAddressChanged = true;
                this.userService.isEditAutoshipAddressChanged = this.utilityService.getAutoshipEditFlag() ? true : false;
            }
        } else {
            this.userService.newshippingAddress = {};
        }
        this.orderService.calculateOrder().then(() => {
            this.router.navigate(['/checkout']);

        }).catch(() => {
            this.router.navigate(['/checkout']);
        });
    }
}
