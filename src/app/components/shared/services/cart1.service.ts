import { ShoppingCartService } from './shopping-cart.service';
import { PaymentService } from './payment.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from './../model/confirm-dialog/confirm-dialog.component';
import { Injectable } from '@angular/core';
import { OrderService } from './order.service';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from './product.service';
import { MatDialog } from '@angular/material/dialog';
import { ShippingAddress, UserServiceModal } from 'src/app/modals/userservice.modal';
import { Router } from '@angular/router';
import { ProductDialogComponent } from '../../shop/products/product-dialog/product-dialog.component';
import { UtilityService } from './utility.service';
import { PersistentService } from './persistent.service';
import { Location } from '@angular/common';
import { ItemsListService } from './itemsList.service';
import { SideNavBarService } from './sidenavbar.service';
import { AutoshipConfigurationService } from './autoshipConfiguration.service';
import { CompanyService } from './company.service';
import { ConfigService } from './config.service';
@Injectable({
  providedIn: 'root'
})
export class Cart1Service {
  public isKitAdded = {};
  public packQuantity = {};
  public orderQuantity = {};
  public orderRewardQuantity = {};
  public autoshipQuantity = {};
  userService: UserServiceModal;
  public oldRestrictedState;
  public oldRegionMainState;
  public restrictedOrderItems = [];
  public restrictedAutoOrderItems = [];
  constructor(
    public orderService: OrderService,
    public notificationService: NotificationService,
    public user: UserService,
    private translate: TranslateService,
    private itemsService: ProductService,
    private dialog: MatDialog,
    public paymentService: PaymentService,
    public router: Router,
    public utilityService: UtilityService,
    public persistentService: PersistentService,
    public location: Location,
    public itemsListService: ItemsListService,
    public sideNavBarService: SideNavBarService,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public companyService: CompanyService,
    public configService: ConfigService,
    public shoppingCartService: ShoppingCartService
  ) {
    this.userService = user.userServiceModal;
    this.init();
  }

  // /**
  //  * Increase quantiy of items in cart.
  //  * @method  increaseQuantiy
  //  * @param   {object}  item     Item object.
  //  * @param   {boolean} isAutoship     If it is added to autoship or not.
  //  */
  public increaseQuantiy(item, isAutoship?: boolean, isPack?: boolean) {
    this.persistentService.retailData.isChanged = true;
    if (isAutoship) {
      if (this.autoshipQuantity[item.ItemID] < 99) {
        this.autoshipQuantity[item.ItemID] =
          Number(this.autoshipQuantity[item.ItemID] || 0) + 1;
        item.Quantity = this.autoshipQuantity[item.ItemID];
        localStorage.setItem(
          'cart.autoship',
          JSON.stringify(this.itemsService.selectedAutoOrderItems)
        );
      }
      this.orderService.calculateAutoOrder();
    } else if (isPack) {
      this.packQuantity[item.ItemID] =
        Number(this.packQuantity[item.ItemID] || 0) + 1;
      item.Quantity = this.packQuantity[item.ItemID];
      localStorage.setItem(
        'cart.packs',
        JSON.stringify(this.itemsService.selectedPacks)
      );
      this.orderService.calculateOrder(false,-1);
    } else {
      if (!item.UsePoints) {
        this.orderQuantity[item.ItemID] = this.orderQuantity[item.ItemID] || 0;
        if (this.orderQuantity[item.ItemID] < 99) {
          this.orderQuantity[item.ItemID] =
            Number(this.orderQuantity[item.ItemID] || 0) + 1;
          item.Quantity = this.orderQuantity[item.ItemID];
          this.itemsService.selectedOrderItems.filter((x) => {
            if (x.ItemID == item.ItemID) {
              x.Quantity = item.Quantity;
            }
          });
          localStorage.setItem(
            'cart.order',
            JSON.stringify(this.itemsService.selectedOrderItems)
          );
          this.notificationService.success('success', 'Item quantity is increased');
        }
      }
      else if (item.UsePoints) {
        if (this.orderRewardQuantity[item.ItemID] < 99) {
          this.orderRewardQuantity[item.ItemID] =
            Number(this.orderRewardQuantity[item.ItemID] || 0) + 1;
          item.rewardQuantity = this.orderRewardQuantity[item.ItemID];
          localStorage.setItem(
            'cart.order',
            JSON.stringify(this.itemsService.selectedOrderItems)
          );
        }
      }
      this.orderService.calculateOrder(false,1);
    }
  }
  // /**
  //  * Decrease quantiy of items in cart.
  //  * @method  decreaseQuantiy
  //  * @param   {object}  item     Item object.
  //  * @param   {boolean} isAutoship     If it is added to autoship or not.
  //  */
  public decreaseQuantiy(item, isAutoship?: boolean, isPack?: boolean) {
    this.persistentService.retailData.isChanged = true;
    if (isAutoship) {
      this.autoshipQuantity[item.ItemID] = Number(
        this.autoshipQuantity[item.ItemID] || 0
      );
      this.autoshipQuantity[item.ItemID]--;
      item.Quantity = this.autoshipQuantity[item.ItemID];
      localStorage.setItem(
        'cart.autoship',
        JSON.stringify(this.itemsService.selectedAutoOrderItems)
      );
      if (item.Quantity !== 0) {
        this.orderService.calculateAutoOrder();
      }
    } else if (isPack) {
      this.packQuantity[item.ItemID] = Number(this.packQuantity[item.ItemID] || 0);
      this.packQuantity[item.ItemID]--;
      item.Quantity = this.packQuantity[item.ItemID];
      localStorage.setItem('cart.packs', JSON.stringify(this.itemsService.selectedPacks));
      if (item.Quantity !== 0) {
        this.orderService.calculateOrder(false,-1);
      }
    } else {
      if (!item.UsePoints) {
        this.orderQuantity[item.ItemID]--;
        item.Quantity = this.orderQuantity[item.ItemID];
      }
      else if (item.UsePoints) {
        this.orderRewardQuantity[item.ItemID]--;
        item.rewardQuantity = this.orderRewardQuantity[item.ItemID];
      }

      localStorage.setItem(
        'cart.order',
        JSON.stringify(this.itemsService.selectedOrderItems)
      );
      if (item.Quantity !== 0) {
        this.orderService.calculateOrder(false,1);
      }
    }
    if (item.Quantity === 0 || item.rewardQuantity === 0) {
      this.removeFromCart(item, isAutoship, isPack, true);
    }
  }
  // autoAddedCoupon method used to add auto add coupon
  public autoAddedCoupon() {
    if (this.userService.couponInfo.availableRewards.length > 0) {
      if (this.itemsService.IsAllowDynamicCouponcode) {
        _.each(this.userService.couponInfo.availableRewards, (item) => {
          if (item.Code == this.userService.DynamicCouponCode.promoCode) {
            this.userService.couponInfo.RewardsForUse = _.filter(this.userService.couponInfo.RewardsForUse, (item1) => {
              return item1.Code !== this.userService.DynamicCouponCode.promoCode;
            });
          }
        });
      }
    }
  }
  // /**
  //  * Add items to cart.
  //  * @method  addToCart
  //  * @param   {object}  item     Item object.
  //  * @param   {boolean}  isShowNotification     Is show notification message on item added in cart.
  //  * @param   {string}  customOrderCode     Custom order code.
  //  * @param   {boolean} isAutoship     If it is added to autoship or not.
  //  * @param   {object}  fromDialog     if it is added from pop Dialog or not.
  //  * @param   {boolean} isPack     If it is added to pack or not.
  //  */
  public addToCart(
    item,
    isShowNotification,
    customOrderCode,
    isAutoship?: boolean,
    fromDialog?: boolean,
    isPack?: boolean,
    fromApplication?: boolean,
    fromPointbtn?: boolean
  ) {
    this.persistentService.retailData.isChanged = true;
    if (isPack && !this.utilityService.isPackMultipleQuantity) {
      this.addPack(item, isShowNotification);
    } else {
      if (typeof isAutoship == 'undefined') {
        isAutoship = false;
      }

      // Use a custom order code (for customization options like color and size) if one is passed in
      const itemCode = (customOrderCode || item.ItemID).toString();
      // Determine if the item is in the cart, and if so, retrieve it

      this.addOrderToCart(
        item,
        itemCode,
        fromDialog,
        isAutoship,
        isShowNotification,
        isPack,
        fromPointbtn
      );
      // }
    }

    if (!isAutoship) {
      this.autoAddedCoupon();
    }
  }

  // /**
  // * show Product Detail.
  // * @method  showProductDetail
  // * @param   {object}  item     Item object.
  // * @param   {boolean}  hasOptions     Is show notification message on item added in cart.
  // * @param   {boolean} isAutoship     If it is added to autoship or not.
  // * @param   {boolean} isPack     If it is added to pack or not.
  // */

  public showProductDetail(item, isAutoship?: boolean, hasOptions?: boolean, isPack?: boolean, fromApplication?: boolean) {

    if (!item) {
      return;
    }
    item = cloneDeep(item);

    // We don't pass HasOptions to the modal, because that property is used to decide behavior when "Add to Cart" is clicked.
    item.Quantity = isAutoship
      ? this.autoshipQuantity[item.ItemID]
      : isPack
        ? this.packQuantity[item.ItemID]
        : this.orderQuantity[item.ItemID];
    item.rewardQuantity = this.orderRewardQuantity[item.ItemID];
    if (!hasOptions) {
      item.HasOptions = null;
    }
    if (isPack) {
      item.ItemOptions = [];
      item.OptionsMap = [];
    }

    if (fromApplication) {
      const dialogdata = this.dialog.open(ProductDialogComponent, {
        data: {
          value: item,
          service: this,
          type: (isAutoship ? 'autoship' : (isPack ? 'pack' : 'order'))
        },
        disableClose: true,
        panelClass: 'product-dialog',
        autoFocus: false
      });
    } else {
      this.router.navigate(['/product', item.ItemID], { queryParams: { itemType: isAutoship ? 'autoship' : isPack ? 'pack' : 'order' } });
    }

  }

  // /**
  //  * Remove items from cart.
  //  * @method  removeFromCart
  //  * @param   {object}  item     Item object.
  //  * @param   {boolean} isAutoship     If it is added to autoship or not.
  //  * @param   {boolean} isPack     If it is added to pack or not.
  //  */
  public removeFromCart(
    item,
    isAutoship?: boolean,
    isPack?: boolean,
    isShowNotification?: boolean
  ) {
    if (isPack) {
      this.itemsService.selectedPacks = _.without(
        this.itemsService.selectedPacks,
        _.find(this.itemsService.selectedPacks, { ItemID: item.ItemID })
      );
      this.isKitAdded[item.ItemID] = false;
      localStorage.setItem(
        'cart.packs',
        JSON.stringify(this.itemsService.selectedPacks)
      );
      this.orderService.calculateOrder(false,-1).then(() => {
        if (isShowNotification) {
          this.notificationService.success('success', 'item_removed_from_pack');
        }
      });
    } else {
      const ItemID = item.ItemID;
      const selectedItems = isAutoship
        ? 'selectedAutoOrderItems'
        : 'selectedOrderItems';

      this[isAutoship ? 'autoshipQuantity' : (!item.UsePoints ? 'orderQuantity' : 'orderRewardQuantity')][ItemID] = 0;
      if (item.UsePoints) {
        item.rewardQuantity = 0;
      } else {
        item.Quantity = 0;
      }

      // Unselect the item
      this.itemsService[selectedItems] = this.itemsService[selectedItems].filter(
        (item1) => {
          if ((item1.ItemID !== ItemID)) {
            return true;
          } else {
            return item1.UsePoints !== item.UsePoints;
          }
        }
      );

      if (isAutoship) {
        localStorage.setItem(
          'cart.autoship',
          JSON.stringify(this.itemsService.selectedAutoOrderItems)
        );
        this.orderService.calculateAutoOrder().then(() => {
          if (this.itemsService.selectedAutoOrderItems.length == 0) {
            this.autoshipConfigurationService.autoshipDate = '';
            this.autoshipConfigurationService.init();
            if (this.utilityService.getAutoshipEditFlag()) {
              this.utilityService.setAutoshipEditFlag(false);
              this.persistentService.retailData.AddMoreItemInAutoshipFlag = false;
              this.persistentService.retailData.AddMoreItemInAutoshipData = {};
              this.persistentService.retailData.editAutoshipItems = [];
              this.persistentService.retailData.CurrentSelectedAutoOrder = 0;
            }
            if (this.itemsService.selectedOrderItems.length === 0 && this.location.path().toLowerCase() !== '/join') {
              this.router.navigate(['/products/all']);
            }
          }
          if (isShowNotification) {
            this.notificationService.success(
              'success',
              'item_removed_from_autoship'
            );
          }
        });
      } else {
        localStorage.setItem(
          'cart.order',
          JSON.stringify(this.itemsService.selectedOrderItems)
        );
        this.orderService.calculateOrder(false,1).then(() => {
          if (isShowNotification) {
            this.notificationService.success('success', 'item_removed_from_order');

            if (this.itemsService[selectedItems].length == 0) {
              if (this.location.path().toLowerCase() == '/join') {
                this.router.navigate(['/join']);
              }
              else {
                this.router.navigate(['/products/all']);
              }
            }
          }
        });
      }
    }
    if (this.itemsService.selectedOrderItems == 0 && this.itemsService.selectedAutoOrderItems == 0) {
      this.userService.selectedShippingMethod = 0;
    }
  }

  public clearCart() {
    this.isKitAdded = {};
    this.orderQuantity = {};
    this.orderRewardQuantity = {};
    this.autoshipQuantity = {};
    this.itemsService.selectedPacks = [];
    this.itemsService.selectedOrderItems = [];
    this.itemsService.selectedAutoOrderItems = [];
    this.orderService.calculateOrderResponse = {};
    this.orderService.calculateAutoOrderResponse = {};
    localStorage.removeItem('cart.packs');
    localStorage.removeItem('cart.order');
    localStorage.removeItem('cart.autoship');
  }

  public getItemPrice(item) {
    let price = null;
    if (!item.Prices || !item.Prices.length) {
      price = item.Price;
    } else {
      item.Prices.forEach(p => {
        if (p.CurrencyCode == null || (p.CurrencyCode && p.CurrencyCode.toLowerCase() !== 'rwd')) {
          price = p.Price;
        }
      });
    }
    return price;
  }

  public getOrderItems(isAutoship?: boolean, isPack?: boolean) {
    if (isAutoship) {
      return this.itemsService.selectedAutoOrderItems;
    } else if (isPack) {
      return this.itemsService.selectedPacks;
    } else {
      return this.itemsService.selectedOrderItems;
    }
  }

  public addOrderToCart(
    item,
    itemCode,
    fromDialog,
    isAutoship?: boolean,
    isShowNotification?: boolean,
    isPack?: boolean,
    fromPointbtn?: boolean
  ) {
    isAutoship = !!isAutoship;

    const cartItems = isAutoship ? this.itemsService.selectedAutoOrderItems : isPack ? this.itemsService.selectedPacks : this.itemsService.selectedOrderItems;
    let itemInCart = null;
    const isInCart = cartItems.some((cartItem) => {
      if (cartItem.ItemID == itemCode && Boolean(cartItem.UsePoints) == Boolean(fromPointbtn)) {
        itemInCart = cartItem;
        return true;
      }
      return false;
    });

    if (isInCart) {
      // If it is in the cart...
      const itemQuantities = isAutoship ? this.autoshipQuantity : isPack ? this.packQuantity : (!fromPointbtn ? this.orderQuantity : this.orderRewardQuantity);
      let quantity;
      if (!fromDialog) {
        // If not coming from a dialog, increase the quantity
        quantity = itemQuantities[itemCode]
          ? Number(itemQuantities[itemCode]) + 1
          : 1;
      } else {
        // If coming from a dialog, keep the quantity from the dialog
        quantity = itemQuantities[itemCode]
          ? Number(itemQuantities[itemCode])
          : 1;
      }

      itemQuantities[itemCode] = quantity;
      if (!cartItems[cartItems.indexOf(itemInCart)].UsePoints) {
        cartItems[cartItems.indexOf(itemInCart)].Quantity = quantity;
      }
      else {
        cartItems[cartItems.indexOf(itemInCart)].rewardQuantity = quantity;
      }
    } else {
      // If it is not in the cart, add it
      this.getKitInfo(item);
      item = cloneDeep(item);
      if (fromPointbtn) {
        // item.Price = this.getItemPoints(item);
        item.OriginalPrice = item.Price;
      }
      item.ItemID = itemCode.toString();
      item.UsePoints = fromPointbtn;
      item.Quantity = isAutoship
        ? this.autoshipQuantity[itemCode] || 1
        : isPack
          ? this.packQuantity[itemCode] || 1
          : this.orderQuantity[itemCode] || 1;
      item.rewardQuantity = this.orderRewardQuantity[itemCode] || 1;
      if (item.HasOptions) {
        _.each(item.OptionsMap, (value) => {
          if (value.ItemId == item.ItemID) {
            item.OptionsImage = value.Image;
            return;
          }
        });
      }
      cartItems.push(item);
    }
    if (isPack) {
      item.IsKitItem = true;
    }


    if (isAutoship) {
      this.orderService.calculateAutoOrder(isShowNotification);
    } else {
      if(isPack){
        this.orderService.calculateOrder(isShowNotification,-1);
      }else{
        this.orderService.calculateOrder(isShowNotification,1);
      }
    }

    localStorage.setItem(
      isAutoship ? 'cart.autoship' : isPack ? 'cart.packs' : 'cart.order',
      JSON.stringify(cartItems)
    );
  }

  public getKitInfo(item) {
    if (!item.HasKitGroups) {
      return;
    }
    const kitItemNames = [];
    _.each(item.KitGroups, (group) => {
      let kitItemName = group.selectedItem.Name;
      if (group.selectedItem.HasOptions) {
        kitItemName += ' ' + group.selectedItem.selectedOptions;
      }
      kitItemNames.push(kitItemName);
    });
    item.selectedKitOptions = kitItemNames.join(', ');
  }

  public addPack(item, isShowNotification?: boolean) {
    if (
      item.HasOptions ||
      (item.HasKitGroups &&
        !_.every(item.KitGroups, (group) => {
          return group.selectedItem;
        }))
    ) {
      // If there are options (e.g. color/size), show the product details modal
      this.showProductDetail(item, false, null, true);
      return;
    } else {
      this.isKitAdded[item.ItemID] = true;

      // If the product is already added, exit the method
      if (~this.itemsService.selectedPacks.indexOf(item)) {
        return;
      }
      let alreadyPackItems = false;
      _.each(this.itemsService.selectedPacks, (items) => {
        if (items.ItemID == item.ItemID) {
          alreadyPackItems = true;
        }
      });
      if (!alreadyPackItems) {
        this.itemsService.selectedPacks.push(item);
      }
      this.itemsService.selectedPacks.forEach((item1) => {
        item1.IsKitItem = true;
        item1.Quantity = 1;
      });

      localStorage.setItem(
        'cart.packs',
        JSON.stringify(this.itemsService.selectedPacks)
      );
      // this.triggerAddRemoveCartItems(item, null, false, false, true);
      this.orderService.calculateOrder(isShowNotification,-1);
    }
  }

  public setQuantiy() {
    if (this.itemsService.selectedPacks.length > 0) {
      this.itemsService.selectedPacks.forEach((item) => {
        this.isKitAdded[item.ItemID] = true;
        this.packQuantity[item.ItemID] = item.Quantity;
      });
    }
    if (this.itemsService.selectedOrderItems.length > 0) {
      this.itemsService.selectedOrderItems.forEach((item) => {
        if (!item.UsePoints) {
          this.orderQuantity[item.ItemID] = item.Quantity;
        }
        else if (item.UsePoints) {
          this.orderRewardQuantity[item.ItemID] = item.rewardQuantity;
        }
      });
    }

    if (this.itemsService.selectedAutoOrderItems.length > 0) {
      this.itemsService.selectedAutoOrderItems.forEach((item) => {
        this.autoshipQuantity[item.ItemID] = item.Quantity;
      });
    }
    if (
      (this.itemsService.selectedPacks.length > 0 ||
        this.itemsService.selectedOrderItems.length > 0) &&
      !this.userService.checkItems
    ) {
      this.orderService.calculateOrder(false,-1);
    }
    if (
      this.itemsService.selectedAutoOrderItems.length > 0 &&
      !this.userService.checkItems
    ) {
      this.orderService.calculateAutoOrder();
    }
  }

  private init() {
    this.setQuantiy();
  }

  public updateCountry(country, languagecode, sideNavCall, shippingCall) {
    if (!languagecode) {
      languagecode = sessionStorage.getItem('selectedLanguageCode');
    }
    if (sideNavCall) {
      this.sideNavBarService.closeSidePanel();
    }
    if (this.configService.commonData.selectedCountry.toLowerCase() !== country.CountryCode.toLowerCase() || this.configService.commonData.selectedLanguage !== languagecode) {
      this.oldRestrictedState = this.userService.restrictedStates;
      this.oldRegionMainState = this.userService.regionMainState;
      this.userService.regionMainState = '';
      const request = {
        CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
        LanguageCode: this.configService.commonData.selectedLanguage,
        RegionID: this.companyService.getRegionID(this.configService.commonData?.selectedCountry),
        PriceGroup: this.userService.customerTypeID,
        StoreID: this.shoppingCartService.getShoppingCart(1)[0]?.StoreID, // this.userService.customerTypeID == 2 ? 3 : 2
        CategoryId: 0
      };
      this.itemsService.getProducts(request).subscribe((result) => {
        try {
          if (result.length != 0) {
            const countrySwal = this.translate.instant('if_you_selected_other_country');
            if (this.itemsService.selectedOrderItems.length || this.itemsService.selectedAutoOrderItems.length) {
              if (result.length > 0) {
                this.restrictedOrderItems = this.getRestrictedItems(this.itemsService.selectedOrderItems, result, false);
                this.restrictedAutoOrderItems = this.getRestrictedItems(this.itemsService.selectedAutoOrderItems, result, true);

              } else {
                this.itemsService.selectedOrderItems = [];
                this.itemsService.selectedAutoOrderItems = [];
              }

              if (this.restrictedOrderItems.length || this.restrictedAutoOrderItems.length) {
                const swalHtml = this.setRestrictItemsSwal();
                this.marketSwalCheckItems(swalHtml, country, languagecode, shippingCall, true);

              } else {
                const swalText = countrySwal + '\n\n';
                if (shippingCall) {
                  this.userService.newshippingAddress.Country = country.CountryCode;
                  this.marketSwalCheckItems(swalText, country, languagecode, shippingCall, false);
                } else {
                  this.marketSwalCheckItems(swalText, country, languagecode, shippingCall, false);
                }
              }
            } else {

              this.marketSwalCheckItems(countrySwal, country, languagecode, shippingCall, false);
            }
          } else {
            if (sessionStorage.getItem('CommonSettings')) {
              const data = JSON.parse(sessionStorage.getItem('CommonSettings'));
              this.configService.commonData.selectedCountry = data.selectedCountry;
              this.configService.commonData.selectedLanguage = data.selectedLanguage;
              this.itemsService.selectedOrderItems.length = [];
              this.itemsService.selectedAutoOrderItems = [];
              this.userService.regionMainState = this.oldRegionMainState;
              this.notificationService.error('error_', 'error_occured_try_again');
            }
          }
        } catch (ex) {
          this.notificationService.error('error_', 'error_occured_try_again');
        }
      });
    }
  }

  public getRestrictedItems(selectedItems, OrderItem, isAutoship?: boolean) {
    if (OrderItem.length > 0 && selectedItems.length > 0) {
      return selectedItems.filter((item) => {
        return !OrderItem.some((item2) => {
          if (item2.HasOptions && (!isAutoship || item2.AllowAutoship)) {
            _.each(item2.OptionsMap, (value) => {
              if ((value.ItemId == item.ItemID) && (item.UsePoints ? (item.UsePoints == item2.UsePoints) : true)) {
                item2.ItemID = value.ItemId;
                return;
              }
            });
          }
          if ((item2.ItemID == item.ItemID && (item.UsePoints ? (item.UsePoints == item2.UsePoints) : true) && (!isAutoship || item2.AllowAutoship)) && item.selectedOptions) {
            item2.selectedOptions = item.selectedOptions;
          }
          return (item.ItemID == item2.ItemID && (item.UsePoints ? (item.UsePoints == item2.UsePoints) : true) && (!isAutoship || item2.AllowAutoship));
        });
      });
    } else {
      return [];
    }
  }

  public setRestrictItemsSwal() {
    let swalMessage = this.translate.instant('if_you_selected_other_country') + '\n\n';
    if (this.restrictedOrderItems.length) {
      swalMessage = swalMessage + this.translate.instant('order_item_not_avail_in_this_region') + '\n';
      _.each(this.restrictedOrderItems, (item, key) => {
        const logNumber = (key + 1);
        if (item.UsePoints) {
          swalMessage = swalMessage + logNumber + '. ' + item.ProductName + '(' + this.translate.instant('reward_order_item_not_avail_in_this_region') + ')' + ',\n';
        }
        else {
          swalMessage = swalMessage + logNumber + '. ' + item.ProductName + ',\n';
        }
      });
    }

    if (this.restrictedAutoOrderItems.length) {
      swalMessage = swalMessage + this.translate.instant('autoship_item_not_avail_new_region');
      _.each(this.restrictedAutoOrderItems, (item, key) => {
        const logNumber = (key + 1);
        swalMessage = swalMessage + logNumber + '. ' + item.ProductName + ',\n';
      });
    }
    return swalMessage;
  }

  public marketSwalCheckItems(swalText, country, languagecode, shippingCall, checkRestriction) {
    const dialogData = new ConfirmDialogModel(
      this.translate.instant('trying_change_country'),
      this.translate.instant(swalText),
      this.translate.instant('NO'),
      this.translate.instant('YES')
    );

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      disableClose: true,
      panelClass: '',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        if (this.configService.commonData.selectedCountry.toLowerCase() !== country.CountryCode.toLowerCase()) {
          this.userService.newshippingAddress = {};
          this.userService.shippingAddress = {} as ShippingAddress;
          this.userService.regionMainState = '';
          this.userService.restrictedStates = [];
          this.userService.selectedShippingMethod = 0;
          this.userService.shippingMethods = [];
          if (this.userService.customerData.DefaultShippingAddress) {
            this.userService.customerData.DefaultShippingAddress = {};
          }
          this.userService.paymentMethods = [];
          this.paymentService.clearPayment();
          localStorage.removeItem('paymentService');
        }

        if (shippingCall) {
          if (checkRestriction) {
            this.itemsListService.checkRestrictedState(true, country, '', '', this.persistentService.retailData.uniqueCategoryId, '', true, false, false).then(() => {
              this.updateCountryLanguage(country, languagecode);
            });
          } else {
            this.updateCountryLanguage(country, languagecode);
          }
        } else {
          this.configService.commonData.selectedCountry = country.CountryCode.toLowerCase();
          this.configService.commonData.selectedLanguage = languagecode.toLowerCase();
          this.configService.setSelectedCountry(country.CountryCode.toLowerCase(), languagecode.toLowerCase());

          if (checkRestriction) {
            this.itemsListService.checkRestrictedState(true, country, '', '', this.persistentService.retailData.uniqueCategoryId, '', '', false, false).then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 500);
            });
          } else {
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }
      } else {
        this.userService.restrictedStates = this.oldRestrictedState;
        this.userService.regionMainState = this.oldRegionMainState;
        if (sessionStorage.getItem('CommonSettings')) {
          const data = JSON.parse(sessionStorage.getItem('CommonSettings'));
          this.configService.commonData.selectedCountry = data.selectedCountry;
          this.configService.commonData.selectedLanguage = data.selectedLanguage;

        }
        if (shippingCall) {
          this.userService.newshippingAddress.Country = this.configService.commonData.selectedCountry.toUpperCase();
          location.reload();
        }
      }
    });
  }

  updateCountryLanguage(country, languagecode) {
    this.userService.newshippingAddress = {};
    this.userService.newshippingAddress.Country = country.CountryCode;
    if (this.userService.customerData && Object.keys(this.userService.customerData).length > 0 && (this.userService.customerData.PrimaryAddress?.CountryCode.toLowerCase() == this.userService.newshippingAddress.Country.toLowerCase())) {
      this.userService.newshippingAddress.Region = this.userService.customerData.PrimaryAddress.Region;
    }
    else {
      this.userService.newshippingAddress.Region = 'null';
    }
    this.configService.commonData.selectedCountry = country.CountryCode.toLowerCase();
    const allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'));
    _.each(allowedCountries.Data, (item) => {
      if (item.CountryCode.toLowerCase() == country.CountryCode.toLowerCase()) {
        this.configService.commonData.selectedLanguage = languagecode;
      }
    });
    this.configService.setSelectedCountry(country.CountryCode.toLowerCase(), this.configService.commonData.selectedLanguage);
  }

  public clearItems() {
    this.isKitAdded = {};
    this.orderQuantity = {};
    this.autoshipQuantity = {};
    this.itemsService.selectedPacks = [];
    this.itemsService.selectedOrderItems = [];
    this.itemsService.selectedAutoOrderItems = [];
  }

  public getCartItems(cartItems) {
    if (cartItems) {
      if (!JSON.parse(localStorage.getItem('isLoggedIn'))) {
        this.clearItems();
      } else {
        localStorage.removeItem('isLoggedIn');
      }

      _.each(cartItems.Order, (cartItem) => {
        const isOrderItemExist = _.some(this.itemsService.selectedOrderItems, (item) => {
          if (item.HasOptions) {
            _.each(item.OptionsMap, (value) => {
              if (value.ItemId == item.ItemID) {
                item.ItemID = value.ItemId;
                return;
              }
            });
          }
          return (
            item.ItemID == cartItem.ItemID
          );
        });
        if (!isOrderItemExist) {
          this.itemsService.selectedOrderItems.push(cartItem);
          this.orderQuantity[cartItem.ItemID] = cartItem.Quantity;
        }
      });

      _.each(cartItems.Autoship, (cartItem) => {
        const isAutoItemExist = _.some(this.itemsService.selectedAutoOrderItems, (item) => {
          if (item.HasOptions) {
            _.each(item.OptionsMap, (value) => {
              if (value.ItemId == item.ItemID) {
                item.ItemID = value.ItemId;
                return;
              }
            });
          }
          return (
            item.ItemID == cartItem.ItemID
          );
        });
        if (!isAutoItemExist) {
          this.itemsService.selectedAutoOrderItems.push(cartItem);
          this.autoshipQuantity[cartItem.ItemID] = cartItem.Quantity;
        }

      });

      _.each(cartItems.Packs, (cartItem) => {
        const isPacksItemExist = _.some(this.itemsService.selectedPacks, (item) => {
          if (item.HasOptions) {
            _.each(item.OptionsMap, (value) => {
              if (value.ItemId == item.ItemID) {
                item.ItemID = value.ItemId;
                return;
              }
            });
          }
          return (
            item.ItemID == cartItem.ItemID
          );
        });
        if (!isPacksItemExist) {
          this.itemsService.selectedPacks.push(cartItem);
          this.packQuantity[cartItem.ItemID] = cartItem.Quantity;
        }
      });
    }
  }
  public resetItemQuantities() {
    if (this.itemsService.selectedPacks.length > 0) {
      const packtemp = {};
      this.itemsService.selectedPacks.forEach((item) => {
        packtemp[item.ItemID] = item.Quantity;
      });
      this.packQuantity = packtemp;
    }
    else {
      this.packQuantity = {};
    }

    if (this.itemsService.selectedOrderItems.length > 0) {
      const ordertemp = {};
      const orderRewardtemp = {};
      this.itemsService.selectedOrderItems.forEach((item) => {
        if (!item.UsePoints) {
          ordertemp[item.ItemID] = item.Quantity;
        }
        else if (item.UsePoints) {
          orderRewardtemp[item.ItemID] = item.rewardQuantity;
        }
      });
      this.orderQuantity = ordertemp;
    }
    else {
      this.orderQuantity = {};
      this.orderRewardQuantity = {};
    }

    if (this.itemsService.selectedAutoOrderItems.length > 0) {
      const autoordertemp = {};
      this.itemsService.selectedAutoOrderItems.forEach((item) => {
        autoordertemp[item.ItemID] = item.Quantity;
      });
      this.autoshipQuantity = autoordertemp;
    }
    else {
      this.autoshipQuantity = {};
    }
  }
}
