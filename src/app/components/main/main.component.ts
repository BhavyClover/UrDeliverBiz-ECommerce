import { Component, OnInit, ViewChild } from '@angular/core';
import { CartItem } from '../../modals/cart-item';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SidebarMenuService } from '../shared/sidebar/sidebar-menu.service';
import { SidenavMenu } from '../shared/sidebar/sidebar-menu.model';
import { UserService } from '../shared/services/user.service';
import { FindEnrollerComponent } from '../shared/model/findenroller/findenroller.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../shared/services/config.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../shared/model/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { RestApiService } from '../shared/services/restapi.service';
import { MatSidenav } from '@angular/material/sidenav';
import { PaymentService } from '../shared/services/payment.service';
import { Cart1Service } from '../shared/services/cart1.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { DSProduct } from 'src/app/modals/dsproduct.modal';
import { UtilityService } from '../shared/services/utility.service';
import { ProductService } from '../shared/services/product.service';
import { ItemsListService } from '../shared/services/itemsList.service';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public sidenavMenuItems: Array<any>;
  public customerTypes: any;
  public allowedCountries: any = [];
  public country: any;
  public userType: any;
  userServiceModal: UserServiceModal;
  products: Array<DSProduct>;
  welcmtext: string = '';
  selectedLanguageCode: any;
  indexProduct: number;
  shoppingCartItems: CartItem[] = [];

  public banners = [];

  public categoriesList: any;
  public categoriesItemList: any;
  public url: any;
  navItems: SidenavMenu[] = [
    {
      displayName: 'Home',
      iconName: 'home',
      route: '/home'
    },
    {
      displayName: 'About',
      iconName: 'feedback',
      route: '/about'
    },
    {
      displayName: 'Join Us/ Customer Store',
      iconName: 'feedback',
      route: '/join'
    },
    {
      displayName: 'Contact Us',
      iconName: 'feedback',
      route: '/contact'
    },
    {
      displayName: 'Sign In',
      iconName: 'feedback',
      route: '/login'
    },
    {
      displayName: 'Log Out',
      iconName: 'feedback',
      route: '/logout'
    },
  ];
  @ViewChild('start') public sideBarMenu: MatSidenav;
  constructor(
    public activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    public configService: ConfigService,
    private dialog: MatDialog,
    public userService: UserService,
    public router: Router,
    private cart1Service: Cart1Service,
    public sidenavMenuService: SidebarMenuService,
    public apiService: RestApiService,
    public paymentService: PaymentService,
    public utilityService: UtilityService,
    public productService: ProductService,
    public itemsListService: ItemsListService,

  ) {
    this.userServiceModal = this.userService.userServiceModal;
    this.allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'));
  }

  ngOnInit() {
    setTimeout(() => {
      this.welcmtext = this.translate.instant('welcome_');
    }, 3000);

    const selectedCustomerTypeID = sessionStorage.getItem('selectedCustomerTypeID') === 'undefined' ? null : sessionStorage.getItem('selectedCustomerTypeID');

    let typeOfId = _.find(this.configService.commonSettings?.CustomerTypes, (customerType) => {
      return (customerType.ID === (parseInt(this.activatedRoute.snapshot.queryParams.type, 10) || parseInt(selectedCustomerTypeID, 10) || 1));
    });

    this.userServiceModal.customerTypeID = typeOfId?.ID;

    this.activatedRoute.queryParams.subscribe((type:any)=>{
      this.userServiceModal.customerTypeID = parseInt(type.type) || 1
      })
  }

  sildeMobileNav($event: any) {
    this.sideBarMenu.toggle();
  }

  public updatecountry(country, languagecode) {
    this.cart1Service.updateCountry(country, languagecode, true, false);
  }

  navigateToChangeAffiliate() {
    this.dialog.open(FindEnrollerComponent, {
      disableClose: true,
      panelClass: 'findenroller-dialog',
      autoFocus: false
    });
  }

  changeCustomerType(ID) {
    if (ID === this.userServiceModal.customerTypeID) {
      return;
    }

    const dialogData = new ConfirmDialogModel(
      this.translate.instant('update_customer_title'),
      this.translate.instant('update_customer_text'),
      this.translate.instant('NO'),
      this.translate.instant('YES')

    );

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      data: dialogData,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.userServiceModal.customerTypeID = ID;
        sessionStorage.setItem('selectedCustomerTypeID', ID);
        this.router.navigate(
          [],
          {
            relativeTo: this.activatedRoute,
            queryParams: { type: ID },
            queryParamsHandling: 'merge'
          })
          .then(() => { window.location.reload(); });
        this.cart1Service.clearCart();
      }
    });

  }

  close(item) {
    if (!(item.children && item.children.length)) {
      this.sideBarMenu.close();
    }
  }
  closed(val) {
    if (val != '1') {
      this.sideBarMenu.close();
    }
  }

  customerTypeDescription() {
    if (!this.configService.commonSettings.CustomerTypes) { return ''; }
    if (!this.userServiceModal.customerTypeID) { return ''; }
    return _.find(this.configService.commonSettings.CustomerTypes, (customerType) => {
      return (this.userServiceModal.customerTypeID == customerType.ID);
    }).Description;
  }

  isLoggedIn() {
    if ((Object.keys(this.userServiceModal.customerData).length) && (this.userServiceModal.customerData.CustomerId) && this.userService.checkIfUserAuthenticatedOrNot()) {
      return true;
    } else {
      return false;
    }
  }
  setNavItemCategories() {
    for (const element of this.categoriesList) {
      if (this.configService.localSettings.Global.CategoriesToFetch?.length > 0) {
        if (this.configService.localSettings.Global.CategoriesToFetch.indexOf(element.Category) > -1) {
          this.navItems[1].children.push({
            displayName: element.Category,
            iconName: 'contacts',
            route: `/products/${element.CategoryId}`
          });
        }
      }
      else {
        this.navItems[1].children.push({
          displayName: element.Category,
          iconName: 'contacts',
          route: `/products/${element.CategoryId}`
        });
      }
    }
  }
}
