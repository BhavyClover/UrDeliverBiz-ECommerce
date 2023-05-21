import { Component, OnInit, Inject } from '@angular/core';
import { ProductService } from 'src/app/components/shared/services/product.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import * as _ from 'lodash';
import { CompanyService } from 'src/app/components/shared/services/company.service';
import { UserService } from 'src/app/components/shared/services/user.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';

@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent implements OnInit {
  userService: UserServiceModal;
  public products: any;
  public product: any;
  public counter: number = 1;
  public variantImage: any = '';
  public selectedColor: any = '';
  public selectedSize: any = '';
  public orderOptions: any;
  public OrderQuantityCount: any;
  itemType: string;
  itemTypes: any = {};
  ezpModel: any = {};
  event: any;
  activeImage: any;
  activeChildImage: any;
  defaultImage: any = {};
  value: any = [];
  isOptionsSelected: boolean;
  callbackService: any;
  showItemChooser: any;
  cartItem: any;
  childItem: any = {};
  public path: any;
  constructor(
    public configService: ConfigService,
    private router: Router,
    public user: UserService,
    public productsService: ProductService,
    public dialogRef: MatDialogRef<ProductDialogComponent>,
    public itemsService: ProductService,
    public companyService: CompanyService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.userService = this.user.userServiceModal;
    this.callbackService = data.service;
    this.itemType = data.type;
    this.product = data.value;
    this.OrderQuantityCount = data.value.Quantity || 1;
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
  }

  ngOnInit() {
    this.setUpOrderOptions(this.product);
    this.path = this.product?.ImageUrl;
  }

  changeimage(e: any) {
    this.path = e;
  }

  // determines whether or not buy button should be enabled
  buyButtonEnabled() {
    if (!this.product.HasOptions && this.product.ItemOptions && this.product.ItemOptions.length > 0 && this.isOptionsSelected) {
      return false;
    }

    return true;
  }

  // Add item to appropriate cart (autoship / order)
  addToCart(type, product: any) {
    if (this.cartItem && this.cartItem.ItemOptions && product.ItemOptions.length > 0) {
      const index = _.findIndex(this.itemsService[this.itemTypes[this.itemType].cartItems], { ItemID: this.cartItem.ItemID });
      this.itemsService[this.itemTypes[this.itemType].cartItems].splice(index, 1);
    }
    this.currentQuantity(type, product);
    // old add to cart method
    // this.callbackService.addToCart(product, true, this.getItemCode(product), type === 'autoship', true, type === 'pack', false);
    // new method below
    this.product.Quantity = this.OrderQuantityCount;

    if (this.itemType == 'autoship') {
      if (product?.HasOptions) {
        this.callbackService.addToCart(product, true, product?.CustomItemCode, true, true, false, true);
      } else {
        this.callbackService.addToCart(product, true, '', true, true, false, true);
      }
    } else if (this.itemType == 'order') {
      if (product?.HasOptions) {
        this.callbackService.addToCart(product, true, product?.CustomItemCode, false, true, false, true);
      } else {
        this.callbackService.addToCart(product, true, '', false, true, false, true);
      }
    } else if (this.itemType == 'pack') {
      if (product?.HasOptions) {
        this.callbackService.addToCart(product, true, product?.CustomItemCode, false, true, true, true);
      } else {
        this.callbackService.addToCart(product, true, '', false, true, true, true);
      }
    }

    this.close();
  }

  // add to cart or buy
  addToCartOrShowDetails(type, product) {
    this.itemType = type ? type : this.itemType;
    this.addToCart(this.itemType, product);
  }

  public close(): void {
    this.dialogRef.close();
  }

  public increment() {
    this.counter += 1;
  }

  public decrement() {
    if (this.counter > 1) {
      this.counter -= 1;
    }
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

  currentQuantity(type, item) {
    type = type || this.itemType;
    this.callbackService[this.itemTypes[type].itemQuantity] =
      this.callbackService[this.itemTypes[type].itemQuantity] || {};
    this.callbackService[this.itemTypes[type].itemQuantity][this.getItemCode(item)] =
      this.OrderQuantityCount;
  }

  setUpOrderOptions(item) {
    if (!this.orderOptions) {
      this.orderOptions = {};
    }

    const dict = this.orderOptions;

    // If editing an item with selected customizations, find them and set the dropdowns
    let optionsMap;
    _.each(item?.OptionsMap, (val) => {
      val.OptionNames = val.Key.split('|');
    });
    if (item?.selectedOptions) {
      item.OptionsMap.some(optMap => {
        if (optMap.ItemId === (item.CustomItemCode || item.ItemID)) {
          optionsMap = optMap.OptionNames;
          return true;
        }
        return false;
      });
    }

    // Otherwise, default to the first options map
    const optionMapNames = item?.OptionsMap
      ? item?.OptionsMap.map(optMap => {
        return optMap?.OptionNames;
      })
      : [];

    if (!item?.selectedOptions || !optionsMap) {
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
    setTimeout(() => {
      this.activeImage = image;
    }, 1);
  }

  setActiveChildImage(image) {
    this.activeChildImage = image;
  }

  // Show the price times the quantity selected
  getPrice(item, quantity) {
    if (quantity < 1) {
      this.OrderQuantityCount = 1;
    }
    return (item ? ((item.Price || item.Prices[0].Price) * quantity) : 0);
  }

  // Show the volume times the quantity selected
  getVolume(item, quantity) {
    return ((item.BusinessVolume || item.BusinessVolume === 0) ? item.BusinessVolume : item.PV) * quantity;
  }

  transformItem(item) {
    item.Price = (item.Price || item.Price === 0) ? item.Price : item.Prices[0].Price;

    item.Images = item.Images || [];
    if (item.LargeImageUrl && !_.find(item.Images, {
      Path: item.LargeImageUrl
    })) {
      item.Images.unshift({
        Description: item.Description,
        Path: item.LargeImageUrl
      });
    } else if (item.Image && !_.find(item.Images, {
      Path: item.Image
    })) {
      item.Images.unshift({
        Description: item.Description,
        Path: item.Image
      });
    }
    return item;
  }

  itemInCart(item) {
    const shoppingCart = this.itemsService[this.itemTypes[this.itemType].cartItems];
    return _.find(shoppingCart, {
      ItemID: item.ItemID
    });
  }

  // get kit item details
  getKitItemDetails(kitItem) {
    this.childItem = kitItem;
    this.activeChildImage = kitItem.Images ? kitItem.Images[0] : this.defaultImage;
  }

  // Select an option from a customization menu
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
    if (item?.HasOptions) {
      item.CustomItemCode = this.getItemCode(item);
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
  getValidValues(item, option, values): any {
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
    return values.filter(itm => {
      return itm.isAvailable;
    });
  }

  openSelect(event) {
    this.event = event || this.event;
    // this is due to select input fields are not consistant in some browser
    if (window.screen.availWidth < 600 && !event) {
      setTimeout(() => {
      }, 100);
    }
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

}
