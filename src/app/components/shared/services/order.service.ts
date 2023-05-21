import { ApplicationInitStatus, Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { CartItem } from 'src/app/modals/cart-item';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { CartService } from './cart.service';
import { NotificationService } from './notification.service';
import { ProductService } from './product.service';
import { RestApiService } from './restapi.service';
import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { UtilityService } from './utility.service';
import { CompanyService } from './company.service';
import { ShoppingCartService } from './shopping-cart.service';
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  public calculateOrderResponse: any = {};
  public calculateAutoOrderResponse: any = {};
  public lastRequest = {};
  public lastAutoOrderRequest = {};
  shoppingCartItems: CartItem[] = [];
  public packTotal = 0;
  public packBusinessVolume = 0;
  public orderTotal = 0;
  public orderRewardTotal = 0;
  public orderBusinessVolume = 0;
  public autoorderBusinessVolume = 0;
  public PreventTaxJarCalculation: boolean = true;
  public UsePoints: boolean = false;
  public calculateOrderCall: boolean;
  public userService: UserServiceModal;
  constructor(
    public user: UserService,
    public notificationService: NotificationService,
    public route: ActivatedRoute,
    public cartService: CartService,
    public apiService: RestApiService,
    public translate: TranslateService,
    public itemsService: ProductService,
    public configService: ConfigService,
    public appInit: ApplicationInitStatus,
    public utilityService: UtilityService,
    public companyService: CompanyService,
    public shoppingCartService: ShoppingCartService
  ) {
    this.userService = this.user.userServiceModal;
    appInit.donePromise.then(() => this.onInit());
  }

  onInit(): void {
    this.cartService.getItems().subscribe(shoppingCartItems => this.shoppingCartItems = shoppingCartItems);
    if (this.itemsService.selectedOrderItems && this.itemsService.selectedOrderItems.length > 0) {
      this.calculateOrder();
    }
    if (this.itemsService.selectedAutoOrderItems && this.itemsService.selectedAutoOrderItems.length > 0) {
      this.calculateAutoOrder();
    }
  }
  /*** calculate Order ***/
  public calculateOrder(showNotification?: boolean,ordertype?:number): any {
    const promise = new Promise((resolve, reject) => {
      const productdetails = [];
      const kititems = [];
      this.itemsService.selectedOrderItems.forEach((item, index) => {
        productdetails.push({
          ItemId: item.ItemID,
          Quantity: item.Quantity || 1,
          IsReward: false // item.UsePoints
        });
      });

      this.itemsService.selectedPacks.forEach((item, index) => {
        kititems.push({
          ItemId: item.ItemID,
          Quantity: item.Quantity || 1,
          IsReward: false
        });
      });

      if (this.userService.couponInfo.promoCode) {
        const isInCart = this.userService.couponInfo.Allcoupons.some((code) => {
          if (code == this.userService.couponInfo.promoCode) {
            return true;
          }
          return false;
        });
        if (!isInCart) {
          this.userService.couponInfo.Allcoupons.push(this.userService.couponInfo.promoCode);
        }
      }
      const token = null; // cookieService.getAuthToken();
      const guestLogin = localStorage.getItem('guestLogin') == 'true' ? true : false;
      if (token && !guestLogin) {
        const selectedorders = JSON.parse(localStorage.getItem('cart.order'));
        if (!selectedorders || !selectedorders.length) {
          this.userService.couponInfo.RewardsForUse = [];
          this.userService.couponInfo.promoCode = '';
          this.userService.couponInfo.promoCodeValid = true;
          this.userService.couponInfo.IsAppliedcode = false;
          this.userService.couponInfo.Allcoupons = [];
        }
      }

      const calculateOrderRequest = {
        customerId: this.userService.enrollerInfo?.CustomerId, // for global discount coupons it is necessary to send customer id or sponsor id like this.userService.customerData?.CustomerId ? this.userService.customerData?.CustomerId:this.userService.enrollerInfo?.CustomerId,
        calculateOrder: {
          WarehouseId: 0,
          ShipMethodId: this.userService.selectedShippingMethod || 0,
          StoreId: this.shoppingCartService.getShoppingCart(ordertype)[0]?.StoreID,
          CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
          ShippingAddress: {
            AddressId: 0,
            Street1: this.userService.shippingAddress.Street1 || '',
            Street2: this.userService.shippingAddress.Street2 || '',
            Street3: '',
            PostalCode: this.userService.shippingAddress.PostalCode || this.userService.shippingAddress.PostalCode || '84042',
            City: this.userService.shippingAddress.City || '',
            Region: this.userService.shippingAddress.Region
              ? this.userService.shippingAddress.Region : (this.userService.defaultState || this.userService.regionMainState) || 'UT',
            CountryCode: this.configService.commonData.selectedCountry || 'us'
          },
          PriceGroup: this.userService.customerTypeID || 2,
          OrderType: 1,
          KitItems: kititems,
          Items: productdetails,
          PartyId: 0,
          CouponCodes: this.configService.localSettings.Global.OrderAllowCoupons ? (this.userService.couponInfo.Allcoupons || []) : [],
          CountryCode: this.configService.commonData.selectedCountry || 'us'
        }
      };

      if (_.isEqual(this.lastRequest, calculateOrderRequest)) {
        resolve(this.calculateOrderResponse);
      } else {
        this.lastRequest = cloneDeep(calculateOrderRequest);
        this.apiService.calculateCustomerOrderTotal(calculateOrderRequest).subscribe((result) => {
          this.calculateOrderCall = false;

          try {
            if (parseInt(result.Status, 10) === 0) {
              this.calculateOrderResponse = result.Data;
              if (this.calculateOrderResponse.CouponResults) {
                this.calculateOrderResponse.CouponResults.forEach((item, index) => {
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
              this.userService.couponInfo.promoCode = '';
              setTimeout(() => {
                this.userService.shippingMethods = result.Data.ShippingMethods;

                if (this.userService.shippingMethods && this.userService.shippingMethods.length) {
                  const selectedShipmethod = this.userService.shippingMethods.filter((shipMethod) => {
                    return (shipMethod.ShipMethodId === this.userService.selectedShippingMethod);

                  });
                  if (selectedShipmethod.length > 0) {
                    this.userService.selectedShippingMethod = this.userService.selectedShippingMethod ||
                      selectedShipmethod[0].ShipMethodId;

                  } else {
                    this.userService.selectedShippingMethod = this.userService.selectedShippingMethod ||
                      this.userService.shippingMethods[0].ShipMethodId;
                  }

                }
              }, 100);

              // pack total
              if (this.itemsService.selectedPacks.length) {
                this.packTotal = 0;
                this.packBusinessVolume = 0;
                this.itemsService.selectedPacks.forEach(item => {

                  this.packTotal = this.packTotal + (item.Quantity * item.Price);
                  this.packBusinessVolume = this.packBusinessVolume + (item.Quantity * (item.BusinessVolume || item.PV));
                });
              }
              // order total
              if (this.itemsService.selectedOrderItems.length) {
                this.orderTotal = 0;
                this.orderRewardTotal = 0;
                this.orderBusinessVolume = 0;
                const selectedOrderItems = cloneDeep(this.itemsService.selectedOrderItems);
                this.itemsService.selectedOrderItems = [];
                selectedOrderItems.forEach((item) => {
                  this.calculateOrderResponse.Items.forEach((item1) => {
                    if (item1.CurrencyCode == 'RWD') {
                      item1.UsePoints = true;
                    }

                    if (item.ItemID == item1.ItemId && !!item.UsePoints == !!item1.UsePoints) {
                      item.Price = item1.Price || item1.PriceEach || item.Price;
                      if (item1.CurrencyCode == 'RWD') {
                        this.orderRewardTotal = this.orderRewardTotal + (item1.Quantity * (item1.Price || item1.PriceEach || 0));
                      }
                      else {
                        this.orderTotal = this.orderTotal + (item1.Quantity * (item1.Price || item1.PriceEach || 0));
                      }
                      item1.BusinessVolumeTotal = this.orderBusinessVolume + (item1.Quantity * (item1.Cv || item1.Qv || 0));
                      this.orderBusinessVolume = this.orderBusinessVolume + (item1.Quantity * (item1.Cv || item.Qv || 0));
                      this.itemsService.selectedOrderItems.push(item);
                    }
                  });
                });
              }
              if (showNotification) {
                this.notificationService.success('success', this.translate.instant('item_added_your_order_shopping_cart'));
              }
              resolve(result);
            } else {
              const getMessage = result.Message.toLowerCase().includes('Api returned 404 Not Found'.toLowerCase());
              let getItemName;
              if (getMessage && getMessage !== null) {
                const getNumber = result.Message;
                const getItemCode = getNumber.match(new RegExp('Item with Id' + '\\s(\\w+)'))[1]; // getNumber.replace(/\D/g, '');
                let getItemDetails = this.itemsService.selectedOrderItems;
                if (this.itemsService.selectedPacks.length > 0) {
                  getItemDetails = getItemDetails.concat(this.itemsService.selectedPacks);
                }
                getItemDetails.forEach((item, index) => {
                  if (item.ItemID == getItemCode) {
                    getItemName = item.ProductName;
                  }
                });

                this.translate.get('error_item_not_found').subscribe((text: string) => {
                  this.notificationService.error('error_', this.translate.instant('error_item_not_found') + ' ' + getItemName);
                });

              } else {
                this.notificationService.error('error_', result.Message);
              }

              reject(result);
            }
          } catch (ex) {

            this.notificationService.error('error_', 'error_occured_try_again');
            reject(ex);
          }
        }, (error) => {
          // this.calculateOrderCall = false;
          reject(error);
        });
      }

    });
    return promise;
  }

  /***calculate Auto Order***/

  public calculateAutoOrder(showNotification?: boolean): any {
    const promise = new Promise((resolve, reject) => {
      this.PreventTaxJarCalculation = true;
      const productdetails = [];
      this.itemsService.selectedAutoOrderItems.forEach((item, index) => {
        productdetails.push({
          ItemId: item.ItemID,
          Quantity: item.Quantity,
          IsKitItem: false
        });
      });

      const calculateOrderRequest = {
        customerId: 0,
        calculateOrder: {
          WarehouseId: 0,
          ShipMethodId: this.userService.selectedShippingMethod || 0,
          StoreId: this.shoppingCartService.getShoppingCart(2)[0]?.StoreID,
          CurrencyCode: this.companyService.selectedCurrency?.CurrencyCode,
          ShippingAddress: {
            AddressId: 0,
            Street1: this.userService.shippingAddress.Street1,
            Street2: this.userService.shippingAddress.Street2,
            Street3: '',
            PostalCode: this.userService.shippingAddress.PostalCode || this.userService.shippingAddress.PostalCode || '84042',
            City: this.userService.shippingAddress.City,
            Region: this.userService.shippingAddress.Region
              ? this.userService.shippingAddress.Region : (this.userService.defaultState || this.userService.regionMainState) || 'UT',
            // || this.itemsService.getState() || this.userService.shippingAddress.MainState);,
            CountryCode: this.configService.commonData.selectedCountry || 'us'
          },
          PriceGroup: this.userService.customerTypeID || 2,
          OrderType: 2,
          KitItems: [],
          Items: productdetails,
          PartyId: 0,
          CouponCodes: this.configService.localSettings.Global.OrderAllowCoupons ? (this.userService.couponInfo.Allcoupons || []) : [],
          CountryCode: this.configService.commonData.selectedCountry || 'us'
        }
      };
      if (_.isEqual(this.lastAutoOrderRequest, calculateOrderRequest)) {
        resolve(this.calculateAutoOrderResponse);

      } else {

        this.lastAutoOrderRequest = cloneDeep(calculateOrderRequest);
        this.apiService.calculateCustomerOrderTotal(calculateOrderRequest).subscribe((result) => {
          try {

            if (parseInt(result.Status, 10) === 0) {
              this.calculateAutoOrderResponse = result.Data;
              if (showNotification) {
                this.notificationService.success('success', this.translate.instant('item_added_in_your_autoship'));
              }
              this.autoorderBusinessVolume = 0;
              const selectedAutoOrderItems = cloneDeep(this.itemsService.selectedAutoOrderItems);
              this.itemsService.selectedAutoOrderItems = [];
              selectedAutoOrderItems.forEach((autoitem, index) => {
                this.calculateAutoOrderResponse.Items.forEach((item1) => {
                  if (autoitem.ItemID == item1.ItemId) {
                    autoitem.Price = item1.Price || item1.PriceEach;
                    autoitem.CV = item1.Cv;
                    autoitem.QV = item1.Qv;
                    autoitem.BusinessVolumeTotal = this.autoorderBusinessVolume + (item1.Quantity * (item1.Cv || item1.Qv || 0));
                    this.autoorderBusinessVolume = this.autoorderBusinessVolume + (item1.Quantity * (item1.Cv || item1.Qv || 0));
                  }
                });
              });
              this.userService.shippingMethods = result.Data.ShipMethods;
              if (this.userService.shippingMethods && this.userService.shippingMethods.length) {
                const selectedShipmethod = this.userService.shippingMethods.filter((shipMethod) => {
                  return (shipMethod.ShipMethodID === this.userService.selectedShippingMethod);

                });
                if (selectedShipmethod.length > 0) {
                  this.userService.selectedShippingMethod = this.userService.selectedShippingMethod || selectedShipmethod[0].ShipMethodID;
                }
                else {
                  this.userService.selectedShippingMethod = this.userService.selectedShippingMethod ||
                    this.userService.shippingMethods[0].ShipMethodID;
                }
              }
              this.itemsService.selectedAutoOrderItems = selectedAutoOrderItems;
              resolve(result);
            } else {
              const getMessage = result.Message.toLowerCase().includes('Api returned 404 Not Found'.toLowerCase());
              let getItemName;
              if (getMessage && getMessage !== null) {
                const getNumber = result.Message;
                const getItemCode = getNumber.match(new RegExp('Item with Id' + '\\s(\\w+)'))[1]; // getNumber.replace(/\D/g, '');
                const getItemDetails = this.itemsService.selectedAutoOrderItems;
                getItemDetails.forEach((item, index) => {
                  if (item.ItemID == getItemCode) {
                    getItemName = item.ProductName;
                  }
                });

                this.translate.get('error_item_not_found').subscribe((text: string) => {
                  this.notificationService.error('error_', this.translate.instant('error_item_not_found') + ' ' + getItemName);
                });
              } else {
                this.notificationService.error('error_', result.Message);
              }
              reject(result);
            }
          } catch (ex) {

            this.notificationService.error('error_', 'error_occured_try_again');
            reject(ex);
          }
        }, (error) => {
          reject(error);
        });
      }
    });
    return promise;
  }

  /** *Reset last requests
   * @method  resetLastRequests
   * Reset last requests in case of continue shoppings.
   */
  public resetLastRequests(): any {
    this.lastRequest = {};
    this.lastAutoOrderRequest = {};
  }
}
