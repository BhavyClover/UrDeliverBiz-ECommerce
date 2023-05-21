import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { RestApiService } from '../services/restapi.service';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from '../services/order.service';
import { ConfigService } from '../services/config.service';
import * as moment from 'moment';
import { SideNavBarService } from '../services/sidenavbar.service';
import { Cart1Service } from '../services/cart1.service';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { UtilityService } from '../services/utility.service';
import { PersistentService } from '../services/persistent.service';
import { AccountService } from '../services/account.service';
import { AutoshipConfigurationService } from '../services/autoshipConfiguration.service';
import { CompanyService } from '../services/company.service';

@Component({
    selector: 'app-sidebar-summary-cart',
    templateUrl: './sidebar-summary-cart.component.html',
    styleUrls: ['./sidebar-summary-cart.component.scss']
})
export class SideBarSummaryCartComponent implements OnInit {
    public commonData: any;
    public AutoshipMinDate: Date;
    public AutoshipMaxDate: Date;
    shouldRun: boolean = true;
    limit: 3;
    isShow: boolean;
    lastQuantity: 0;
    selectedfrequencyTypeID: 0;
    autoshipConfiguration: any = {
        setting: {
            allowEdit: true
        }
    };
    userService: UserServiceModal;
    currentState: any;
    checkoutVal: any;

    constructor(
        public configService: ConfigService,
        public orderService: OrderService,
        public user: UserService,
        public notificationService: NotificationService,
        public apiService: RestApiService,
        public translate: TranslateService,
        public sideNavBarService: SideNavBarService,
        public cart1Service: Cart1Service,
        public itemsService: ProductService,
        public location: Location,
        public router: Router,
        public utilityService: UtilityService,
        public persistentService: PersistentService,
        public accountService: AccountService,
        public autoshipConfigurationService: AutoshipConfigurationService,
        public companyService: CompanyService
    ) {
        this.autoshipConfigurationService.autoshipDate = new Date(autoshipConfigurationService.autoshipDate);
        this.userService = user.userServiceModal;
        this.commonData = this.configService.getConfig();
        this.selectedfrequencyTypeID = this.persistentService.retailData.Autoship.FrequencyTypeID = this.commonData.FrequencyTypes[2].ID;
        this.AutoshipMinDate = moment().add(this.configService.localSettings.Autoship.AutoshipMinDate, 'days').toDate();
        this.AutoshipMaxDate = moment().add(this.configService.localSettings.Autoship.AutoshipMaxDate, 'days').toDate();

    }
    @Input() events: Observable<void>;

    ngOnInit() {
        this.currentState = this.location.path();
    }

    showTaxMessage() {
        return !(this.location.path().toLowerCase() == '/join') && !(this.location.path().toLowerCase() == '/checkout') && (this.itemsService.selectedOrderItems.length > 0 || this.itemsService.selectedAutoOrderItems.length > 0 ||
            this.itemsService.selectedPacks.length > 0);
    }

    getPacksQuanity() {
        let quantity = 0;
        _.each(this.itemsService.selectedPacks, (item) => {
            quantity += (item.Quantity ? parseInt(item.Quantity, 10) : 0);
        });
        return quantity;
    }

    getOrderQuanity() {
        let quantity = 0;
        _.each(this.itemsService.selectedOrderItems, (item) => {
            if (!item.UsePoints) {
                quantity += (item.Quantity ? parseInt(item.Quantity, 10) : 0);
            }
            if (item.UsePoints) {
                quantity += (item.rewardQuantity ? parseInt(item.rewardQuantity, 10) : 0);
            }
        });
        return quantity;
    }

    getAutoOrderQuanity() {
        let quantity = 0;
        _.each(this.itemsService.selectedAutoOrderItems, (item) => {
            quantity += (item.Quantity ? parseInt(item.Quantity, 10) : 0);
        });
        return quantity;
    }

    removePromo(code) {
        this.userService.couponInfo.RewardsForUse = _.reject(this.userService.couponInfo.RewardsForUse, (e) => {
            return e.Code === code;
        });
        this.userService.couponInfo.promoCode = '';
        this.userService.couponInfo.promoCodeValid = false;
        this.userService.couponInfo.IsAppliedcode = false;
        this.userService.couponInfo.Allcoupons.splice(this.userService.couponInfo.Allcoupons.indexOf(code), 1);
        this.orderService.calculateOrder();
    }
    getCustomerTypeName(): any {
        const custmerType = _.find(this.configService.commonSettings.CustomerTypes, (item) => {
            return (item.ID == this.userService.customerTypeID);
        });
        if (custmerType) {
            return { type: custmerType.Description };
        }
    }

    dateFilter(date) {
        let disableDates = [];
        if (disableDates.length === 0) {
            disableDates = [];
        }
        return disableDates.indexOf(moment(date).format('DD MMMM YYYY')) === -1;
    }

    submitApplication() {
        document.querySelectorAll<HTMLElement>('#place-order-btn')[0].click();
    }

    checkitem() {
        if (this.utilityService.getAutoshipEditFlag()) {
            return true;
        }
        return (this.itemsService.selectedOrderItems.length > 0 || this.itemsService.selectedAutoOrderItems.length > 0);
    }

    navigateToNextStep() {
        this.sideNavBarService.triggerOpen();
        if (this.currentState.toLowerCase() == '/checkout' && (Object.keys(this.userService.customerData).length)
            && (this.userService.customerData.CustomerId || this.userService.customerData.PrimaryAddress.Region) && this.checkitem()
            && this.user.checkIfUserAuthenticatedOrNot()) {
            this.submitApplication();
        } else if (this.currentState.toLowerCase() != '/checkout' && (Object.keys(this.userService.customerData).length)
            && (this.userService.customerData.CustomerId || this.userService.customerData.PrimaryAddress.Region)
            && this.checkitem() && this.user.checkIfUserAuthenticatedOrNot()) {
            this.router.navigate(['/checkout']);
        } else if (this.checkitem() && ((Object.keys(this.userService.customerData).length === 0 && !this.userService.customerData.CustomerId)
            || !this.user.checkIfUserAuthenticatedOrNot())) {
            if (this.currentState.toLowerCase() == '/checkout') {
                this.accountService.logout();
            }
            this.router.navigate(['/login']);
        } else if (this.currentState.toLowerCase() != '/products/all') {
            this.router.navigate(['/products/all']);
        } else if (!this.checkitem()) {
            this.notificationService.error('error_', 'error_no_item_selected');
        }
    }

    backStep() {
        if (this.location.path().toLowerCase() == '/login') {
            this.router.navigate(['/products/all']);
        } else if (this.location.path().toLowerCase() == '/signup') {
            this.router.navigate(['/Login']);
        } else if (this.location.path().toLowerCase() == '/forgotpassword') {
            this.router.navigate(['/Login']);
        } else {
            this.router.navigate(['/products/all']);
        }
        this.sideNavBarService.triggerOpen();
    }

    navigateToApplication() {
        const application = (this.configService.localSettings.Global.ConfigurableCheckout && this.userService.customerData.CustomerId) ? '/checkout' : '/join';
        this.sideNavBarService.triggerOpen();
        if ((Object.keys(this.userService.customerData).length || this.userService.guestUserData.Email) &&
            (this.userService.customerData.CustomerId || this.userService.customerData.PrimaryAddress.Region || this.userService.guestUserData.Email)
            && this.checkitem() && this.user.checkIfUserAuthenticatedOrNot()) {
            this.router.navigate([application]);
        } else if (this.checkitem() && ((Object.keys(this.userService.customerData).length === 0
            && !this.userService.customerData.CustomerId) || !this.user.checkIfUserAuthenticatedOrNot())) {
            if (this.location.path().toLowerCase() == '/checkout' || this.userService.guestUserLogin) {
                this.accountService.logout();
            }
            this.router.navigate(['/login']);
        } else if (this.location.path().toLowerCase() != '/products/all') {
            this.router.navigate(['/products/all']);
        } else if (!this.checkitem()) {
            this.notificationService.error('error_', 'error_no_item_selected');
        }
    }

    showLogincheckoutBtn() {
        return (!(this.location.path().toLowerCase() == '/checkout' || this.location.path().toLowerCase() == '/join' ||
            this.location.path().toLowerCase() == '/login'));
    }

    useCoupons() {
        return (
            this.userService.couponInfo.OrderAllowCoupons &&
            this.userService.couponInfo.availableRewards &&
            this.userService.couponInfo.availableRewards.length
        );
    }

    checkRewardStatus(reward) {
        const isInUse = this.userService.couponInfo.RewardsForUse.some((currentReward) => {
            return currentReward.Code === reward.Code;
        });
        return isInUse;
    }

    toggleCoupon(coupon) {
        const applied = this.userService.couponInfo.RewardsForUse.some((reward) => {
            return reward.Code === coupon.Code;
        });

        if (applied && this.userService.DynamicCouponCode.promoCode != coupon.Code) {
            this.removePromo(coupon.Code);
        } else {
            this.userService.couponInfo.RewardsForUse.push(coupon);
            if (this.userService.couponInfo.RewardsForUse.length) {
                _.each(this.userService.couponInfo.RewardsForUse, (reward) => {
                    const IsCouponAvailable = this.userService.couponInfo.Allcoupons.some((coupon) => {
                        return reward.Code === coupon;
                    });
                    if (!IsCouponAvailable) {
                        this.userService.couponInfo.Allcoupons.push(reward.Code);
                    }

                });
            }
            this.orderService.calculateOrder();
        }
    }


    goToSignUp() {
        this.sideNavBarService.triggerOpen();
        if (this.itemsService.selectedOrderItems == 0 && this.configService.localSettings.Global.OrderItemRequired[this.userService.customerTypeID]) {
            const msg = 'unified_order_item_required';
            this.notificationService.error('error_', this.translate.instant(msg));
            return;
        }
        // <!-- ************** uncomment when real peoducts come or in prod mode ***************** -->
        // if (this.itemsService.selectedAutoOrderItems == 0 && this.configService.localSettings.Global.AutoshipItemRequired[this.userService.customerTypeID]) {
        //     const AutoshipMsg = 'unified_auto_order_item_required';
        //     this.notificationService.error('error_', this.translate.instant(AutoshipMsg));
        //     return;
        // }
        this.router.navigate(['/join'], {
            queryParams: { type: this.userService.customerTypeID },
            queryParamsHandling: 'merge'
        });
    }

    showNewCustomerBtn() {
        if (this.user.checkIfUserAuthenticatedOrNot()) {
            return false;
        } else if (this.location.path().toLowerCase() == '/signup' || this.location.path().toLowerCase() == '/join') {
            return false;
        } else {
            return true;
        }
    }

    isLoggedIn() {
        if ((Object.keys(this.userService.customerData).length) && (this.userService.customerData.CustomerId) && this.user.checkIfUserAuthenticatedOrNot()) {
            return true;
        } else {
            return false;
        }
    }

    isAutoshipChanged() {
        if (!moment(this.autoshipConfigurationService.autoshipDate).isSame(this.persistentService.retailData.autoshipDate, 'day')) {
            return true;
        }
        if (this.persistentService.retailData.Autoship && this.commonData.FrequencyTypes[0].ID != this.persistentService.retailData.Autoship.FrequencyTypeID) {
            return true;
        }
        if (this.userService.isAddressChanged || this.userService.isPaymentChanged || this.userService.isShipMethodChanged) {
            return true;
        }

        if (this.utilityService.getAutoshipEditFlag()) {
            if (this.persistentService.retailData.isChanged) {
                if (_.isEqual(this.persistentService.retailData.editAutoshipItems, this.itemsService.selectedAutoOrderItems) &&
                    this.itemsService.selectedOrderItems.length == 0) {
                    return false;
                }
                return true;
            }
            return false;
        }
        return true;
    }

    cancelAutoship() {
        this.router.navigate(['/manageautoship']);
        this.sideNavBarService.triggerOpen();
        this.notificationService.success('Success', this.translate.instant('autoship_cancel'));
    }

    deleteAutoship(autoShipId?: number) {

        this.apiService.deleteAutoship(autoShipId).subscribe((result) => {
            if (result && Number(result.Status) === 1) {
                this.notificationService.error('error_', this.translate.instant('some_error_occur_try_again'));
            } else {
                this.notificationService.success('Success', this.translate.instant('successfully_deleted'));
            }
        });
    }

    setFrequency() {
        this.commonData.FrequencyTypes.some((freq) => {
            if (freq.ID == this.persistentService.retailData.Autoship.FrequencyTypeID) {
                this.persistentService.retailData.Autoship.FrequencyTypeID = freq.ID;
                this.persistentService.retailData.Autoship.FrequencyTypeID = freq.ID;
                this.persistentService.retailData.Autoship.FrequencyTypeDescription = freq.Description;
                this.persistentService.retailData.isChanged = true;
                return;
            }
        });
    }

    saveEditAutoship() {
        this.sideNavBarService.triggerOpen();
        this.router.navigate(['/manageautoship']);
    }

    NavigateToAutoship() {
        this.sideNavBarService.triggerOpen();
        this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
        this.utilityService.setAutoshipEditFlag(false);
        this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
        this.persistentService.retailData.AddMoreItemInAutoshipData = {};
        this.cart1Service.clearCart();
        this.router.navigate(['/manageautoship']);

    }

    getAutoshipNumber() {
        return this.translate.instant('_invoice_autoorder') +
            this.persistentService.retailData.CurrentSelectedAutoOrder;
    }

    canCheckOut() {
        if (this.userService.customerData.CustomerId) {
            return true;
        } else {
            return false;
        }
    }

    getItems(type: string) {
        return this.itemsService[type == 'pack' ? 'selectedPacks' : (type == 'autoship' ? 'selectedAutoOrderItems' : 'selectedOrderItems')];
    }


    getImage(item) {
        return (item.OptionsImage && item.ImageUrl.substr(0, item.ImageUrl.lastIndexOf('/'))
            .concat(item.OptionsImage)) || item.ImageUrl;
    }

    view() {
        this.isShow = !this.isShow;
    }

    getQuantityModel(type, item): any {
        return this.cart1Service[type == 'pack' ? 'packQuantity' : (type == 'autoship' ? 'autoshipQuantity' : ((item && item.UsePoints) ? 'orderRewardQuantity' : 'orderQuantity'))];
    }

    increaseQuantiy(type, item) {
        this.cart1Service.increaseQuantiy(item, type == 'autoship', type == 'pack');
        this.updateQuantity(type, item, undefined);
    }

    decreaseQuantiy(type, item) {
        this.cart1Service.decreaseQuantiy(item, type == 'autoship', type == 'pack');
        this.updateQuantity(type, item, (item.Quantity === 0));
    }

    removeFromCart(type, item) {
        this.cart1Service.removeFromCart(item, type == 'autoship', type == 'pack', true);
        this.updateQuantity(type, item, true);
    }

    updateQuantity(type, item, remove) {
        // TODO:: this is bad remove this.
        if (!(type == 'autoship')) {
        }
    }

    closeCart() {
        if (this.itemsService.selectedAutoOrderItems.length === 0 && this.itemsService.selectedOrderItems.length === 0) {
            this.router.navigate(['/products/all']);
        }
    }
    frequencyDescription(id) {
        let Description: string;
        this.commonData.FrequencyTypes.forEach(element => {
            if (element.ID == id) {
                Description = element.Description;
            }
        });
        return Description;
    }

    checkQuantity(type, item) {
        const quantity = this.getQuantityModel(type, item)[item.ItemID];
        if (!Number(quantity)) {
            this.cart1Service.removeFromCart(item, type == 'autoship', type == 'pack', true);
        } else {
            if (!item.UsePoints) {
                item.Quantity = quantity;
            }
            else if (item.UsePoints) {
                item.rewardQuantity = quantity;
            }
            if (type == 'autoship') {
                localStorage.setItem('cart.autoship', JSON.stringify(this.itemsService.selectedAutoOrderItems));
                this.orderService.calculateAutoOrder();
            } else {
                localStorage.setItem((type == 'pack' ? 'cart.packs' : 'cart.order'),
                    JSON.stringify(type == 'pack' ? this.itemsService.selectedPacks : this.itemsService.selectedOrderItems));
                this.orderService.calculateOrder();
            }
        }
        this.updateQuantity(type, item, undefined);
    }

    getLastQuantity(type, item) {
        this.lastQuantity = this.getQuantityModel(type, item)[item.ItemID];
    }


}
