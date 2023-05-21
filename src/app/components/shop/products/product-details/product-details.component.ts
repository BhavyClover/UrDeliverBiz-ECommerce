import { Component, OnInit, ViewChild, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { ProductService } from 'src/app/components/shared/services/product.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from 'src/app/components/shared/services/cart.service';
import { SwiperDirective, SwiperConfigInterface } from 'ngx-swiper-wrapper';
// import { ProductZoomComponent } from './product-zoom/product-zoom.component';
import { Cart1Service } from 'src/app/components/shared/services/cart1.service';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import * as _ from 'lodash';
import { ItemsListService } from 'src/app/components/shared/services/itemsList.service';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'src/app/components/shared/services/utility.service';
import { PersistentService } from 'src/app/components/shared/services/persistent.service';
import { AutoshipConfigurationService } from 'src/app/components/shared/services/autoshipConfiguration.service';
import { CompanyService } from 'src/app/components/shared/services/company.service';
import { environment } from 'src/environments/environment';
import { FlickityComponent } from 'src/app/components/pages/flickity/flickity.component';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'src/app/components/shared/model/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  public config: SwiperConfigInterface = {};
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();

  @ViewChild('zoomViewer', { static: true }) zoomViewer;
  @ViewChild(SwiperDirective, { static: true }) directiveRef: SwiperDirective;

  public product: any = {};
  public products: any[] = [];
  public allItems: { Category: any, CategoryId: any }[] = [];
  public relatedProducts: any[] = [];
  public orderOptions: any;
  public image: any;
  public zoomImage: any;
  ezpModel: any = {};
  event: any;
  activeImage: any = '';
  value: any = [];
  defaultImage: any = {};
  isOptionsSelected: boolean;
  public counter: number = 1;
  public OrderQuantityCount: any;
  itemTypes: any = {};
  index: number;
  bigProductImageIndex = 0;
  CartType: string;
  itemType: string;
  type: string;
  ItemID: any;
  isShowShareOptions: boolean;
  panelOpenSpecification: boolean = false;
  panelOpenAutoship: boolean = false;
  healthBeautyProduct = [];
  env: any;
  selectedCategory;
  constructor(
    private titleService: Title,
    private translate: TranslateService,
    public configService: ConfigService,
    private route: ActivatedRoute,
    public productsService: ProductService,
    public dialog: MatDialog,
    private router: Router,
    private cartService: CartService,
    private cart1Service: Cart1Service,
    public itemsService: ProductService,
    public itemsListService: ItemsListService,
    public activateroute: ActivatedRoute,
    public utilityService: UtilityService,
    public persistentService: PersistentService,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public companyService: CompanyService
  ) {
    // force route reload whenever params change;
    this.route.params.subscribe(params => {
      this.ItemID = +params['id'];
      this.activateroute.queryParams.subscribe(queryparam => {
        this.itemType = queryparam.itemtype || queryparam.itemType;
        this.router.navigate(['.'], { relativeTo: this.route, queryParams: { itemtype: null, itemType: null }, replaceUrl: true });
        window.scroll(0, 0);
        this.productsService.getProduct(this.ItemID).subscribe(product => {
          this.product = product ? [product] : [];
          this.itemsService.selectedOrderItems.filter((x) => {
            if (x.ItemID == this.product[0].ItemID) {
              this.product.Quantity = x.Quantity;
            }
          });
          const dialogData = new ConfirmDialogModel(
            this.translate.instant('update_product_title'),
            this.translate.instant('update_product_text'),
            this.product.length > 0 ? this.translate.instant('NO') : '',
            this.product.length > 0 ? this.translate.instant('YES') : this.translate.instant('ok_btn')
          );
          if (this.product.length == 0) {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              maxWidth: '400px',
              data: dialogData,
              autoFocus: false
            });
            dialogRef.afterClosed().subscribe((dialogresult) => {
              if (dialogresult) {
                this.router.navigateByUrl('products/all');
              }
            });
          }
          this.OrderQuantityCount = product && product.Quantity ? product.Quantity : 1;
          this.onItemsSucces(this.product);
          this.setUpOrderOptions(this.product);
        });
      });
      this.defaultImage = {
        Path: 'assets/images/noimage.png',
        Description: this.product ? this.product.Description : ''
      };
      this.CartType = this.itemType || 'order';
      this.type = this.CartType;
    });
    this.itemTypes = {
      pack: {
        getItemsCall: 'GetEnrollmentKitItems',
        itemQuantity: 'packQuantity',
        cartItems: 'selectedPacks',
        itemserviceCall: 'getPackItems'
      },
      order: {
        getItemsCall: 'GetProducts',
        itemQuantity: 'orderQuantity',
        cartItems: 'selectedOrderItems',
        itemserviceCall: 'getOrderItems'
      },
      autoship: {
        getItemsCall: 'GetAutoshipItems',
        itemQuantity: 'autoshipQuantity',
        cartItems: 'selectedAutoOrderItems',
        itemserviceCall: 'getAutoshipItems'
      }
    };
    this.env = environment;
  }

  ngOnInit() {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_productdetails') + ' | ' + text);
    });
    this.autoshipConfigurationService.init();
  }

  ngAfterViewInit() {
    this.config = {
      observer: true,
      direction: 'horizontal',
      slidesPerView: 3,
      spaceBetween: 10,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 1
        },
        740: {
          slidesPerView: 2
        },
        960: {
          slidesPerView: 3
        },
        1280: {
          slidesPerView: 3
        }
      }
    };
  }

  public onItemsSucces(result) {
    this.itemType = this.type === 'order' ? 'order' : this.type == 'pack' ? 'pack' : 'autoship';
    this.itemsService[this.itemType] = result.map((item) => {
      item.Price = item.Price || item.Prices[0].Price;
      return item;
    });
    this.itemsListService.products = this.itemsService[this.itemType];
    this.itemsListService.type = this.type;
    const selectedItem = this.product;
    this.products = result.map((item) => {
      item.Price = item.Price || item.Prices[0].Price;
      return item;
    });
    if (selectedItem) {
      this.products = _.filter(this.products, (product) => {
        return product.ItemID != selectedItem.ItemID;
      });
    }
    if (this.ItemID) {
      let isItemExists = false;
      _.each(result, (item) => {
        if (item.HasOptions) {
          _.each(item.OptionsMap, (value) => {
            if (value.ItemId == this.ItemID) {
              item.ItemID = this.ItemID;
              return;
            }
          });
        }
        if (isNaN(this.ItemID) ? ((item.ProductName || '').toLowerCase().replace(/\s/g, '') == this.ItemID.toLowerCase().replace(/\s/g, '')) : (item.ItemID == this.ItemID)) {
          isItemExists = true;
          this.product = this.transformItem(item);
          this.OrderQuantityCount = selectedItem ? (selectedItem.Quantity || 1) : 1;
          item.Quantity = selectedItem ? (selectedItem.Quantity || 1) : 1;
          localStorage.setItem('params.type', this.type);
          localStorage.setItem('params.productList', JSON.stringify(this.products));
        }
      });
      if (!isItemExists) {
        this.router.navigate(['/Products']);
      }
    }
  }
  public transformItem(item) {
    this.isShowShareOptions = false;
    item.Price =
      item.Price || item.Price === 0
        ? item.Price
        : item.Prices && item.Prices[0] && item.Prices[0].Price;
    item.Images = item.Images || [];
    if (item) {
      Object.keys(item.Prices).forEach((p: any) => {
        if (p.CurrencyCode && p.CurrencyCode.toLowerCase() === 'rwd' && p.Price > 0) {
          item.UsePoints = true;
        }
      });
    }
    if (
      item.LargeImageUrl &&
      !_.find(item.Images, { Path: item.LargeImageUrl })
    ) {
      item.Images.unshift({
        Description: item.Description,
        Path: item.LargeImageUrl
      });
    } else if (item.Image && !_.find(item.Images, { Path: item.Image })) {
      item.Images.unshift({
        Description: item.Description,
        Path: item.Image
      });
    }
    this.isShowShareOptions = true;
    return item;
  }

  public selectImage(index, image) {
    this.bigProductImageIndex = index;
  }

  public increaseQuantity() {
    if (this.OrderQuantityCount < 99) {
      this.OrderQuantityCount++;
    }
  }

  public decreaseQuantity() {
    if (this.OrderQuantityCount > 1) {
      this.OrderQuantityCount--;
    }
  }

  getRelatedProducts(products) {
    this.productsService.getRelatedProducts(products).subscribe((product: any[]) => {
      this.relatedProducts = product['Data'];
    });
  }

  // Add to cart
  public addToCart(type, product: any) {
    this.currentQuantity(type, product);
    this.cart1Service.addToCart(
      product,
      true,
      this.getItemCode(product), // product.Sku
      type === 'autoship',
      true,
      type === 'pack',
      false
    );
    this.product.Quantity = this.OrderQuantityCount;
  }

  public filterItemOptionID(type, product) {
    const optionMap = [];
    product.OptionsMap.forEach((x) => {
      optionMap.push(x.Key);
    });
    const selectoption = product.selectedOptions.replace('[', '').replace(']', '').split(',');
    selectoption.forEach(element => {
      optionMap.filter((x, index) => {
        if (!x.includes(element.trim())) {
          optionMap.splice(index, 9999);
        }
      });
    });
    product.OptionsMap.filter((key) => {
      if (key.Key == optionMap[0]) {
      }
    });
    this.addToCart(type, product);
  }
  // Add to cart
  public buyNow(product: any, quantity) {
    if (quantity > 0) {
      this.cartService.addToCart(product, parseInt(quantity, 10));
      this.router.navigate(['/checkout']);
    }
  }

  public onMouseMove(e) {
    if (window.innerWidth >= 1280) {
      let image, offsetX, offsetY, x, y, zoomer;
      image = e.currentTarget;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
      x = (offsetX / image.offsetWidth) * 100;
      y = (offsetY / image.offsetHeight) * 100;
      zoomer = this.zoomViewer.nativeElement.children[0];
      if (zoomer) {
        zoomer.style.backgroundPosition = x + '% ' + y + '%';
        zoomer.style.display = 'block';
        zoomer.style.height = image.height + 'px';
        zoomer.style.width = image.width + 'px';
      }
    }
  }

  onMouseLeave(event) {
    this.zoomViewer.nativeElement.children[0].style.display = 'none';
  }

  getPrice(item, quantity) {
    if (quantity < 1) {
      this.OrderQuantityCount = 1;
    }
    return item ? (item.Price || (item.Prices && item.Prices[0].Price)) * quantity : 0;
  }
  checkOptions(option) {
    let count = 0;
    this.value.forEach((item) => {
      if (item) {
        count++;
      }
    });

    this.isOptionsSelected = (count === option.length);
  }
  currentQuantity(type, item) {
    type = type || this.itemType;
    this.cart1Service[this.itemTypes[type].itemQuantity] =
      this.cart1Service[this.itemTypes[type].itemQuantity] || {}; // TODO::check if needed
    this.cart1Service[this.itemTypes[type].itemQuantity][this.getItemCode(item)] =
      this.OrderQuantityCount;
  }

  setUpOrderOptions(item) {
    if (!this.orderOptions) {
      this.orderOptions = {};
    }

    const dict = this.orderOptions;

    // If editing an item with selected customizations, find them and set the dropdowns
    let optionsMap;
    _.each(item.OptionsMap, (val) => {
      val.OptionNames = val.Key.split('|');
    });
    if (item.selectedOptions) {
      item.OptionsMap.some(optMap => {
        if (optMap.ItemId === (item.KitCustomItemCode || item.ItemID)) {
          optionsMap = optMap.OptionNames;
          return true;
        }
        return false;
      });
    }

    // Otherwise, default to the first options map
    const optionMapNames = item.OptionsMap
      ? item.OptionsMap.map(optMap => {
        return optMap.OptionNames;
      })
      : [];

    if (!item.selectedOptions || !optionsMap) {
      optionsMap = optionMapNames[0];
    }

    // Loop through the OptionsMap
    let optionVal;
    let optionValues;
    for (const index in optionsMap) {
      if (optionsMap.hasOwnProperty(index)) {
        optionVal = optionsMap[index];
        // For each option in the OptionsMap, loop through the ItemOptions
        for (const itemIndex in item.ItemOptions) {
          // Get all the values of the ItemOption
          if (item.ItemOptions.hasOwnProperty(itemIndex)) {
            optionValues = item.ItemOptions[itemIndex].Values.map(
              getOptionValueName
            );
            // If one of them is the value from the OptionsMap, use it
            const option = item.ItemOptions[itemIndex];
            if (
              !!~optionValues.indexOf(optionVal) &&
              !dict[this.getOrderOptionKey(item, option)]
            ) {
              dict[this.getOrderOptionKey(item, option)] = optionVal;
              break;
            }
          }
        }
      }
    }

    function getOptionValueName(val) {
      return val.Option;
    }
  }

  // change active image
  setActiveImage(image) {
    this.ezpModel = {
      small: image.Path || this.defaultImage.Path,
      large: image.Path || this.defaultImage.Path
    };
    setTimeout(() => {
      this.activeImage = image;
    }, 1);
  }

  selectOption(item, option, value, isKitItem) {
    option.selected = value.Option;
    this.orderOptions[this.getOrderOptionKey(item, option)] = value.Option;
    const tempOptData = [];
    Object.keys(this.orderOptions).forEach(optdata => {
      tempOptData.push(optdata);
    }),
      item.OptionsMap.forEach(itemOptdata => {
        if (
          JSON.stringify(tempOptData.sort()) ===
          JSON.stringify(itemOptdata.OptionNames.sort())
        ) {
          let tempimgurl = item.SmallImageUrl;
          if (itemOptdata.Image) {
            tempimgurl = item.SmallImageUrl.substr(
              0,
              item.SmallImageUrl.lastIndexOf('/')
            ).concat(itemOptdata.Image);
          }
          const tempimage = {
            Path: tempimgurl
          };
          this.setActiveImage(tempimage);
        }
      });
    // item.OptionsMap.filter((itemOptdata) => {
    this.itemsService.selectedOrderItems.filter((item) => {
      item.ItemOptions.filter((i) => {
        if (i.selected == option.selected) {
          this.OrderQuantityCount = item.Quantity;
        }
      });
    });
    // })

    if (isKitItem) {
      item.KitCustomItemCode = this.getItemCode(item);
    }
  }

  setInitialItemOption(option, value) {
    const defaultOption =
      this.orderOptions[this.getOrderOptionKey(this.product, option)] ||
      option.Option;
    if (value.Option === defaultOption) {
      option.selected = value.Option;
    }
  }

  getOrderOptionKey(item, option) {
    return item.ItemID + '__' + option.Option;
  }

  // Determine what values are available based on what's already been selected
  getValidValues(item, option, values) {
    // Get the already-selected option values (except this one and values from other items)
    const currentOption = this.getOrderOptionKey(item, option);
    const otherOptions = [];
    for (const key in this.orderOptions) {
      if (
        key === currentOption ||
        item.ItemID.toString() !== key.split('__')[0]
      ) {
        continue;
      }
      otherOptions.push(this.orderOptions[key]);
    }
    // Whittle down the OptionMaps to the ones that have all the already-selected options
    const optionMapNames = item.OptionsMap
      ? item.OptionsMap.map(optMap => {
        return optMap.OptionNames;
      })
      : [];
    const validOptionMaps = optionMapNames.filter(optNames => {
      // For each OptionMap, ensure that it contains all the other selected options
      let optionValue1;
      for (const index in otherOptions) {
        if (otherOptions.hasOwnProperty(index)) {
          optionValue1 = otherOptions[index];
          if (~optNames.indexOf(optionValue1)) {
            continue;
          }
          return false;
        }
      }
      return true;
    });

    // Union the validOptionMaps
    const validOptionValues = validOptionMaps.reduce((arr, optMap) => {
      let optionName;
      for (const index in optMap) {
        if (optMap.hasOwnProperty(index)) {
          optionName = optMap[index];
          if (!~arr.indexOf(optionName)) {
            arr.push(optionName);
          }
        }
      }
      return arr;
    }, []);

    // Set `isAvailable: true` on each option that can be found in validOptionNames, and `isAvailable: false` on the others
    let optionValue;
    for (const index in values) {
      if (values.hasOwnProperty(index)) {
        optionValue = values[index];
        optionValue.isAvailable = !!~validOptionValues.indexOf(
          optionValue.Option
        );
      }
    }

    // return the original values
    return values.filter(itm => {
      return itm.isAvailable;
    });
  }

  getOptionsText(optionValArray) {
    return '[' + optionValArray.join(', ') + ']';
  }

  getItemCode(item) {
    // If there are no customizations, just return the item code
    if (!item.ItemOptions || !item.ItemOptions.length || !item.HasOptions) {
      return this.product.ItemID;
    }

    // If there are customizations, find the right OptionsMap and use its code
    const optionValues = [];
    for (const key in this.orderOptions) {
      if (
        !this.orderOptions.hasOwnProperty(key) ||
        item.ItemID.toString() !== key.split('__')[0]
      ) {
        continue;
      }

      optionValues.push(this.orderOptions[key]);
    }

    optionValues.sort();

    item.selectedOptions = this.getOptionsText(optionValues);

    if (item.HasKitOptions) {
      item.KitGroups.forEach(kitGroup => {
        kitGroup.Items.forEach(this.getItemCode);
      });
    }

    let mapping;
    for (const index in item.OptionsMap) {
      if (item.OptionsMap.hasOwnProperty(index)) {
        mapping = item.OptionsMap[index];
        mapping.OptionNames.sort();
        if (_.isEqual(optionValues, mapping.OptionNames)) {
          return mapping.ItemId;
        }
      }
    }

    throw new Error(
      'Error: ' +
      item.ProductName +
      ' does not have a mapping for ' +
      optionValues.toString() +
      '.'
    );
  }

  openSelect(event) {
    this.event = event || this.event;
    // this is due to select input fields are not consistant in some browser
    if (window.screen.availWidth < 600 && !event) {
      setTimeout(() => {
      }, 100);
    }
  }

  hideAddToCart(item, isAutoShip = false) {
    if (!this.utilityService.isEmptyObject(item)) {
      const itemId = this.getItemCode(item);
      let isOrderAllow = false;
      if (item.OptionsMap?.length > 0 && isAutoShip) {
        _.each(item.OptionsMap, (value) => {
          if (value.ItemId == itemId) {
            if (isAutoShip) {
              isOrderAllow = item.AllowAutoship; // ? value.AllowAutoship : false;
            } else {
              isOrderAllow = value.isAllowOrder;
            }

          }
        });
      } else if (isAutoShip) {
        return item.AllowAutoship;
      } else {
        return item.isAllowOrder;
      }
      return isOrderAllow;
    }
  }
  getAllProductsCategories() {
    this.selectedCategory = { CategoryId: 'all' };
    this.productsService.getProductByCategory(this.selectedCategory).subscribe(products => {
      this.productsService.orders = products.map((item) => {
        item.Price = item.Price || (item.Prices && item.Prices[0] && item.Prices[0].Price);
        return item;
      });

      const uniqueItems = _.uniqBy(products, x => x.CategoryId);
      let uniqueRequireProduct = [];
      if (this.configService.localSettings.Global.CategoriesToFetch?.length > 0) {
        uniqueItems.filter((x) => {
          if (this.configService.localSettings.Global.CategoriesToFetch.indexOf(x.Category) > -1) {
            uniqueRequireProduct.push(x);
          }
        });
      }
      else {
        uniqueRequireProduct = [...uniqueItems];
      }
      this.itemsListService.selectedCategories = {};
      if (this.selectedCategory.Category == 'all') {
        this.itemsListService.selectedCategories['all'] = true;
      }
      this.itemsListService.categoryList = _.map(uniqueRequireProduct, (object) => {
        return _.pick(object, ['CategoryId', 'Category']);
      });
      this.itemsListService.products = this.productsService.orders;
      this.itemsListService.type = 'order';
      this.itemsListService.getItemsByCategory(this.selectedCategory.Category);

      this.products = this.itemsListService.productList.slice(0.8);
      this.allItems = this.itemsListService.categoryList;
      this.healthBeautyProducts();
    });
  }
  healthBeautyProducts() {
    this.itemsListService.getItemsByCategory(this.allItems[0].Category);
    this.healthBeautyProduct = this.itemsListService.productList.slice(0, 3);
  }
  addProduct(item) {
    if (item.ItemOptions.length > 0) {
      this.router.navigate(['/product', item.ItemID]);
    } else {
      this.OrderQuantityCount = item && item.Quantity ? item.Quantity : 1;
      if (this.cart1Service['orderQuantity'][item.ItemID] >= 1) {
        this.increaseQuantiy('order', item);
      } else {
        this.cart1Service['orderQuantity'][item.ItemID] = this.OrderQuantityCount;
        this.cart1Service.addToCart(item, true, item.ItemID, false, false, false, true);

      }
    }
  }
  increaseQuantiy(type, item) {
    this.cart1Service.increaseQuantiy(item, type == 'autoship', type == 'pack');
  }
  mouseEnter(index) {
    document.getElementById('btn' + index).classList.add('faded-in');
    document.getElementById('btn' + index).classList.remove('faded-out');
    setTimeout(() => {
      document.getElementById('btn' + index).style.opacity = '1';
      // document.getElementById('product'+index).style.opacity = "0"
      // document.getElementById('products'+index).style.opacity = "1"
    }, 590);

  }
  mouseOut(index) {
    document.getElementById('btn' + index).classList.add('faded-out');
    //  document.getElementById('product'+index).classList.remove("productIn")
    // if (index < 3) {
    //   (<HTMLImageElement>document.getElementById('product'+index)).src = this.productImages[index].url;
    // } else if(index < 10){
    //   (<HTMLImageElement>document.getElementById('product'+index)).src = this.mensProduct[(index-4)].url;
    // }else{
    //   (<HTMLImageElement>document.getElementById('product'+index)).src = this.newProduct[(index-10)].url;

    // }
    setTimeout(() => {
      document.getElementById('btn' + index).style.opacity = '0';
      // document.getElementById('products'+index).style.opacity = "0"
      // document.getElementById('product'+index).style.opacity = "1"
    }, 590);
    document.getElementById('btn' + index).classList.remove('faded-in');


  }
  goToShop(id) {
    this.router.navigate(['/product', id]);
    window.scroll(0, 0);
  }
  goToslider(id) {
    this.dialog.open(FlickityComponent, {
      data: { id: id },
      disableClose: true,
      panelClass: 'slider-dialog',
      autoFocus: false
    });
  }
  ngOnDestroy() {
    this.OrderQuantityCount = 1;
    this.cart1Service.resetItemQuantities();
  }
}


