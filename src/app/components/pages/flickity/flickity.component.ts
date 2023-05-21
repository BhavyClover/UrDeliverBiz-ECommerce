import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { AutoshipConfigurationService } from '../../shared/services/autoshipConfiguration.service';
import { CompanyService } from '../../shared/services/company.service';
import { ConfigService } from '../../shared/services/config.service';
import { ItemsListService } from '../../shared/services/itemsList.service';
import { PersistentService } from '../../shared/services/persistent.service';
import { ProductService } from '../../shared/services/product.service';
import { UtilityService } from '../../shared/services/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

declare const require: any;
@Component({
  selector: 'app-flickity',
  templateUrl: './flickity.component.html',
  styleUrls: ['./flickity.component.scss']
})
export class FlickityComponent implements OnInit {
  ItemID: any;
  CartType: string;
  itemType: string;
  type: string;
  images: any;
  isShowShareOptions: boolean;
  defaultImage: any = {};
  public products: any[] = [];
  public product: any = {};
  public orderOptions: any;
  public OrderQuantityCount: any;
  env: any;

  constructor(private titleService: Title, public configService: ConfigService, private route: ActivatedRoute, public productsService: ProductService, public dialog: MatDialog, private router: Router, public itemsService: ProductService, public itemsListService: ItemsListService, public activateroute: ActivatedRoute, public utilityService: UtilityService, public persistentService: PersistentService, public autoshipConfigurationService: AutoshipConfigurationService, public companyService: CompanyService, @Inject(MAT_DIALOG_DATA) public data) {
    this.ItemID = data.id;
    this.defaultImage = {
      Path: 'assets/images/noimage.png',
      Description: this.product ? this.product.Description : ''
    };
    this.CartType = this.itemType || 'order';
    this.type = this.CartType;
    this.env = environment;
  }

  ngOnInit() {
    this.productsService.getProduct(this.ItemID).subscribe(product => {
      this.product = [product];
      this.images = this.product[0].Images;
      this.OrderQuantityCount = product && product.Quantity ? product.Quantity : 1;
      this.onItemsSucces([product]);
      this.setUpOrderOptions(this.product);
    });
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
  getOrderOptionKey(item, option) {
    return item.ItemID + '__' + option.Option;
  }

  call() {
    const Flickity = require('flickity');
    require('flickity-imagesloaded');
    require('flickity-as-nav-for');
    require('flickity-bg-lazyload');

    const carouselMain = document.getElementById('carouselMain');
    const carouselNav = document.getElementById('carouselNav');

    new Flickity(carouselMain, {
      pageDots: false,
      bgLazyLoad: true
    });

    new Flickity(carouselNav, {
      asNavFor: '#carouselMain',
      contain: true,
      pageDots: false,
      bgLazyLoad: true
    });
  }
}
