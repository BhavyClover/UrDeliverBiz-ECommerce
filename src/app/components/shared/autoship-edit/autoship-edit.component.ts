import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { Cart1Service } from '../services/cart1.service';
import { ConfigService } from '../services/config.service';
import { NotificationService } from '../services/notification.service';
import { OrderService } from '../services/order.service';
import { PaymentService } from '../services/payment.service';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';
import { UtilityService } from '../services/utility.service';
import { PersistentService } from '../services/persistent.service';
import { Router } from '@angular/router';
import { Item, CreateAutoOrder } from 'src/app/modals/createorderautoorder.modal';
import { ShipAddress } from 'src/app/modals/autoship.modal';
import { AccountService } from '../services/account.service';
import { AutoshipConfigurationService } from '../services/autoshipConfiguration.service';
import { RestApiService } from '../services/restapi.service';
import { ConfirmDialogComponent } from '../model/confirm-dialog/confirm-dialog.component';
import { ShipMethodsComponent } from '../model/ship-methods/ship-methods.component';
import { ShippingAddressDialogComponent } from '../model/shipping-address-dialog/shipping-address-dialog.component';
import { AllowCvvComponent } from '../model/allow-cvv/allow-cvv.component';
import { AddSymbolWithNumberPipe } from '../pipes/add-symbol-with-number.pipe';
import { CompanyService } from '../services/company.service';

@Component({
  selector: 'app-autoship-edit',
  templateUrl: './autoship-edit.component.html',
  styleUrls: ['./autoship-edit.component.scss']
})
export class AutoshipEditComponent implements OnInit {
  userService: UserServiceModal;
  AutoOrderShippingAddress: any = {};
  editingAutoship: any = {};
  autoshipDate: any;
  autoShipId: number = 0;
  SelectedAutoshipPayment: any = {};
  selectedAutoship: any;
  autoshipDetail: any = {};
  IsMultipleFrequency: boolean = true;
  isStateRestrict: boolean = false;
  commonData: any = {};
  autoshipConfiguration: any = {
    setting: {
      disableEdit: false
    }
  };
  frequencyTypeID: number = 1;
  isDisabledCreateOrder: boolean = false;
  @Output() onAutoshipCancel = new EventEmitter<any>();
  item: any = {};
  getAutoshipOrderDetail: any;
  AutoshipSetting = [];
  lastQuantity: any;
  address: any;
  addressChanged: boolean;
  selectedShipMethodName: string;
  updateAutoOrderRequest: CreateAutoOrder;
  public AutoshipMinDate: Date;
  public AutoshipMaxDate: Date;
  constructor(
    public dialog: MatDialog,
    public configService: ConfigService,
    public notificationService: NotificationService,
    public apiService: RestApiService,
    public translate: TranslateService,
    public itemsService: ProductService,
    public cart1Service: Cart1Service,
    public orderService: OrderService,
    public user: UserService,
    public paymentService: PaymentService,
    public utilityService: UtilityService,
    public persistentService: PersistentService,
    public router: Router,
    public accountService: AccountService,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public companyService: CompanyService
  ) {
    this.userService = user.userServiceModal;
    this.getAutoshipOrderDetail = this.persistentService.retailData.getAutoOrderDetailsByID;
    this.AutoshipMinDate = moment().add(this.configService.localSettings.Autoship.AutoshipMinDate, 'days').toDate();
    this.AutoshipMaxDate = moment().add(this.configService.localSettings.Autoship.AutoshipMaxDate, 'days').toDate();
  }

  ngOnInit(): void {
    this.commonData = this.configService.getConfig();
    this.userService.isAddressChanged = this.userService.isAddressChanged || false;
    this.userService.isPaymentChanged = this.userService.isPaymentChanged || false;
    this.userService.isShipMethodChanged = this.userService.isShipMethodChanged || false;
    this.address = this.address || {};
    this.persistentService.retailData.isChanged = this.persistentService.retailData.AddMoreItemInAutoshipFlag || false;
    // Select Autoship Types
    this.persistentService.retailData.isNewAutoship = this.persistentService.retailData.isNewAutoship || false;

    // Show selected Autoship in dropdown
    this.selectedAutoship = this.persistentService.retailData.CurrentSelectedAutoOrder;
    // Get Saved & Allowed Payment Methods
    this.persistentService.retailData.IsPaid = false;
    this.paymentService.getPaymentType().then(() => {
      if (!this.persistentService.retailData.AddMoreItemInAutoshipFlag) {
        this.editAutoship();
      } else {
        this.getAutoshipOrderDetail = this.persistentService.retailData.AddMoreItemInAutoshipData;
        this.frequencyTypeID = this.persistentService.retailData.Autoship.FrequencyTypeID;
        this.editingAutoship.AutoOrderID = this.persistentService.retailData.AddMoreItemInAutoshipData.id;
        if (this.userService.paymentMethods.length > 0) {
          const paymentData = this.userService.paymentMethods[0];
          this.paymentService.selectedPaymentTypeName = (paymentData.DisplayName || paymentData.CardType) +
            ' ' +
            (paymentData.Ending ? paymentData.Ending : (paymentData.Last4 ? paymentData.Last4 : '')) || this.translate.instant('add_a_payment_method');
        }
        this.orderService.calculateAutoOrder();
      }
    });
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  editAutoship() {
    this.autoShipId = this.getAutoshipOrderDetail.id;
    this.itemsService.selectedAutoOrderItems = [];
    this.persistentService.retailData.IsPaid = this.getAutoshipOrderDetail.isPaid;
    this.persistentService.retailData.CurrentSelectedAutoOrder = this.getAutoshipOrderDetail.id;

    // Initial steps of Payment Functionality
    this.persistentService.retailData.SelectedAutoshipPayment = {};
    this.paymentService.selectedPaymentTypeName = this.translate.instant('Add_Payment_Method');
    this.userService.paymentMethods = [];
    this.paymentService.SelectedPaymentTypes = {};

    const AutoOrderId = this.getAutoshipOrderDetail.id;

    this.apiService.getAutoship(AutoOrderId).subscribe((result) => {
      if (!result.Data || result.Data.AutoShipID <= 0) {
        this.notificationService.error('Error', this.translate.instant('some_error_occur_try_again'));
        return false;
      }
      this.persistentService.retailData.Autoship = {};
      this.editingAutoship = result.Data;
      this.autoshipDetail = result.Data;

      // Fill Shipping Address on only Temp basis while editing autoship
      this.AutoOrderShippingAddress = {};
      this.AutoOrderShippingAddress.FirstName = this.editingAutoship.ShipAddress.FirstName;
      this.AutoOrderShippingAddress.LastName = this.editingAutoship.ShipAddress.LastName;
      this.AutoOrderShippingAddress.Address = this.editingAutoship.ShipAddress.Street1;
      this.AutoOrderShippingAddress.Address2 = this.editingAutoship.ShipAddress.Street2;
      this.AutoOrderShippingAddress.City = this.editingAutoship.ShipAddress.City;
      this.AutoOrderShippingAddress.State = this.editingAutoship.ShipAddress.Region;
      this.AutoOrderShippingAddress.Country = this.editingAutoship.ShipAddress.CountryCode;
      this.AutoOrderShippingAddress.ZipCode = this.editingAutoship.ShipAddress.PostalCode;

      // Fill Start Date
      // **In case of edit an Autoship, We will show next run date as start date by default */
      this.autoshipConfigurationService.autoshipDate = this.editingAutoship.NextProcessDate || this.editingAutoship.StartDate;
      this.persistentService.retailData.autoshipDate = this.editingAutoship.NextProcessDate || this.editingAutoship.StartDate;

      this.persistentService.retailData.Autoship.Frequency = this.editingAutoship.Frequency;
      this.persistentService.retailData.Autoship.FrequencyTypeDescription = this.editingAutoship.FrequencyString;
      this.frequencyTypeID = this.persistentService.retailData.Autoship.FrequencyTypeID = this.editingAutoship.Frequency;
      this.autoshipConfigurationService.setting = {
        autoshipSettings: {
          frequencyTypeID: this.editingAutoship.Frequency
        }
      };

      // If NextRun Date is Past Date, set it to default Autoship date
      if (new Date(this.autoshipConfigurationService.autoshipDate) < new Date()) {
        this.autoshipConfigurationService.autoshipDate = '';
      }

      this.userService.selectedShippingMethod = this.editingAutoship.ShipMethodID;
      if (this.AutoOrderShippingAddress || Object.keys(this.AutoOrderShippingAddress).length > 0) {
        this.userService.shippingAddress.FirstName = this.editingAutoship.ShipAddress.FirstName;
        this.userService.shippingAddress.LastName = this.editingAutoship.ShipAddress.LastName;
        this.userService.shippingAddress.Street1 = this.editingAutoship.ShipAddress.Street1;
        this.userService.shippingAddress.Street2 = this.editingAutoship.ShipAddress.Street2;
        this.userService.shippingAddress.City = this.editingAutoship.ShipAddress.City;
        this.userService.shippingAddress.Region = this.editingAutoship.ShipAddress.Region;
        this.userService.shippingAddress.CountryCode = this.editingAutoship.ShipAddress.CountryCode;
        this.userService.shippingAddress.PostalCode = this.editingAutoship.ShipAddress.PostalCode;
      }
      let bvTotal = 0;
      _.each(result.Data.LineItems, (item) => {
        item.AutoOrderID = result.Data.AutoShipID;
        item.ItemID = item.ItemID.toString();
        item.Description = item.ItemDescription || item.Description;
        item.ItemName = item.ItemDescription || item.ProductName;
        item.Price = item.PriceEach || item.Prices[0].Price || item.Price;
        item.PV = item.BVEach || item.QV;
        item.BusinessVolumeEach = item.PV || item.CV;
        item.ImageUrl = item.Image;
        item.SmallImageUrl = item.SmallPicture || item.Image;
        item.LargeImageUrl = item.SmallPicture || item.Image;
        item.ShortDescription = item.ShortDetail || item.Specifications;
        item.isAutoship = true;
        item.OptionsMap = [];
        this.itemsService.selectedAutoOrderItems.push(item);
        bvTotal += Number(item.BV * item.Quantity);
      });
      _.each(this.itemsService.selectedAutoOrderItems, (item) => {
        _.each(this.itemsService.orders, (listItem) => {
          if (item.ItemID == listItem.ItemID) {
            item.AllowAutoship = listItem.AllowAutoship;
          } else if (listItem.HasOptions) {
            const optionMap = listItem.OptionsMap;
            _.each(listItem.OptionsMap, (value) => {
              if (value.ItemId == item.ItemID) {
                item.AllowAutoship = value.AllowAutoship == undefined ? listItem.AllowAutoship : value.AllowAutoship;
              }
            });
          }
        });
      });
      localStorage.setItem('cart.autoship', JSON.stringify(this.itemsService.selectedAutoOrderItems));

      // payment details for autoorder
      this.persistentService.retailData.SelectedAutoshipPayment.PaymentTypeID = this.editingAutoship.PaymentMethodID;
      if (this.paymentService.PaymentTypeResponse['SaveMethods'].length > 0) {
        if (this.persistentService.retailData.SelectedAutoshipPayment.PaymentTypeID) {

          const selectedAutoOrderPay = _.filter(this.paymentService.PaymentTypeResponse['SaveMethods'], (paymentMethod) => {
            return paymentMethod.PaymentMethodId == this.persistentService.retailData.SelectedAutoshipPayment.PaymentTypeID;
          })[0];

          if (selectedAutoOrderPay) {
            this.persistentService.retailData.SelectedAutoshipPayment = selectedAutoOrderPay;
            this.paymentService.SelectedPaymentTypes = selectedAutoOrderPay;
            this.paymentService.selectedPaymentTypeName =
              (selectedAutoOrderPay.DisplayName || selectedAutoOrderPay.CardType) +
              ' ' +
              (selectedAutoOrderPay.Ending ? selectedAutoOrderPay.Ending : '') || this.translate.instant('add_a_payment_method');
            const selectpay = {
              CardType: this.paymentService.SelectedPaymentTypes.CardType,
              Last4: this.paymentService.SelectedPaymentTypes.Ending,
              ExpireMonth: this.paymentService.SelectedPaymentTypes.Expires ? moment(this.paymentService.SelectedPaymentTypes.Expires).format('M') : 0,
              ExpireYear: this.paymentService.SelectedPaymentTypes.Expires ? moment(this.paymentService.SelectedPaymentTypes.Expires).format('YYYY') : 0,
              Token: this.paymentService.SelectedPaymentTypes.PaymentMethodId ? this.paymentService.SelectedPaymentTypes.PaymentMethodId : '',
              MerchantId: this.paymentService.SelectedPaymentTypes.MerchantId
            };
            this.userService.paymentMethods.push(selectpay);

            localStorage.setItem('userService', JSON.stringify(this.userService));
          } else {
            this.setDefaultAutoshipPayment();
          }

        } else {
          this.setDefaultAutoshipPayment();
        }
      } else {
        this.persistentService.retailData.SelectedAutoshipPayment = [];
        this.paymentService.selectedPaymentTypeName = this.translate.instant('Add_Payment_Method');

        localStorage.setItem('userService', JSON.stringify(this.userService));
      }
      this.cart1Service.setQuantiy();

      this.orderService.calculateAutoOrder().then(() => {
        this.orderService.calculateAutoOrderResponse['BusinessVolumeTotal'] = this.editingAutoship.TotalCV;
      });

      this.persistentService.retailData.editAutoshipItems = cloneDeep(this.itemsService.selectedAutoOrderItems);
      this.utilityService.setAutoshipEditFlag(true);
      this.autoshipConfigurationService.init();
    }, (error) => {
      console.warn('error', error);
    }, () => {

    });
  }

  getLastQuantity(type, item) {
    this.lastQuantity = this.getQuantityModel(type, item)[item.ItemID];
  }

  setFrequency(frequencyTypeID) {
    this.commonData.FrequencyTypes.some((freq) => {
      if (freq.ID == frequencyTypeID) {
        this.persistentService.retailData.Autoship.FrequencyTypeDescription = freq.Description;
        this.persistentService.retailData.Autoship.FrequencyTypeID = freq.ID;
        this.persistentService.retailData.Autoship.FrequencyTypeDescription = freq.Description;
        this.persistentService.retailData.Autoship.FrequencyTypeID = freq.ID;
        this.persistentService.retailData.isChanged = true;
        return;
      }
    });
  }

  setDefaultAutoshipPayment() {
    this.persistentService.retailData.SelectedAutoshipPayment = this.paymentService.PaymentTypeResponse['SaveMethods'][0];
    this.paymentService.SelectedPaymentTypes = this.persistentService.retailData.SelectedAutoshipPayment;
    this.paymentService.selectedPaymentTypeName = this.persistentService.retailData.SelectedAutoshipPayment.CardType + ' ' + this.persistentService.retailData.SelectedAutoshipPayment.Ending;
    const selectpay = {
      CardType: this.paymentService.SelectedPaymentTypes.CardType,
      Last4: this.paymentService.SelectedPaymentTypes.Ending,
      ExpireMonth: this.paymentService.SelectedPaymentTypes.Expires ? moment(this.paymentService.SelectedPaymentTypes.Expires).format('M') : 0,
      ExpireYear: this.paymentService.SelectedPaymentTypes.Expires ? moment(this.paymentService.SelectedPaymentTypes.Expires).format('YYYY') : 0,
      Token: this.paymentService.SelectedPaymentTypes.PaymentMethodId ? this.paymentService.SelectedPaymentTypes.PaymentMethodId : '',
      PaymentMethodId: this.paymentService.SelectedPaymentTypes.PaymentMethodId ? this.paymentService.SelectedPaymentTypes.PaymentMethodId : '',
      MerchantId: this.paymentService.SelectedPaymentTypes.MerchantId
    };
    this.userService.paymentMethods.push(selectpay);

    localStorage.setItem('userService', JSON.stringify(this.userService));
  }

  editAutoshipFrequency(event) {
    const m: moment.Moment = event.value;
    this.persistentService.retailData.isChanged = true;
    this.autoshipConfigurationService.autoshipDate = this.editingAutoship.NextProcessDate = m;
  }


  getAddress(response) {
    this.persistentService.retailData.isChanged = true;
    if (this.userService.shippingAddress.CountryCode.toLowerCase() !== response.address.Country.toLowerCase()) {
      this.addressChanged = true;
    }
    this.persistentService.retailData.isNewAddress = response.address;
    this.userService.shippingAddress.FirstName = response.address.FirstName;
    this.userService.shippingAddress.LastName = response.address.LastName;
    this.userService.shippingAddress.Street1 = response.address.Address1;
    this.userService.shippingAddress.Street2 = response.address.Address2;
    this.userService.shippingAddress.City = response.address.City;
    this.userService.shippingAddress.Region = response.address.State;
    this.userService.shippingAddress.CountryCode = response.address.Country;
    this.userService.shippingAddress.PostalCode = response.address.Zip;

    if (response.isReplacement) {
      this.address.replaceDefault = true;
      this.persistentService.retailData.isAddresschanged = true;
    } else {
      this.persistentService.retailData.isAddresschanged = false;
    }
    // Order calculations may change based on the shipping Address
    this.orderService.calculateAutoOrder();
  }

  decreaseQuantiy(item) {
    if (this.itemsService.selectedAutoOrderItems.length == 1 && this.itemsService.selectedAutoOrderItems[0].Quantity == 1) {
      if (this.AutoshipSetting['IsShowDeleteAutoship']) {
        this.deleteAutoship();
      } else {
        const dialog = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '400px',
          data: {
            title: this.translate.instant('trying_delete_autoship'),
            message: this.translate.instant('prevent_delete_autoship_message'),
            takeaction: this.translate.instant('got_it'),
            noaction: '',
          },
          panelClass: '',
          disableClose: true,
          autoFocus: false
        });
        dialog.afterClosed().subscribe((result) => {
          if (result) {
            this.persistentService.retailData.isChanged = true;
          }
        });
      }
    } else {
      this.cart1Service.decreaseQuantiy(item, true, false);
    }
  }

  clearCart() {
    this.cart1Service.autoshipQuantity = {};
    this.itemsService.selectedAutoOrderItems = [];
    this.orderService.calculateAutoOrderResponse = {};
    localStorage.removeItem('cart.autoship');
  }

  cancelAutoship() {
    this.utilityService.setAutoshipEditFlag(false);
    this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
    this.persistentService.retailData.isAutoshipEdit = false;
    this.persistentService.retailData.AddMoreItemInAutoshipData = {};
    this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
    this.clearCart();
    this.orderService.calculateAutoOrder();
  }

  getAutoshipFrequency() {
    return this.persistentService.retailData.Autoship && this.persistentService.retailData.Autoship.FrequencyTypeDescription;
  }

  getAutoshipStartDate() {
    if (this.autoshipConfigurationService.autoshipDate) {
      return moment(this.autoshipConfigurationService.autoshipDate).toDate();
    } else {
      return moment().toDate();
    }
  }

  getShipMethodName() {
    if (this.orderService.calculateAutoOrderResponse?.ShippingMethods) {
      const selectedShipMethods = _.find(this.orderService.calculateAutoOrderResponse.ShippingMethods, (item) => {
        return item.ShipMethodId == this.userService.selectedShippingMethod;
      });
      if (selectedShipMethods && !this.utilityService.isEmptyObject(selectedShipMethods)) {
        this.selectedShipMethodName = selectedShipMethods.Description;
      }
      return this.selectedShipMethodName;
    }
  }

  getQuantityModel(type, item): any {
    return this.cart1Service[type == 'pack' ? 'packQuantity' : (type == 'autoship' ? 'autoshipQuantity' : ((item && item.UsePoints) ? 'orderRewardQuantity' : 'orderQuantity'))];
  }


  checkQuantity(item, isAutoship, isPack) {
    const quantity = this.getQuantityModel(isPack, isAutoship)[item.ItemCode];
    if (!Number(quantity)) {
      this.getQuantityModel(isPack, isAutoship)[item.ItemCode] = 1;
    } else {
      item.Quantity = quantity;
      if (isAutoship) {
        localStorage.setItem('cart.autoship', JSON.stringify(this.itemsService.selectedAutoOrderItems));
        this.orderService.calculateAutoOrder();
      } else {
        localStorage.setItem((isPack ? 'cart.packs' : 'cart.order'), JSON.stringify(isPack ? this.itemsService.selectedPacks : this.itemsService.selectedOrderItems));
        this.orderService.calculateOrder();
      }
    }
  }

  editAutoshipShippingMethod() {
    const dialog = this.dialog.open(ShipMethodsComponent, {
      width: '600px',
      maxWidth: '600px',
      data: this.orderService.calculateAutoOrderResponse.ShippingMethods,
      panelClass: 'shippingmethodDialog',
      autoFocus: false
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.getShipMethod(result);
      }
    });
  }
  editAutoshipShippingAddress() {

    const dialog = this.dialog.open(ShippingAddressDialogComponent, {
      width: '600px',
      maxWidth: '600px',
      panelClass: 'shippingAddressDialog',
      autoFocus: false
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        if (result && result.isReplacement) {
          this.userService.shippingAddress.FirstName = result.address.FirstName;
          this.userService.shippingAddress.LastName = result.address.LastName;
          this.userService.shippingAddress.Street1 = result.address.Street1;
          this.userService.shippingAddress.Street2 = result.address.Street2;
          this.userService.shippingAddress.City = result.address.City;
          this.userService.shippingAddress.Region = result.address.Region;
          this.userService.shippingAddress.CountryCode = result.address.CountryCode;
          this.userService.shippingAddress.PostalCode = result.address.PostalCode;
          this.persistentService.retailData.isChanged = true;
          this.orderService.calculateAutoOrder();
        }
      }
    });
  }

  getShipMethod(newShippingMethod) {
    this.persistentService.retailData.isChanged = true;
    this.userService.selectedShippingMethod = newShippingMethod.shipMethod;
    this.orderService.calculateAutoOrder();
  }

  deleteItem(item) {
    if (this.itemsService.selectedAutoOrderItems && this.itemsService.selectedAutoOrderItems.length > 1) {
      this.persistentService.retailData.isChanged = true;
      this.cart1Service.removeFromCart(item, true, false, true);
    } else if (this.itemsService.selectedAutoOrderItems && this.itemsService.selectedAutoOrderItems.length == 1) {
      if (this.AutoshipSetting['IsShowDeleteAutoship']) {
        this.deleteAutoship();
      } else {

        const dialog = this.dialog.open(ConfirmDialogComponent, {
          maxWidth: '400px',
          data: {
            title: this.translate.instant('trying_delete_autoship'),
            message: this.translate.instant('prevent_delete_autoship_message'),
            takeaction: this.translate.instant('got_it'),
            noaction: '',
          },
          panelClass: '',
          disableClose: true,
          autoFocus: false
        });
        dialog.afterClosed().subscribe((result) => {
          if (result) {
          }
        });
      }
    }
  }

  deleteAutoship() {
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: this.translate.instant('delete_autoship_title'),
        message: this.translate.instant('delete_autoship_text'),
        takeaction: this.translate.instant('YES'),
        noaction: this.translate.instant('NO'),
      },
      panelClass: '',
      disableClose: true,
      autoFocus: false
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.apiService.deleteAutoship(this.persistentService.retailData.CurrentSelectedAutoOrder).subscribe((result) => {
          try {
            if (result && Number(result.Status) === 1) {
              this.utilityService.setAutoshipEditFlag(false);
              this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
              this.persistentService.retailData.AddMoreItemInAutoshipData = {};
              this.persistentService.retailData.editAutoshipItems = [];
              this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
              this.router.navigate(['/manageautoship']);
              this.notificationService.success('Success', this.translate.instant('successfully_deleted'));
              this.persistentService.retailData.isAutoshipEdit = false;
              this.cart1Service.clearCart();
            } else {
              this.notificationService.error('error_', this.translate.instant('some_error_occur_try_again'));
            }
          } catch (ex) {
            console.error('ex', ex);
            this.notificationService.error('error_', this.translate.instant('Delete Autoship Error'));
          }

        }, (error) => {
          this.notificationService.error('error_', this.translate.instant('Delete Autoship Error'));
        }, () => {
        });
      }
    });
  }

  // Save Payment Method
  addSavePayment(paymentData) {
    this.persistentService.retailData.isChanged = true;
    if (this.paymentService.SelectedPaymentTypes && (this.paymentService.SelectedPaymentTypes.MerchantId !== paymentData.MerchantId)) {
      this.userService.paymentMethods = [];
    }
    this.paymentService.SelectedPaymentTypes = paymentData;
    this.paymentService.selectedPaymentTypeName =
      (paymentData.DisplayName || paymentData.CardType) +
      ' ' +
      (paymentData.Ending ? paymentData.Ending : '') || this.translate.instant('add_a_payment_method');

    if (this.paymentService.SelectedPaymentTypes.CanSavePayments) {
      this.paymentService.OldSelectedPaymentType = this.paymentService.SelectedPaymentTypes;
      this.paymentService.getPaymentData();
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
      this.userService.isPaymentChanged = true;
    }
    localStorage.setItem('userService', JSON.stringify(this.userService));
  }

  // delete Payment Method
  removeCardDetail(payment) {
    const messageText = this.translate.instant('confirm_delete_payment_info') + ' ' + this.getPaymentDescription(payment) + '?';
    const dialog = this.dialog.open(ConfirmDialogComponent, {
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
    dialog.afterClosed().subscribe((data) => {
      this.deleteCreditCard(payment);
      this.persistentService.retailData.isChanged = true;
    });
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

  getDisplayValue() {
    if (parseInt(this.paymentService.selectedPaymentTypeName.split(' ')[1], 10)) {
      const displayValue = this.paymentService.selectedPaymentTypeName.split(' ')[0] + ' ' + this.translate.instant('ending_in') + ' ' + this.paymentService.selectedPaymentTypeName.split(' ')[1];
      return displayValue;
    } else {
      return this.paymentService.selectedPaymentTypeName;
    }
  }

  addAutoshipItem() {
    const autoshipText = this.translate.instant('add_to_autoship_and_checkout') + ' ' + '#' + this.editingAutoship.AutoShipID + ' ' + '?';
    const dialog = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: autoshipText,
        message: '',
        takeaction: this.translate.instant('okay_to_shopping'),
        noaction: this.translate.instant('cancel'),
      },
      panelClass: '',
      disableClose: true,
      autoFocus: false
    });
    dialog.afterClosed().subscribe((data) => {
      if (data) {
        this.persistentService.retailData.isChanged = true;
        this.persistentService.retailData.AddMoreItemInAutoshipFlag = true;
        this.persistentService.retailData.AddMoreItemInAutoshipData = this.getAutoshipOrderDetail;
        this.router.navigate(['/products/all']);
      }
    });
  }

  autoshipChanged() {
    return this.persistentService.retailData.isChanged;
  }

  getCvv(data) {
    if (data) {
      this.placeAutoOrder(data);
    } else {
      this.isDisabledCreateOrder = false;
    }
  }

  updateAutoOrder() {
    this.isDisabledCreateOrder = true;
    if (this.user.checkIfUserAuthenticatedOrNot()) {
      if (
        this.paymentService.SelectedPaymentTypes && Object.keys(this.paymentService.SelectedPaymentTypes).length &&
        this.userService.paymentMethods.length && this.configService.localSettings.Global.AllowCVVModel
      ) {
        const dialog = this.dialog.open(AllowCvvComponent, {
          disableClose: true,
          panelClass: 'allowCvvModel-dialog',
          autoFocus: false
        });
        dialog.afterClosed().subscribe((data) => {
          this.getCvv(data);
        });
      } else {
        this.placeAutoOrder();
      }
    }
    else {
      this.accountService.logout();
      this.router.navigate(['/Login']);
    }
  }

  placeAutoOrder(dataCvvCode?: any) {
    const placeOrderPromise = new Promise((resolve, reject) => {
      if (this.itemsService.selectedAutoOrderItems.length > 0 && this.persistentService.retailData.Autoship.FrequencyTypeID == undefined) {
        this.notificationService.error('error_', 'choose_frequency_sidecart');
        return;
      }

      if (this.itemsService.selectedAutoOrderItems.length == 0) {
        this.notificationService.error('error_', 'autoship_required_msg');
        return;
      }
      if (this.userService.paymentMethods.length > 0) {
        if (this.userService.paymentMethods[0].Last4 || this.userService.paymentMethods[0].Last4 === undefined) {
          this.paymentService.IsFrameReload = false;
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

      if (this.isStateRestrict || (!Object.keys(this.userService.shippingAddress).length && !this.userService.shippingAddress.Street1)) {
        this.notificationService.error('error_', 'please_add_address');
        this.isDisabledCreateOrder = false;
        return;
      }

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

      this.updateAutoOrderRequest = {
        ShipMethodId: this.userService.selectedShippingMethod || 1,
        Frequency: this.persistentService.retailData.Autoship.FrequencyTypeID.toString() || 1,
        Items: autoshipproductdetails,
        MerchantId: this.userService.paymentMethods[0].MerchantId || '',
        PaymentMethodId: this.userService.paymentMethods[0].Token || this.paymentService.SelectedPaymentTypes.PaymentMethodId || '',
        ShippingAddress: {
          Street1: this.userService.shippingAddress.Street1 || '770 E Main',
          Street2: this.userService.shippingAddress.Street2 || 'Test',
          Street3: this.userService.shippingAddress.Street3 || 'Test2',
          Region: this.userService.shippingAddress.Region || 'UT',
          City: this.userService.shippingAddress.City || 'Lehi',
          PostalCode: this.userService.shippingAddress.PostalCode || '84042',
          CountryCode: this.userService.shippingAddress.CountryCode || 'US'
        } as ShipAddress,
        StartDate: this.autoshipConfigurationService.autoshipDate,
      } as CreateAutoOrder;

      this.apiService.updateAutoship(this.getAutoshipOrderDetail.id, this.updateAutoOrderRequest).subscribe((result) => {
        this.isDisabledCreateOrder = false;
        if (result.Status === 0) {
          this.userService.newUser = false;
          try {

          }
          catch (ex) {
            console.warn('ex', ex);
          }
          result.AutoOrderId = this.getAutoshipOrderDetail.id;
          localStorage.setItem('SubmitApplication', JSON.stringify(result));
          this.utilityService.setAutoshipEditFlag(false);
          this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
          this.persistentService.retailData.AddMoreItemInAutoshipData = {};
          this.persistentService.retailData.isChanged = false;
          this.userService.isAddressChanged = false;
          this.userService.isPaymentChanged = false;
          this.userService.isShipMethodChanged = false;
          this.persistentService.retailData.isNewAutoship = false;
          this.persistentService.retailData.editAutoshipItems = [];
          this.persistentService.retailData.AddMoreItemInAutoshipData = {};
          this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
          this.userService.isAddressChanged = false;
          if (result.RedirectUrl && result.RedirectUrl.length > 0) {
            window.location = result.RedirectUrl;
          }
          this.router.navigate(['/complete']);
        }
        else {
          this.notificationService.error('error_', this.translate.instant(result.Message));
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
}
