import { ShoppingCartService } from './shopping-cart.service';
import { cloneDeep } from 'lodash';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';
import { OrderService } from './order.service';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../model/confirm-dialog/confirm-dialog.component';
import { UtilityService } from './utility.service';
import { CompanyService } from './company.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ItemsListService {
  public isShowViewButton: boolean = false;
  public totalItem: any = {};
  public buttonText: any = {};
  public productList: any = [];
  public categoryList: any = [];
  public products: any = [];
  public selectedCategory: string = 'all';
  public selectedCategoryType: string = '';
  public selectedCategories: any = {};
  public allProductList: any = [];
  userServiceModal: UserServiceModal;
  public type: any;
  swalErrorMsg: string;


  constructor(
    private itemsService: ProductService,
    public snackBar: MatSnackBar,
    public orderService: OrderService,
    public userService: UserService,
    public route: Router,
    public notificationService: NotificationService,
    public translate: TranslateService,
    private dialog: MatDialog,
    public utilityService: UtilityService,
    public companyService: CompanyService,
    public configService: ConfigService,
    public shoppingCartService: ShoppingCartService
  ) {
    this.userServiceModal = this.userService.userServiceModal;
  }

  viewAll(index) {
    if (this.totalItem[index] === 4) {
      this.totalItem[index] = 100;
      this.buttonText[index] = 'view_less';
    } else {
      this.totalItem[index] = 4;
      this.buttonText[index] = 'view_more';
    }
  }

  checkSelect(type) {
    if (type && type != 'all') {
      for (const i in this.selectedCategories) {
        if (this.selectedCategories[i] === true) {
          return;
        }
      }
      this.selectedCategories['all'] = true;
      _.each(this.categoryList, (item) => {
        this.selectedCategories[item.CategoryId] = true;
      });
    } else {

      let checkselectall = false;
      if (this.categoryList.length >= 1) {
        _.each(this.categoryList, (item) => {
          if (this.selectedCategories['all'] === true) {
            this.selectedCategories[item.CategoryId] = true;
            checkselectall = true;
          } else {
            this.selectedCategories[item.CategoryId] = false;
            checkselectall = false;
          }
        });
      } else {
        this.selectedCategories['all'] = true;
      }
      if (!checkselectall) {
        if (this.categoryList.length > 0) {
          this.selectedCategories[this.categoryList[0].CategoryId] = true;
        }
        this.productList = _.filter(this.products, (item) => {
          if (typeof type === 'string' || typeof type === 'number') {
            return item.CategoryId == type;
          } else {
            return this.selectedCategories[item.CategoryId];
          }
        });
        return true;
      }
    }
  }
  getItemsByCategory(type = null) {
    this.selectedCategory = type || 'all';
    type = (type === '[object Object]') ? 'all' : type;
    if (type && type != 'all') {
      if (typeof type === 'string' || typeof type === 'number') {
        this.selectedCategories['all'] = false;
        _.each(this.categoryList, (item) => {
          if (item.Category.toLowerCase() != type.toString().toLowerCase()) {
            this.selectedCategories[item.CategoryId] = false;
          }
          else if (item.Category.toLowerCase() == type.toString().toLowerCase()) {
            this.selectedCategories[item.CategoryId] = true;
          }
        });
      } else {
        this.checkSelect(type);
      }

      this.productList = _.filter(this.products, (item) => {
        if (typeof type === 'string' || typeof type === 'number') {
          return item.Category.toLowerCase() == type.toString().toLowerCase();
        } else {
          return type[item.CategoryId];
        }
      });
    } else {
      this.isShowViewButton = true;
      if (!this.checkSelect(type)) {
        this.productList = this.products;
      }
    }
    if (this.selectedCategories['all'] == true) {
      this.selectedCategoryType = 'all';
    } else if (this.productList.length > 0) {
      this.selectedCategoryType = this.productList[0].CategoryDescription || '';
    }
  }

  groupByKeepOrder(arr, prop) {
    const newArr = [];
    const wrapObj = {};

    _.forEach(arr, (item) => {
      let propName = item[prop];
      if (propName) {
        propName = propName.toString();
        if (!wrapObj[propName]) {
          wrapObj[propName] = [];
          newArr.push(wrapObj[propName]);
        }
        // adds item to the group
        wrapObj[propName].push(item);
      }
    });
    // delete wrapObj; // don't need this anymore
    return newArr;
  }

  checkRestrictedState(countrycall, country, CheckoutCall, swalcheck, uniqueCategoryIdCheck, productCall, newRegionCall, isRedirect, isReload) {
    const promise = new Promise((resolve, reject) => {
      const request = {
        CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
        LanguageCode: this.configService.commonData.selectedLanguage || 'en',
        RegionID: newRegionCall ? this.companyService.getRegionID(this.configService.commonData.selectedCountry) : 1,
        PriceGroup: this.userServiceModal.customerTypeID,
        StoreID: this.shoppingCartService.getShoppingCart(1)[0]?.StoreID,
        CategoryId: 0
      };
      this.itemsService.getProducts(request).subscribe((result: any) => {
        try {
          let preOrderLength = 0;
          let preAutoOrderLength = 0;
          if (result.length > 0) {
            preOrderLength = this.itemsService.selectedOrderItems.length;
            preAutoOrderLength = this.itemsService.selectedAutoOrderItems.length;

            if (this.itemsService.selectedOrderItems.length > 0) {
              const selectedOrder = cloneDeep(this.itemsService.selectedOrderItems);
              this.itemsService.selectedOrderItems = [];
              _.each(selectedOrder, (product) => {
                const itemDetails = _.filter(result, (item) => {
                  if (item.HasOptions) {
                    _.each(item.OptionsMap, (value) => {
                      if (value.ItemId == product.ItemID) {
                        item.ItemID = value.ItemId;
                        return;
                      }
                    });
                  }
                  if (item.ItemID == product.ItemID && product.selectedOptions) {
                    item.selectedOptions = product.selectedOptions;
                  }
                  return (item.ItemID == product.ItemID);
                });
                if (itemDetails.length > 0) {
                  const optionItem = cloneDeep(itemDetails[0]);
                  if (!product.UsePoints) {
                    optionItem.Quantity = product.Quantity;
                    optionItem.UsePoints = false;
                  }
                  else if (product.UsePoints) {
                    optionItem.UsePoints = product.UsePoints;
                    optionItem.rewardQuantity = product.rewardQuantity;
                  }
                  this.itemsService.selectedOrderItems.push(optionItem);
                }
              });
              if (this.itemsService.selectedOrderItems.length !== preOrderLength) {
                this.swalErrorMsg = 'error_some_items_not_exist';
              }
            }
            if (this.itemsService.selectedAutoOrderItems.length > 0) {
              const selectedAutoOrder = cloneDeep(this.itemsService.selectedAutoOrderItems);
              this.itemsService.selectedAutoOrderItems = [];
              _.each(selectedAutoOrder, (product) => {
                const itemDetails = _.filter(result, (item) => {
                  if (item.HasOptions) {
                    _.each(item.OptionsMap, (value) => {
                      if (value.ItemId == product.ItemID) {
                        item.ItemID = value.ItemId;
                        return;
                      }
                    });
                  }
                  if (item.ItemID == product.ItemID && product.selectedOptions) {
                    item.selectedOptions = product.selectedOptions;
                  }
                  return (item.ItemID == product.ItemID && item.AllowAutoship);
                });
                if (itemDetails.length > 0) {
                  const optionItem = cloneDeep(itemDetails[0]);
                  optionItem.Quantity = product.Quantity;
                  optionItem.UsePoints = false;
                  this.itemsService.selectedAutoOrderItems.push(optionItem);
                }
              });
              if (this.itemsService.selectedAutoOrderItems.length !== preAutoOrderLength) {
                this.swalErrorMsg = 'error_some_items_not_exist';
              }
            }
          } else {
            this.allProductList = [];
            this.itemsService.selectedOrderItems = [];
            this.itemsService.selectedAutoOrderItems = [];
            this.swalErrorMsg = 'error_products_not_exist_in_region';
          }

          localStorage.setItem('cart.order', JSON.stringify(this.itemsService.selectedOrderItems));
          if (this.itemsService.selectedOrderItems.length === 0) {
            this.orderService.calculateOrderResponse = {};
          } else {
            this.orderService.calculateOrder();
          }

          localStorage.setItem('cart.autoship', JSON.stringify(this.itemsService.selectedAutoOrderItems));
          if (this.itemsService.selectedAutoOrderItems.length === 0) {
            this.orderService.calculateAutoOrderResponse = {};
          } else {
            this.orderService.calculateAutoOrder();
          }
          // check user logged in and has selectedOrders
          if ((this.itemsService.selectedAutoOrderItems.length !== preAutoOrderLength) || (this.itemsService.selectedOrderItems.length !== preOrderLength)) {
            if (countrycall || CheckoutCall || productCall) {
              this.userServiceModal.checkItems = false;
              if (swalcheck) {
                this.restrictedStateSwal(this.swalErrorMsg, productCall, isRedirect, isReload);
              } else if (isRedirect) {
                this.redirection();
              }
            }
          }
          resolve({ items: result, errorMsg: this.swalErrorMsg ? true : false });

        } catch (ex) {
          this.notificationService.error('Error', this.translate.instant('error_occured_try_again'));
          this.clearcart();
          if (countrycall || CheckoutCall || productCall) {
            this.userServiceModal.checkItems = false;
            this.route.navigate(['/products/all']);
          }
          reject(ex);
        }
      }, (error) => {
        this.clearcart();
        reject(error);
        this.route.navigate(['/products/all']);
      });
    });
    return promise;
  }

  clearcart() {
    this.allProductList = [];
    this.itemsService.selectedOrderItems = [];
    this.itemsService.selectedAutoOrderItems = [];
    localStorage.setItem('cart.order', JSON.stringify(this.itemsService.selectedOrderItems));
    localStorage.setItem('cart.autoship', JSON.stringify(this.itemsService.selectedAutoOrderItems));
    this.orderService.calculateOrderResponse = {};
    this.orderService.calculateAutoOrderResponse = {};
    this.userServiceModal.checkItems = false;
  }

  destory() {
    this.isShowViewButton = true;
    this.totalItem = {};
    this.buttonText = {};
    this.productList = [];
    this.categoryList = [];
    this.products = [];
  }

  redirection() {
    this.route.navigate(['/products/all']);
  }

  restrictedStateSwal(datatitle, productCall, isRedirect, isReload) {
    const dialogRef1 = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: {
        title: this.translate.instant(datatitle),
        message: '',
        takeaction: productCall ? this.translate.instant('ok_btn') : this.translate.instant('go_product'),
        noaction: this.translate.instant('stay_on_checkout'),
      },
      panelClass: '',
      disableClose: true,
      autoFocus: false

    });
    dialogRef1.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        if (isRedirect) {
          this.redirection();
        }
        if (isReload) {
          location.reload();
        }
      }
    });
  }
}
