import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { PaymentService } from '../../shared/services/payment.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UserService } from '../../shared/services/user.service';
import { OrderInvoiceComponent } from '../order-invoice/order-invoice.component';
import { UtilityService } from '../../shared/services/utility.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { OrderService } from '../../shared/services/order.service';
import { Cart1Service } from '../../shared/services/cart1.service';
import { AutoshipConfigurationService } from '../../shared/services/autoshipConfiguration.service';
import { AccountService } from '../../shared/services/account.service';
import { OrderPipe } from 'ngx-order-pipe';
import { PersistentService } from '../../shared/services/persistent.service';

@Component({
  selector: 'app-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss']
})
export class CompleteComponent implements OnInit, OnDestroy {
  public userService: UserServiceModal;
  isShowPassword: boolean = false;
  IsApplication: boolean = false;
  userEnrollmentDetail: any = {};
  SubmitApplicationResponse: any = {};
  isEnrollGuest: boolean = false;
  passwordLength: any = [];
  guest: any;
  selectedAutoship: any;
  selectedAutoshipID: any;
  public AutoOrdersData: any[] = [];
  constructor(
    private translate: TranslateService,
    private titleService: Title,
    private router: Router,
    private matDailog: MatDialog,
    public user: UserService,
    public paymentService: PaymentService,
    public apiService: RestApiService,
    public utilityService: UtilityService,
    public orderService: OrderService,
    public cart1Service: Cart1Service,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public accountService: AccountService,
    private orderPipe: OrderPipe,
    public persistentService: PersistentService,
  ) {
    this.userService = this.user.userServiceModal;
    this.getAutoOrders();
  }
  ngOnInit(): void {
    this.guest = JSON.parse(localStorage.getItem('guestLogin'));
    this.userEnrollmentDetail = JSON.parse(localStorage.getItem('SubmitApplication'));
    this.IsApplication = sessionStorage.getItem('IsEnrollment') == 'true' ? true : false;
    // clear cart and order details
    this.orderService.calculateOrderResponse = {};
    // clear last requests
    this.orderService.resetLastRequests();
    this.cart1Service.clearCart();
    if (localStorage.getItem('SubmitApplication') && JSON.parse(localStorage.getItem('SubmitApplication'))) {
      if (this.IsApplication) {
        let Response: any = {};
        Response = JSON.parse(localStorage.getItem('SubmitApplication'));
        this.SubmitApplicationResponse = {
          OrderID: Response?.OrderStatus?.OrderNumber,
          AutoOrderId: Response?.AutoOrderStatus?.OrderNumber
        };
      }
      else {
        this.SubmitApplicationResponse = JSON.parse(localStorage.getItem('SubmitApplication'));
      }
    } else {
      this.SubmitApplicationResponse = {};
    }

    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_complete') + ' | ' + text);
    });
    this.passwordLength.length = this.userService.webOffice && this.userService.webOffice.Password && this.userService.webOffice.Password.length || 8;
  }
  ngOnDestroy(): void {
    if (this.guest != 'false' && this.guest) {
      localStorage.setItem('IsMarketCountrySelected', 'false');
      localStorage.removeItem('LiveState');
      localStorage.removeItem('SubmitApplication');
      localStorage.removeItem('guestLogin');
      localStorage.removeItem('selectedCountry');
      localStorage.removeItem('commonSetting');
      this.paymentService.PaymentTypeResponse = [];
      this.paymentService.PaymentDataResponse = {};
      this.paymentService.selectedPaymentTypeName = '';
      this.paymentService.SelectedPaymentTypes = {};
      this.paymentService.OldSelectedPaymentType = {};
      this.paymentService.AllowedMethods = [];
      this.paymentService.SaveMethods = [];
      this.resetUserService_updateEnrollerInfo();
    }
    this.autoshipConfigurationService.autoshipDate = '';
    if (this.IsApplication) {
      this.resetUserService_updateEnrollerInfo();
      this.paymentService.clearPayment();
      sessionStorage.removeItem('IsEnrollment');
    }
  }


  goToProduct() {
    if (this.IsApplication) {
      this.resetUserService_updateEnrollerInfo();
      this.paymentService.clearPayment();
      sessionStorage.removeItem('IsEnrollment');
      sessionStorage.getItem('IsLegacyUnifiedEnrollment');
    }
    localStorage.setItem('IsMarketCountrySelected', 'false');
    this.userService.couponInfo.RewardsForUse = [];
    this.userService.couponInfo.promoCode = '';
    this.userService.couponInfo.promoCodeValid = false;
    this.userService.couponInfo.IsAppliedcode = false;
    this.userService.couponInfo.Allcoupons = [];
    this.autoshipConfigurationService.autoshipDate = '';
    if (!this.IsApplication) {
      this.userService.newshippingAddress = {};
      this.userService.restrictedStates = [];
      this.accountService.getCustomerData(this.userService.customerData.CustomerId).then((data: any) => {
        try {
          if (!this.utilityService.isEmptyObject(this.userService.customerData.DefaultShippingAddress)) {
            this.user.setShippingAddress();
          } else {
            this.userService.shippingAddress = null;
          }
          this.router.navigate(['/products/all']);

        } catch (ex) {
          this.router.navigate(['/products/all']);
        }
      })
        .catch((error) => {
          console.log('error', error);
        });
    }
    else {
      this.router.navigate(['/products/all']);
    }

  }

  resetUserService_updateEnrollerInfo() {
    const enrollerInfo = this.userService.enrollerInfo;
    if (!this.userService.customerData.CustomerId) {
      this.user.setDefault();
    }
    this.userService.enrollerInfo = enrollerInfo;
    localStorage.setItem('userService', JSON.stringify(this.userService));
  }

  showOrderInvoice(dialogData?: any) {
    const dialogRef = this.matDailog.open(OrderInvoiceComponent, {
      panelClass: 'invoiceDialog',
      data: { OrderNumber: dialogData },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      const result = dialogResult;
    });
  }

  showAutoOrderInvoice() {
    this.router.navigate(['/manageautoship']);
  }
  getAutoOrders() {
    this.apiService.getCustomerAutoships(this.userService.customerData.CustomerId).subscribe((result: any) => {
      try {
        if (Number(result.Status) === 0) {
          if (result.Data && result.Data.length > 0) {
            this.AutoOrdersData = this.orderPipe.transform(result.Data, 'AutoShipID', true);
            this.selectedAutoshipID = result.Data[0].AutoShipID;
            // Show selected Autoship in dropdown
            this.selectedAutoship = this.persistentService.retailData.CurrentSelectedAutoOrder || this.AutoOrdersData[0].AutoShipID;
          }
        }
      } catch (ex) {
        console.error('ex', ex);
      }
    }, (error) => {
      this.AutoOrdersData = [];
    }, () => { });
  }
}
