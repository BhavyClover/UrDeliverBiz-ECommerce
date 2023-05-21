import { ShoppingCartService } from './shopping-cart.service';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscriber } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { DSProduct } from 'src/app/modals/dsproduct.modal';
import { RestApiService } from './restapi.service';
import { UserService } from './user.service';
import * as _ from 'lodash';
import { UtilityService } from './utility.service';
import { CompanyService } from './company.service';
import { ConfigService } from './config.service';


// Get product from Localstorage
const products = JSON.parse(localStorage.getItem('compareItem')) || [];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  public catalogMode: boolean = false;
  public allItems: any;
  private url1: string = 'assets/data/';
  public url = 'assets/data/banners.json';

  public compareProducts: BehaviorSubject<any> = new BehaviorSubject([]);
  public observer: Subscriber<{}>;
  public selectedPacks: any = [];
  public selectedOrderItems: any = [];
  public selectedAutoOrderItems: any = [];
  public packs = [];
  public orders = [];
  public autoship = [];
  public IsAllowDynamicCouponcode: boolean = true;
  previousRequest = {};
  userServiceModal: any;
  constructor(
    private httpClient: HttpClient,
    public snackBar: MatSnackBar,
    public apiService: RestApiService,
    public user: UserService,
    public utilityService: UtilityService,
    public companyService: CompanyService,
    public configService: ConfigService,
    public shoppingCartService: ShoppingCartService
  ) {
    this.compareProducts.subscribe(products => products = products);
    this.userServiceModal = this.user.userServiceModal;
    this.init();
  }

  private products(req?: any): Observable<any> {
    const request = {
      CurrencyCode: req?.CurrencyCode || this.companyService.selectedCurrency?.CurrencyCode || 'USD',
      LanguageCode: req?.LanguageCode || this.configService.commonData.selectedLanguage || 'en',
      RegionID: req?.RegionID || 1,
      PriceGroup: req?.PriceGroup || this.userServiceModal.customerTypeID || 2,
      StoreID: req?.StoreID || this.shoppingCartService.getShoppingCart(1)[0]?.StoreID || (this.userServiceModal.customerTypeID == 2 ? 3 : 2),
      CategoryId: req?.CategoryId || 0
    };
    return this.apiService.getItemsbyFilter(request).pipe(map(items => {
      this.allItems = items.Data;
      return items.Data;
    }));
  }

  public banners(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.url);
  }


  // Get Banners
  public getBanners() {
    return this.banners();
  }

  // Get Banners
  public getProducts(request?: any): Observable<Array<DSProduct>> {
    this.previousRequest = this.previousRequest || request;
    if (this.allItems && this.allItems.length > 0 && _.isEqual(this.previousRequest, request)) {
      const itemsStream = new Observable(observer => {
        observer.next(this.allItems);
        observer.complete();
      });
      return itemsStream as Observable<any>;
    } else {
      return this.products(request);
    }
  }
  public getRelatedProducts(product: DSProduct): Observable<any[]> {
    const request = {
      CategoryId: product.CategoryId,
      NumberOfProducts: 5,
      CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
      LanguageCode: this.configService.commonData.selectedLanguage || 'en',
      RegionID: this.companyService.getRegionID(this.configService.commonData?.selectedCountry),
      PriceGroup: this.userServiceModal.customerTypeID,
      StoreID: this.shoppingCartService.getShoppingCart(1)[0]?.StoreID,
      CountryCode: this.configService.commonData.selectedCountry
    };
    return this.apiService.getTopSellingProducts(request);
  }

  // Get Products By Id
  public getProduct(id: number): Observable<any> {
    if (this.allItems && this.allItems.length > 0) {
      const product = this.allItems.find((item: any) => {
        return item.ItemID == id;
      });
      const itemsStream = new Observable(observer => {
        observer.next(product);
        observer.complete();
      });
      return itemsStream as Observable<any>;
    } else {
      return this.products().pipe(map(items => {
        const products = items;
        return products.find((item: any) => {
          return item.ItemID == id;
        });
      }));
    }
  }


  /*
---------------------------------------------
----------  Compare Product  ----------------
---------------------------------------------
*/

  // Get Compare Products
  public getComapreProducts(): Observable<any[]> {
    const itemsStream = new Observable(observer => {
      observer.next(products);
      observer.complete();
    });
    return itemsStream as Observable<DSProduct[]>;
  }

  // If item is aleready added In compare
  public hasProduct(product: any): boolean {
    const item = products.find(item => item.Id === product.id);
    return item !== undefined;
  }

  // Get Products By Slug
  public getProductBySlug(slug: string): Observable<any> {
    return this.products().pipe(map(items => {
      return items.find((item: any) => {
        return item.name.replace(' ', '-') === slug;
      });
    }));
  }

  // Add to compare
  public addToCompare(product: any): any | boolean {
    let message, status;
    let item: any | boolean = false;
    if (this.hasProduct(product)) {
      item = products.filter(item => item.id === product.id)[0];
      const index = products.indexOf(item);
      this.snackBar.open('The product  ' + product.name + ' already added to comparison list.', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });

    } else {
      if (products.length < 4) {
        products.push(product);
      }
      message = 'The product ' + product.name + ' has been added to comparison list.';
      status = 'success';
      this.snackBar.open(message, '×', { panelClass: [status], verticalPosition: 'top', duration: 3000 });

    }
    localStorage.setItem('compareItem', JSON.stringify(products));
    return item;
  }

  // Removed Product
  public removeFromCompare(product: any) {
    if (product === undefined) { return; }
    const index = products.indexOf(product);
    products.splice(index, 1);
    localStorage.setItem('compareItem', JSON.stringify(products));
  }

  // Get Products By category
  public getProductByCategory(request?: any): Observable<any[]> {
    return this.products(request);
  }

  private init() {
    if (localStorage.getItem('cart.packs')) {
      this.selectedPacks = JSON.parse(localStorage.getItem('cart.packs'));
    }
    if (localStorage.getItem('cart.order')) {
      this.selectedOrderItems = JSON.parse(localStorage.getItem('cart.order'));
    }
    if (localStorage.getItem('cart.autoship')) {
      this.selectedAutoOrderItems = JSON.parse(localStorage.getItem('cart.autoship'));
    }
  }
}
