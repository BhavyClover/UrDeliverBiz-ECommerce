import { ShoppingCartService } from './../../shared/services/shopping-cart.service';
import { Custom } from './../../../modals/createorderautoorder.modal';
import { cloneDeep } from 'lodash';
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { Observable, of, pipe } from 'rxjs';
import { CartItem } from 'src/app/modals/cart-item';
import { ProductService } from '../../shared/services/product.service';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { Cart1Service } from '../../shared/services/cart1.service';
import { OrderService } from '../../shared/services/order.service';
import { PaymentService } from '../../shared/services/payment.service';
import { UserService } from '../../shared/services/user.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import * as _ from 'lodash';
import { NotificationService } from '../../shared/services/notification.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UtilityService } from '../../shared/services/utility.service';
import * as moment from 'moment';
import { ConfigService } from '../../shared/services/config.service';
import { CreateAutoOrder, CreateOrder, CreateOrderAndAutoShip, Item, OrderShippingAddress, Payment } from 'src/app/modals/createorderautoorder.modal';
import { ShipAddress } from 'src/app/modals/autoship.modal';
import { OrderCreditCard } from 'src/app/modals/enrollment.model';
import { OrderPipe } from 'ngx-order-pipe';
import { ConfirmDialogComponent } from '../../shared/model/confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddSymbolWithNumberPipe } from '../../shared/pipes/add-symbol-with-number.pipe';
import { ItemsListService } from '../../shared/services/itemsList.service';
import { PersistentService } from '../../shared/services/persistent.service';
import { AccountService } from '../../shared/services/account.service';
import { AllowCvvComponent } from '../../shared/model/allow-cvv/allow-cvv.component';
import { AutoshipConfigurationService } from '../../shared/services/autoshipConfiguration.service';
import { CompanyService } from '../../shared/services/company.service';
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  public cartItems: Observable<CartItem[]> = of([]);
  public buyProducts: CartItem[] = [];
  public commonData: any;
  removable = true;
  amount: number;
  payments: string[] = ['Create an Account?', 'Flat Rate'];
  paymantWay: string[] = ['Direct Bank Transfer', 'PayPal'];
  OrderQuantityCount: number = 10;
  public AutoOrdersData: any[] = [];
  selectedAutoship: any;
  AutoshipEditFlag: boolean = false;
  createOrderRequest: CreateOrderAndAutoShip;
  userService: UserServiceModal;
  selectedshipmethod: any = 1;
  isStateRestrict: boolean = false;
  isDisabledCreateOrder: boolean = false;
  constructor(
    public notificationService: NotificationService,
    public user: UserService,
    private titleService: Title,
    public paymentService: PaymentService,
    public translate: TranslateService,
    public cart1Service: Cart1Service,
    public orderService: OrderService,
    private cartService1: CartService,
    public itemsService: ProductService,
    public apiService: RestApiService,
    public utilityService: UtilityService,
    public configService: ConfigService,
    private dialog: MatDialog,
    private router: Router,
    private orderPipe: OrderPipe,
    public itemsListService: ItemsListService,
    public persistentService: PersistentService,
    public accountService: AccountService,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public companyService: CompanyService,
    public shoppingCartService: ShoppingCartService
  ) {
    this.userService = this.user.userServiceModal;
    this.commonData = this.configService.getConfig();
  }

  ngOnInit() {
    sessionStorage.setItem('IsEnrollment', null);
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_checkout') + ' | ' + text);
    });
    this.cartItems = this.cartService1.getItems();
    this.cartItems.subscribe(products => this.buyProducts = products);
    this.getTotal().subscribe(amount => this.amount = amount);
    this.persistentService.retailData.isNewAutoship = this.persistentService.retailData.isNewAutoship || false;
    this.selectedAutoship = this.persistentService.retailData.CurrentSelectedAutoOrder;
    if ((this.itemsService.selectedPacks.length + this.itemsService.selectedOrderItems.length + this.itemsService.selectedAutoOrderItems.length <= 0) && (!this.utilityService.getAutoshipEditFlag())) {
      this.notificationService.error('message_', 'your_order_cart_empty_select_atleast_one_item');
      this.router.navigate(['/products/all']);
    }

    if (this.userService.customerData.DefaultShippingAddress && !this.utilityService.isEmptyObject(this.userService.customerData.DefaultShippingAddress)) {
      this.user.setShippingAddress();
      if (this.utilityService.getAutoshipEditFlag()) {
        this.updateAddressWithAutoshipAddress();
      }
    }

    if (this.userService.isAddressChanged && this.userService.newshippingAddress && this.userService.newshippingAddress.Address && this.userService.newshippingAddress.ZipCode) {
      if (this.utilityService.getAutoshipEditFlag()) {
        if (this.userService.isEditAutoshipAddressChanged) {
          this.userService.newshippingAddress.FullName = this.userService.newshippingAddress.FirstName + ' ' + this.userService.newshippingAddress.LastName;
          this.userService.shippingAddress = cloneDeep(this.userService.newshippingAddress);
        } else {
          this.updateAddressWithAutoshipAddress();
        }
      } else {
        this.userService.newshippingAddress.FullName = this.userService.newshippingAddress.FirstName + ' ' + this.userService.newshippingAddress.LastName;
        this.userService.shippingAddress = cloneDeep(this.userService.newshippingAddress);
      }
    }

    if (this.userService.shippingMethods?.length > 0) {
      this.checkItems().then(() => {
      });
    } else {
      if (this.itemsService.selectedOrderItems.length) {
        this.checkItems().then(() => {
          this.orderService.calculateOrder().then(() => {
          });
        });
      }
      if (this.itemsService.selectedAutoOrderItems.length) {
        this.checkItems().then(() => {
          this.orderService.calculateAutoOrder().then(() => {
          });
        });
      }
    }

    if (this.utilityService.getAutoshipEditFlag()) {
      if (this.persistentService.retailData.SelectedAutoshipPayment) {
        const autoshipPayment = this.getPaymentByDisplayText(
          this.persistentService.retailData.SelectedAutoshipPayment.PaymentDisplay,
          this.persistentService.retailData.SelectedAutoshipPayment.PaymentTypeID
        );
        this.userService.paymentMethods = autoshipPayment ? [autoshipPayment] : [];
        if (this.userService.paymentMethods.length > 0) {
          this.userService.paymentMethods[0].CardType = this.userService.paymentMethods[0].Name,
            this.userService.paymentMethods[0].Last4 = this.userService.paymentMethods[0].Ending,
            this.userService.paymentMethods[0].ExpireMonth = this.persistentService.retailData.SelectedAutoshipPayment.ExpireMonth,
            this.userService.paymentMethods[0].ExpireYear = this.persistentService.retailData.SelectedAutoshipPayment.ExpireYear,
            this.userService.paymentMethods[0].Token = this.userService.paymentMethods[0].PaymentMethodID,
            this.userService.paymentMethods[0].BillingAddress = this.persistentService.retailData.SelectedAutoshipPayment.BillingAddress,
            this.userService.paymentMethods[0].BillingAddress2 = this.persistentService.retailData.SelectedAutoshipPayment.BillingAddress2,
            this.userService.paymentMethods[0].BillingCity = this.persistentService.retailData.SelectedAutoshipPayment.BillingCity,
            this.userService.paymentMethods[0].BillingCountry = this.persistentService.retailData.SelectedAutoshipPayment.BillingCountry,
            this.userService.paymentMethods[0].BillingState = this.persistentService.retailData.SelectedAutoshipPayment.BillingState,
            this.userService.paymentMethods[0].BillingZip = this.persistentService.retailData.SelectedAutoshipPayment.BillingZip;
        }
      }
      if (this.userService.paymentMethods.length == 0) {
        this.setDefaultPayment();
      }
      if (this.userService.paymentMethods.length > 0) {
        this.paymentService.selectedPaymentTypeName = this.userService.paymentMethods[0].CardType + ' ' + this.userService.paymentMethods[0].Last4;
      }
      localStorage.setItem('userService', JSON.stringify(this.userService));
    } else {
      this.setDefaultPayment();
    }

    if (Object.keys(this.userService.customerData).length && this.itemsService.selectedAutoOrderItems.length > 0) {
      this.getAutoOrders();
    }
    this.userService.isPaymentChanged = false;
    this.getfrequencyName();
  }

  public updateAddressWithAutoshipAddress() {
    this.userService.shippingAddress.FirstName = this.persistentService.retailData.AutoOrderShippingAddress.FirstName;
    this.userService.shippingAddress.LastName = this.persistentService.retailData.AutoOrderShippingAddress.LastName;
    this.userService.shippingAddress.Street1 = this.persistentService.retailData.AutoOrderShippingAddress.Address;
    this.userService.shippingAddress.Street2 = this.persistentService.retailData.AutoOrderShippingAddress.Address2;
    this.userService.shippingAddress.City = this.persistentService.retailData.AutoOrderShippingAddress.City;
    this.userService.shippingAddress.CountryCode = this.persistentService.retailData.AutoOrderShippingAddress.Country;
    this.userService.shippingAddress.Region = this.persistentService.retailData.AutoOrderShippingAddress.State;
    this.userService.shippingAddress.PostalCode = this.persistentService.retailData.AutoOrderShippingAddress.ZipCode;
  }

  setDefaultPayment() {
    this.paymentService.getPaymentType().then(() => {
      if (this.paymentService.PaymentTypeResponse['SaveMethods'] && this.paymentService.PaymentTypeResponse['SaveMethods'][0]) {
        this.addSavePayment(this.paymentService.PaymentTypeResponse['SaveMethods'][0]);
      }
    });
  }

  getPaymentByDisplayText(text, paymentmethodid) {
    let matchingPayment = null;
    this.paymentService.PaymentTypeResponse['SaveMethods'].some((method) => {
      try {
        let ending = method.Ending || method.CreditCardNumberDisplay || method.Last4 || method.Name;

        if (ending) {
          ending = ending.replace(/\*/g, '');
        }
        if (paymentmethodid == method.PaymentMethodID) {
          matchingPayment = method;
          return true;
        }
        if (!method.PaymentMethodID && ~text.indexOf(ending)) {
          matchingPayment = method;
          return true;
        }
      } catch (e) {
        console.error('Message', e);
        return true;
      }
    });
    return matchingPayment;
  }

  public getTotal(): Observable<number> {
    return this.cartService1.getTotalAmount();
  }
  getQuantityModel(type, item): any {
    return this.cart1Service[type == 'pack' ? 'packQuantity' : (type == 'autoship' ? 'autoshipQuantity' : ((item && item.UsePoints) ? 'orderRewardQuantity' : 'orderQuantity'))];
  }
  // Payment Section
  addSavePayment(paymentData) {
    if (!this.utilityService.isEmptyObject(this.paymentService.SelectedPaymentTypes) && (this.paymentService.SelectedPaymentTypes.MerchantId !== paymentData.MerchantId)) {
      this.userService.paymentMethods = [];
      this.userService.isPaymentChanged = true;
    }
    this.paymentService.SelectedPaymentTypes = paymentData;
    this.paymentService.selectedPaymentTypeName = this.paymentService.SelectedPaymentTypes.DisplayName;
    if (this.paymentService.SelectedPaymentTypes.CanSavePayments) {
      this.paymentService.OldSelectedPaymentType = this.paymentService.SelectedPaymentTypes;
      this.paymentService.getPaymentData(paymentData);
    } else {
      this.paymentService.oldSelectedPaymentTypeName = this.paymentService.selectedPaymentTypeName;
      this.userService.paymentMethods = [];
      const selectpay = {
        CardType: this.paymentService.SelectedPaymentTypes.CardType || this.paymentService.SelectedPaymentTypes.Name,
        Last4: this.paymentService.SelectedPaymentTypes.Ending,
        ExpireMonth: this.paymentService.SelectedPaymentTypes.Expires ? moment(this.paymentService.SelectedPaymentTypes.Expires).format('M') : 0,
        ExpireYear: this.paymentService.SelectedPaymentTypes.Expires ? moment(this.paymentService.SelectedPaymentTypes.Expires).format('YYYY') : 0,
        Token: this.paymentService.SelectedPaymentTypes.PaymentMethodId ? this.paymentService.SelectedPaymentTypes.PaymentMethodId : '',
        MerchantId: this.paymentService.SelectedPaymentTypes.MerchantId
      };
      this.userService.paymentMethods.push(selectpay);
    }
    localStorage.setItem('userService', JSON.stringify(this.userService));

  }

  getPaymentDescription(payment) {
    if (!payment) {
      return '';
    }
    if (payment.CreditCardTypeDescription === 'Unknown') {
      return payment.CreditCardTypeDescription;
    }
    const type = payment.CreditCardTypeDescription || payment.Name || payment.CardType;
    const numb = payment.CreditCardNumberDisplay || new AddSymbolWithNumberPipe().transform(payment.Ending, '*', 4, 11) ||
      new AddSymbolWithNumberPipe().transform(payment.Last4, '*', 4, 11);
    return type + ' ' + numb;
  }

  removeCardDetail(payment) {
    const messageText = this.translate.instant('confirm_delete_payment_info') + ' ' + this.getPaymentDescription(payment) + '?';
    const dialogRef1 = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: '',
        message: messageText,
        takeaction: this.translate.instant('Delete'),
        noaction: this.translate.instant('cancel'),
      },
      panelClass: '',
      disableClose: true,
      autoFocus: false

    });
    dialogRef1.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.deleteCreditCard(payment);
      }
    });
  }

  deleteCreditCard(payment) {
    const DeleteCreditCardRequest = {
      customerId: 0,
      merchantid: payment.MerchantId,
      paymentmethodid: payment.PaymentMethodId
    };
    this.apiService
      .deletePaymentMethod(DeleteCreditCardRequest).subscribe((result) => {
        try {
          if (parseInt(result.Status, 10) === 0) {
            if (this.paymentService.selectedPaymentTypeName == (payment.Name + ' ' + payment.Ending)) {
              this.paymentService.SelectedPaymentTypes = {};
              this.userService.paymentMethods = [];
              this.paymentService.selectedPaymentTypeName = '';
              this.paymentService.selectedPaymentTypeName = this.translate.instant('Add_Payment_Method');
            }
            this.notificationService.success('Success', this.translate.instant('successfully_deleted'));
            this.paymentService.getPaymentType();
          } else {
            this.notificationService.error('Error', (result.Message ? result.Message : this.translate.instant('not_remove')));
          }
        } catch (ex) {
          console.error('ex', ex);
        }
      }, (error) => {
        this.notificationService.error('Error', this.translate.instant('not_remove'));
      },
        () => {
        });
  }

  getCvv(result) {
    if (result) {
      this.placeOrder(result);
    } else {
      this.isDisabledCreateOrder = false;

    }
  }

  checkPlaceOrder() {
    if (this.user.checkIfUserAuthenticatedOrNot()) {
      const showCvv = '99'.split(',').filter((item) => {
        return item && item == this.paymentService.SelectedPaymentTypes.MerchantId;
      }).length;
      if (this.paymentService.SelectedPaymentTypes && Object.keys(this.paymentService.SelectedPaymentTypes).length &&
        this.userService.paymentMethods.length && (!this.isStateRestrict && (Object.keys(this.userService.shippingAddress).length > 0)) && (showCvv)) {
        // SHow Allow CVV Model Popup
        const dialogData = this.dialog.open(AllowCvvComponent, {
          disableClose: true,
          panelClass: 'allowCvvModel-dialog',
          autoFocus: false
        });
        dialogData.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.getCvv(dialogResult);
          }
        });
      } else {
        this.placeOrder();
      }
    }
    else {
      // Logout and go to login
      this.accountService.logout();
      this.router.navigate(['/login']);
    }
  }


  placeOrder(dataCvvCode?: any) {
    const placeOrderPromise = new Promise((resolve, reject) => {
      if (this.itemsService.selectedAutoOrderItems.length > 0 && false) {
        this.notificationService.error('error_', 'choose_frequency_sidecart');
        this.isDisabledCreateOrder = false;
        return;
      }

      if (this.userService.newUser && this.itemsService.selectedAutoOrderItems.length == 0) {
        this.notificationService.error('error_', 'autoship_required_msg');
        this.isDisabledCreateOrder = false;
        return;
      }
      if (this.userService.paymentMethods.length > 0) {
        if (this.userService.paymentMethods[0].Last4 || this.userService.paymentMethods[0].Last4 === undefined) {
        } else {
          this.notificationService.error('error_', 'shop_please_add_payment');
          this.isDisabledCreateOrder = false;
          return;
        }
      } else {
        this.notificationService.error('error_', 'shop_please_add_payment');
        this.isDisabledCreateOrder = false;
        return;
      }

      if (this.isStateRestrict || (!Object.keys(this.userService.shippingAddress).length) || (!this.userService.shippingAddress.FirstName || !this.userService.shippingAddress.LastName || !this.userService.shippingAddress.Street1 || !this.userService.shippingAddress.PostalCode)) {
        this.notificationService.error('error_', 'please_add_address');
        this.isDisabledCreateOrder = false;
        return;
      }
      const productdetails: Array<Item> = [];
      _.each(this.itemsService.selectedOrderItems, (item) => {
        productdetails.push({
          ItemId: item.ItemID,
          IsReward: false,
          Quantity: !item.UsePoints ? item.Quantity : item.rewardQuantity
        });
      });

      const autoshipproductdetails: Array<Item> = [];
      _.each(this.itemsService.selectedAutoOrderItems, (item) => {
        if (parseInt(item.Quantity, 10) > 0) {
          autoshipproductdetails.push({
            ItemId: item.ItemID,
            IsReward: false,
            Quantity: item.Quantity
          });
        }
      });
      this.createOrderRequest = {
        customerId: 0,
        createOrder: {
          ShippingAddress: {
            Line1: this.userService.shippingAddress.Street1 || '770 E Main',
            Line2: this.userService.shippingAddress.Street2 || 'Test',
            State: this.userService.shippingAddress.Region || 'UT',
            City: this.userService.shippingAddress.City || 'Lehi',
            Zip: this.userService.shippingAddress.PostalCode || '84042',
            CountryCode: this.userService.shippingAddress.CountryCode || 'US'
          } as OrderShippingAddress,
          CountryCode: this.userService.shippingAddress.CountryCode,
          Attention: 'No Attention Needed',
          CouponCodes: null,
          CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
          FirstName: this.userService.shippingAddress.FirstName,
          Items: productdetails,
          LastName: this.userService.shippingAddress.LastName,
          OrderType: 1,
          PartyId: 0,
          Payments: [{
            CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
            MerchantId: this.userService.paymentMethods[0].MerchantId,
            OnFileCard: '',
            OrderCreditCard: {
              CardToken: this.userService.paymentMethods[0].Token,
              NameOnCard: this.userService.paymentMethods[0].billingInfo && this.userService.paymentMethods[0].billingInfo.fullName || '',
              Last4: this.userService.paymentMethods[0].Last4,
              CardType: this.userService.paymentMethods[0].CardType,
              ExpirationMonth: this.userService.paymentMethods[0].ExpireMonth || 1,
              ExpirationYear: this.userService.paymentMethods[0].ExpireYear,
            } as OrderCreditCard,
            SavePayment: true,
            SavePaymentMethodId: this.userService.paymentMethods[0].Token,
          }] as Array<Payment>,
          Phone: this.userService.shippingAddress.Phone,
          PriceGroup: this.userService.customerTypeID,
          ShipMethodId: this.userService.selectedShippingMethod || 1,
          SpecialInstructions: 'No Instruction',
          StoreId: this.shoppingCartService.getShoppingCart(1)[0]?.StoreID,
          WarehouseId: 1,
          Custom: null
        } as CreateOrder,
      } as CreateOrderAndAutoShip;

      if (autoshipproductdetails.length > 0) {
        this.createOrderRequest.createAutoOrder = {
          ShipMethodId: this.userService.selectedShippingMethod || 1,
          Frequency: this.persistentService.retailData.Autoship.FrequencyTypeDescription || 'Monthly',
          Items: autoshipproductdetails,
          MerchantId: this.userService.paymentMethods[0].MerchantId,
          PaymentMerchantId: this.userService.paymentMethods[0].MerchantId,
          PaymentMethodId: this.userService.paymentMethods[0].Token,
          ShipAddress: {
            Street1: this.userService.shippingAddress.Street1 || '770 E Main',
            Street2: this.userService.shippingAddress.Street2 || 'Test',
            Region: this.userService.shippingAddress.Region || 'UT',
            City: this.userService.shippingAddress.City || 'Lehi',
            PostalCode: this.userService.shippingAddress.PostalCode || '84042',
            CountryCode: this.userService.shippingAddress.CountryCode || 'US'
          } as ShipAddress,
          ShippingAddress: {
            Street1: this.userService.shippingAddress.Street1 || '770 E Main',
            Street2: this.userService.shippingAddress.Street2 || 'Test',
            Region: this.userService.shippingAddress.Region || 'UT',
            City: this.userService.shippingAddress.City || 'Lehi',
            PostalCode: this.userService.shippingAddress.PostalCode || '84042',
            CountryCode: this.userService.shippingAddress.CountryCode || 'US'
          } as ShipAddress,
          StartDate: this.autoshipConfigurationService.autoshipDate,
        } as CreateAutoOrder;

        if (!this.persistentService.retailData.isNewAutoship) {
          this.createOrderRequest.createAutoOrder.Custom = {
            AutoShipId: this.selectedAutoship || 0
          } as Custom;
        }
      }
      this.createOrderRequest.createOrder.PartyId = this.utilityService.getQueryParam('partyid') || localStorage.getItem('partyId') || 0;
      this.apiService.createCustomerOrderAndAutoship(this.createOrderRequest).subscribe((result) => {
        this.isDisabledCreateOrder = false;
        if (result.ErrorMessage === 'CreateOrder_Failed') {
          const whichCard = result.Index === '0' ? 'First' : 'Second';
          const message = whichCard + ' Card failed with Amount: ' + result.Amount;
          this.notificationService.error('error_', this.translate.instant(message));
          reject(this.translate.instant(message));
          return;
        }

        if (result.ErrorMessage === 'invalid_credit_card') {
          this.notificationService.error('error_', this.translate.instant(result.ErrorMessage));
          reject(this.translate.instant(result.ErrorMessage));
          return;
        }

        if (!result.Order?.OrderId && !result.AutoOrder?.AutoorderId) {
          this.notificationService.error('error_', this.translate.instant(result.ErrorMessage));
          reject(this.translate.instant(result.ErrorMessage));
          return;
        }

        result.OrderID = (result.Order?.OrderID || result.Order?.OrderId);
        result.AutoOrderId = (result.AutoOrder?.AutoOrderID || result.AutoOrder?.AutoorderId);
        if (result.OrderID > 0 || result.AutoOrderId > 0) {
          this.userService.newUser = false;
          try {

          }
          catch (ex) {
            console.warn('ex', ex);
          }
          localStorage.setItem('SubmitApplication', JSON.stringify(result));
          this.utilityService.setAutoshipEditFlag(false);
          this.persistentService.retailData.isChanged = true;
          this.userService.isAddressChanged = false;
          this.userService.isPaymentChanged = false;
          this.userService.isShipMethodChanged = false;
          this.persistentService.retailData.isNewAutoship = false;
          this.persistentService.retailData.editAutoshipItems = [];
          if (result.Order?.Redirect && result.Order.RedirectUrl && result.Order.RedirectUrl.length > 0) {
            window.location = result.Order.RedirectUrl;
          }
          if (result.AutoOrder?.Redirect && result.AutoOrder.RedirectUrl && result.AutoOrder.RedirectUrl.length > 0) {
            window.location = result.AutoOrder.RedirectUrl;
          }
          this.router.navigate(['/complete']);
        }
        resolve(result);
      }, (error) => {
        reject(this.translate.instant('some_error_occur_try_again'));
        this.isDisabledCreateOrder = false;
        this.notificationService.error('error_', this.translate.instant('some_error_occur_try_again'));
      }, () => { });
    });
    return placeOrderPromise;
  }

  showBirthWarnings() {
    const orderItem = this.itemsService.selectedOrderItems.some((item) => {
      return item.FlagCancer || item.FlagBirthDefects;
    });
    const autoshipItem = this.itemsService.selectedAutoOrderItems.some((item) => {
      return item.FlagCancer || item.FlagBirthDefects;
    });
    if ((orderItem || autoshipItem) && this.configService.localSettings.Global.ShowBirthWarning) {
      return true;
    } else {
      return false;
    }
  }
  showCancerWarnings() {
    const orderItem = this.itemsService.selectedOrderItems.some((item) => {
      return item.FlagCancer || item.FlagBirthDefects;
    });
    const autoshipItem = this.itemsService.selectedAutoOrderItems.some((item) => {
      return item.FlagCancer || item.FlagBirthDefects;
    });
    if ((orderItem || autoshipItem) && this.configService.localSettings.Global.ShowCancerWarning) {
      return true;
    } else {
      return false;
    }

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
    if (!this.utilityService.getAutoshipEditFlag()) {
    }
  }
  getAutoOrders() {
    this.apiService.getCustomerAutoships(this.userService.customerData.CustomerId).subscribe((result: any) => {
      try {
        if (Number(result.Status) === 0) {
          if (result.Data && result.Data.length > 0) {
            this.AutoOrdersData = this.orderPipe.transform(result.Data, 'AutoShipID', true);
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

  changeSelectedAutosipId(id: any) {
    this.selectedAutoship = id;
  }

  backStep() {
    this.router.navigate(['/products/all']);
  }

  isAutoshipChanged() {
    if (!moment(this.autoshipConfigurationService.autoshipDate).isSame(this.autoshipConfigurationService.autoshipDate, 'day')) {
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
        if (_.isEqual(this.persistentService.retailData.editAutoshipItems, this.itemsService.selectedAutoOrderItems) && this.itemsService.selectedOrderItems.length == 0) {
          return false;
        }
        return true;
      }
      return false;
    }
    return true;
  }

  validatePromoCode() {
    if (this.userService.couponInfo.promoCode) {
      if (this.userService.couponInfo.availableRewards.length > 0) {
        _.each(this.userService.couponInfo.availableRewards, (avlreward) => {
          if (avlreward.Code.toLowerCase() == this.userService.couponInfo.promoCode.toLowerCase()) {
            this.userService.couponInfo.RewardsForUse.push(avlreward);
          }
        });
      }
    }
    this.userService.couponInfo.IsAppliedcode = true;
    this.orderService.calculateOrder().then((result: any) => {
      if (result && this.userService.couponInfo.promoCode) {
        _.each(this.orderService.calculateOrderResponse.CouponResults, (item) => {
          const isInCart = this.userService.couponInfo.Allcoupons.some((code) => {
            if (code.toLowerCase() == item.Code.toLowerCase()) {
              return true;
            }
            return false;
          });

          if (item.IsValid) {
            if (!isInCart) {
              this.userService.couponInfo.Allcoupons.push(item.Code);
            }
            if (this.userService.couponInfo.promoCode == item.Code) {
              this.notificationService.success('success', 'coupon_added_success');
            }
            this.userService.couponInfo.promoCodeValid = true;
            this.userService.couponInfo.promoCode = '';
          } else {
            this.userService.couponInfo.promoCodeValid = false;
            this.userService.couponInfo.IsAppliedcode = false;
            this.userService.couponInfo.promoCode = '';
            if (isInCart && this.itemsService.selectedOrderItems.length) {
              this.userService.couponInfo.Allcoupons = this.userService.couponInfo.Allcoupons.filter((code) => {
                return code.toLowerCase() != item.Code.toLowerCase();
              });
              this.userService.couponInfo.RewardsForUse = this.userService.couponInfo.RewardsForUse.filter((e) => {
                return e.Code.toLowerCase() != item.Code.toLowerCase();
              });
            }
          }
        });
      }
    });
  }

  promoShowHide() {
    let isExitCoupon = [];
    if (this.orderService.calculateOrderResponse.CouponResults != null) {
      isExitCoupon = this.orderService.calculateOrderResponse.CouponResults.filter((Coupon: any) => {
        if (Coupon.Code === 'NewCustomerPromo_' + this.userService.customerData.BackOfficeId) {
          return Coupon.Code;
        } else if (Coupon.IsValid && (Coupon.Code === this.userService.DynamicCouponCode.promoCode)) {
          return Coupon.Code;
        }
      });
    }
    if (isExitCoupon.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  removePromo(code) {
    this.userService.couponInfo.RewardsForUse = _.reject(this.userService.couponInfo.RewardsForUse, (e) => {
      return e.Code.toLowerCase() == code.toLowerCase();
    });
    this.userService.couponInfo.promoCode = '';
    this.userService.couponInfo.promoCodeValid = true;
    this.userService.couponInfo.IsAppliedcode = false;
    this.userService.couponInfo.Allcoupons = _.without(this.userService.couponInfo.Allcoupons, code);
    this.orderService.calculateOrder();
  }

  isCouponCode(Coupon) {
    const NewCustomerPromo = 'NewCustomerPromo_' + this.userService.customerData.BackOfficeId;
    if (Coupon.Code === NewCustomerPromo) {
      return false;
    } else if (Coupon.Code === this.userService.DynamicCouponCode.promoCode) {
      return false;
    } else {
      return true;
    }
  }

  updateShipmethod(shipmethodID) {
    this.userService.selectedShippingMethod = shipmethodID;
    if (this.itemsService.selectedOrderItems.length > 0) {
      this.orderService.calculateOrder();
    }
    if (this.itemsService.selectedAutoOrderItems.length) {
      this.orderService.calculateAutoOrder();
    }
  }

  checkItems() {
    const promise = new Promise((resolve, reject) => {
      if (this.userService.checkItems) {
        this.itemsListService.checkRestrictedState('', '', true, true, 0, false, '', true, false).then(() => {
          if (this.userService.shippingAddress.Region) {
            _.each(this.userService.restrictedStates, (state) => {
              if ((state).toLowerCase() === (this.userService.shippingAddress.Region).toLowerCase()) {
                this.isStateRestrict = true;
              }
            });
          }
          resolve(true);
        });
      } else {
        if (this.userService.shippingAddress.Region) {
          _.each(this.userService.restrictedStates, (state) => {
            if ((state).toLowerCase() === (this.userService.shippingAddress.Region).toLowerCase()) {
              this.isStateRestrict = true;
            }
          });
        }
        if (this.itemsService.selectedOrderItems.length) {
          this.orderService.calculateOrder();
        }
        if (this.itemsService.selectedAutoOrderItems.length) {
          this.orderService.calculateAutoOrder();
        }
      }
    });
    return promise;
  }

  getfrequencyName() {
    return { frequency: this.persistentService.retailData.Autoship.FrequencyTypeDescription };
  }

}
