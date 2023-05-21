import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { CartItem } from 'src/app/modals/cart-item';
import { CartService } from '../services/cart.service';
import { AppSettings, Settings } from '../services/color-option.service';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from '../services/account.service';
import { UserService } from '../services/user.service';
import { DSProduct } from 'src/app/modals/dsproduct.modal';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { RestApiService } from '../services/restapi.service';
import { CompanyService } from '../services/company.service';
import { HttpClient } from '@angular/common/http';
import { ItemsListService } from '../services/itemsList.service';
import { ProductService } from '../services/product.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public sidenavMenuItems: Array<any>;
  @Output() sildeMobileNavEvent = new EventEmitter<any>();
  public currencies = ['USD', 'EUR'];
  public currency: any;
  public flag: any;
  public userService: UserServiceModal;
  userServiceModal: UserServiceModal;
  products: Array<DSProduct>;
  welcmtext: string = '';
  public allItems: { Category: any, CategoryId: any }[] = [];
  public productlist: { Category: any, CategoryId: any }[] = [];
  indexProduct: number;
  shoppingCartItems: CartItem[] = [];
  public settings: Settings;
  isTop: boolean = true;
  currentRouterPath: any;
  HomeProductlist: any;

  constructor(private accountService: AccountService, private cartService: CartService, public appSettings: AppSettings, public translate: TranslateService, public user: UserService, public router: Router, public activatedRoute: ActivatedRoute, public configService: ConfigService, public apiService: RestApiService, public companyService: CompanyService, public http: HttpClient, public itemsListService: ItemsListService, public productsService: ProductService, public UserService: UserService
  ) {
    this.userServiceModal = this.UserService?.userServiceModal;
    this.settings = this.appSettings.settings;
    this.userService = this.user.userServiceModal;
    this.cartService.getItems().subscribe(shoppingCartItems => this.shoppingCartItems = shoppingCartItems);
    this.router.events.subscribe((event) => {
      this.currentRouterPath = router.url;
    });

  }

  run() {
    this.allItems = this.itemsListService.categoryList;
    const product = this.itemsListService.groupByKeepOrder(this.productsService.orders, 'CategoryId');
    let uniqueRequireProduct = [];
    if (this.configService.localSettings.Global.CategoriesToFetch?.length > 0) {
      product.filter((x) => {
        x.filter((item) => {
          if (this.configService.localSettings.Global.CategoriesToFetch.indexOf(item.Category) > -1) {
            uniqueRequireProduct.push(item);
          }
        });
      });
    }
    else {
      uniqueRequireProduct = [...product];
    }
    this.HomeProductlist = uniqueRequireProduct;
    const note: HTMLElement = document.querySelector('.' + (document.getElementById('header-menu').parentElement.className));
    note.style.width = '900px';
    note.style.height = '250px';
    if (screen.width < 1225) {
      note.style.width = '622px';
      note.style.height = '250px';
    }
  }

  ngOnInit() {
    this.currency = this.currencies[0];
    setTimeout(() => {
      this.welcmtext = this.translate.instant('welcome_');
    }, 3000);
  }
  toggleMobileMenu($event) {
    this.sildeMobileNavEvent.emit($event);
  }
  changeCurrency(currency) {
    this.currency = currency;
  }
  changeLang(flag) {
    this.flag = flag;
  }
  logout() {
    this.accountService.logout();
  }

  login() {
    this.router.navigateByUrl('/login');
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (window.scrollY > 60) {
      this.isTop = false;
    } else {
      this.isTop = true;
    }
  }

  isLoggedIn() {
    if ((Object.keys(this.userService.customerData).length) && (this.userService.customerData.CustomerId) && this.user.checkIfUserAuthenticatedOrNot()) {
      return true;
    } else {
      return false;
    }
  }
  memberLogin() {
    window.open('https://udb.office2.directscalestage.com/#/Login');
  }
  office(){
    let windowReference = window.open();
    let request = {
      CustomerID: this.userService.customerData.CustomerId,
      Dest: 'home'
    }
    this.apiService.getCustomerSSOURL(request).subscribe((result) => {
      windowReference.location = result.Data
    })
  }
}
