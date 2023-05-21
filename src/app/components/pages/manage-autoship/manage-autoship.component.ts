import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GetAutoship, GetAutoshipResult } from 'src/app/modals/autoship.modal';
import { ConfigService } from '../../shared/services/config.service';
import { ProductService } from '../../shared/services/product.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UtilityService } from '../../shared/services/utility.service';
import { PersistentService } from '../../shared/services/persistent.service';
import { UserService } from '../../shared/services/user.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import * as _ from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import $ from 'jquery';
import { CompanyService } from '../../shared/services/company.service';

@Component({
    selector: 'app-manage-autoship',
    templateUrl: './manage-autoship.component.html',
    styleUrls: ['./manage-autoship.component.scss']
})
export class ManageAutoshipComponent implements OnInit {
    public AutoOrdersData: Array<GetAutoship> = [];
    public LineItems: Array<GetAutoship> = [];
    private total;
    public autoshipConfiguration = {
        setting: {}
    };
    public autoShipId: number;
    userService: UserServiceModal;
    AutoshipSetting: [];
    constructor(
        public configService: ConfigService,
        private titleService: Title,
        public translate: TranslateService,
        private router: Router,
        public apiService: RestApiService,
        public itemsService: ProductService,
        public utilityService: UtilityService,
        public persistentService: PersistentService,
        public user: UserService,
        public cookieService: CookieService,
        public companyService: CompanyService
    ) {
        this.userService = this.user.userServiceModal;
    }

    ngOnInit() {
        this.translate.get('global_Company_Title').subscribe((text: string) => {
            this.titleService.setTitle(this.translate.instant('pagetitle_manage_autoship') + ' | ' + text);
        });
        window.scrollTo(0, 0);
        this.init();
    }

    setAutoshipId(id) {
        let submitapp = localStorage.getItem('SubmitApplication') && JSON.parse(localStorage.getItem('SubmitApplication'));
        if (submitapp) {
            submitapp.AutoOrderId = id;
            localStorage.setItem('SubmitApplication', JSON.stringify(submitapp));
        } else {
            submitapp = { AutoOrderId: id };
            localStorage.setItem('SubmitApplication', JSON.stringify(submitapp));
        }
    }

    getAutoOrders() {
        const promise = new Promise((resolve, reject) => {
            this.apiService.getCustomerAutoships(this.userService.customerData.CustomerId)
                .subscribe((result: GetAutoshipResult) => {
                    try {
                        if (result.Status === 0) {
                            this.AutoOrdersData = result.Data;
                            for (let i = 0; i < this.AutoOrdersData.length; i++) {
                                this.total = 0;
                                for (let j = 0; j < this.AutoOrdersData[i].LineItems.length; j++) {
                                    this.total += this.AutoOrdersData[i].LineItems[j].Quantity;
                                    this.AutoOrdersData[i].TotalQuantity = this.total;
                                }
                            }
                            resolve(result.Data);
                        }
                    } catch (ex) {
                        console.error('ex', ex);
                        reject({});
                    }
                }, (error) => {
                    this.AutoOrdersData = [];
                    reject({});
                }, () => {

                });
        });
        return promise;
    }

    init() {
        localStorage.setItem('cart.autoship', JSON.stringify(this.itemsService.selectedAutoOrderItems));
        this.getAutoOrders().then((data) => {
            if (!this.persistentService.retailData.AddMoreItemInAutoshipFlag) {
                this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
            }
            this.persistentService.retailData.IsPaid = false;
            this.persistentService.retailData.isAutoshipEdit = false;
            this.persistentService.retailData.SelectedAutoshipPayment = {};
            this.persistentService.retailData.isChanged = false;

            this.userService.isAddressChanged = false;
            this.userService.isPaymentChanged = false;
            if (this.utilityService.getAutoshipEditFlag()) {
                this.persistentService.retailData.AddMoreItemInAutoshipFlag = true;
                _.each(this.AutoOrdersData, (order: any) => {
                    if (order.AutoShipID == this.persistentService.retailData.editAutoshipItems[0].AutoOrderID) {
                        this.persistentService.retailData.AddMoreItemInAutoshipData = {
                            id: order.AutoShipID,
                            isPaid: order.isPaid
                        };
                    }
                });
                this.persistentService.retailData.CurrentSelectedAutoOrder = this.persistentService.retailData.editAutoshipItems[0].AutoOrderID;
                this.autoShipId = this.persistentService.retailData.editAutoshipItems[0].AutoOrderID;
            }

            if (this.persistentService.retailData.AddMoreItemInAutoshipFlag) {
                this.showAutoship(this.persistentService.retailData.AddMoreItemInAutoshipData.id, this.persistentService.retailData.AddMoreItemInAutoshipData.isPaid);
                this.persistentService.retailData.getAutoOrderDetailsByID = this.persistentService.retailData.AddMoreItemInAutoshipData;
                setTimeout(() => {
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $('#autoshipEditor').offset().top - 100
                    }, 2000);
                }, 2000);
            }
        });
    }

    canAddAutoship() {
        return ((this.AutoOrdersData && this.AutoOrdersData.length == 0) || this.configService.localSettings.Autoship.AllowMultipleAutoship);
    }

    showAutoship(id, IsPaid = false) {
        this.persistentService.retailData.isAutoshipEdit = false;
        if (this.persistentService.retailData.AddMoreItemInAutoshipData && this.persistentService.retailData.AddMoreItemInAutoshipData.id > 0 && id !== this.persistentService.retailData.AddMoreItemInAutoshipData.id) {
            this.persistentService.retailData.AddMoreItemInAutoshipData = {};
            this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
            this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
            this.userService.isEditAutoshipAddressChanged = false;
            this.persistentService.retailData.editAutoshipItems = [];
            this.itemsService.selectedAutoOrderItems = [];
            this.persistentService.retailData.isAutoshipEdit = false;
        }

        if (this.persistentService.retailData.isAutoshipEdit) {
            this.persistentService.retailData.isAutoshipEdit = false;
        } else {
            this.persistentService.retailData.isAutoshipEdit = true;
        }
        this.persistentService.retailData.getAutoOrderDetailsByID = {
            id: id,
            isPaid: IsPaid
        };
        this.autoShipId = id;
        this.utilityService.setAutoshipEditFlag(true);
    }

    createAutoship() {
        this.utilityService.setAutoshipEditFlag(false);
        this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
        this.persistentService.retailData.AddMoreItemInAutoshipData = {};
        this.persistentService.retailData.editAutoshipItems = [];
        this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
        this.router.navigate(['products/all'], { skipLocationChange: false });
    }
}
