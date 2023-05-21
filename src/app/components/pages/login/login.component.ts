import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../shared/services/product.service';
import * as  _ from 'lodash';
import { UserService } from '../../shared/services/user.service';
import { OrderService } from '../../shared/services/order.service';
import { Cart1Service } from '../../shared/services/cart1.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { AccountService } from '../../shared/services/account.service';
import { Title } from '@angular/platform-browser';
import { getSubdomain } from 'tldts';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { CookieService } from 'ngx-cookie-service';
import { UtilityService } from '../../shared/services/utility.service';
import { AutoshipConfigurationService } from '../../shared/services/autoshipConfiguration.service';
import { ConfigService } from '../../shared/services/config.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public userInfo = {
    username: '',
    password: '',
    guestemail: ''
  };
  userService: UserServiceModal;
  public ViewSection = [];
  public SignupSetting = [];
  public guestUser = {};
  public issignin = true;
  public isguest = true;
  public showLoginSection: boolean = false;
  autoLogin: boolean = false;
  previousType: any;
  constructor(
    private titleService: Title,
    private router: Router,
    private accountService: AccountService,
    public user: UserService,
    private route: ActivatedRoute,
    public orderService: OrderService,
    public cartsService: Cart1Service,
    public notificationService: NotificationService,
    public translate: TranslateService,
    public itemsService: ProductService,
    public apiService: RestApiService,
    private cookieService: CookieService,
    public utilityService: UtilityService,
    public autoshipConfigurationService: AutoshipConfigurationService,
    public configService: ConfigService
  ) {
    this.userService = user.userServiceModal;
    this.cookieService.deleteAll('/');
  }

  ngOnInit() {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_login') + ' | ' + text);
    });
    window.scrollTo(0, 0);
    this.previousType = this.userService.customerTypeID;
    this.load();
  }

  private load() {
    localStorage.setItem('PostLoginEvents', null);

    if (this.userService.customerData && !this.userService.customerData.FirstName) {
    }
  }

  checkitem() {
    return (this.itemsService.selectedOrderItems.length > 0 || this.itemsService.selectedAutoOrderItems.length > 0);
  }

  manageflow(guest, signin) {
    this.isguest = guest;
    if (signin) {
      this.clearStorage();
      const url = 'Home';
      window.open(url, '_self');
    } else {
      this.issignin = signin;
    }
  }

  private clearStorage() {
    this.orderService.calculateOrderResponse = {};
    this.cartsService.clearCart();
    this.user.clearData();
    this.user.setDefault();
    localStorage.removeItem('guestLogin');
  }

  loginFunction(username?: string, password?: string) {
    localStorage.setItem('guestLogin', 'false');
    this.user.clearCustomerData();
    localStorage.removeItem('guestLogin');
    const loginrequest = {
      granttype: 'password',
      scope: 'office',
      username: username || this.userInfo.username,
      password: password || this.userInfo.password
    };
    this.apiService.Login(loginrequest).subscribe(
      (result) => {
        if (result && result.status == 200 && result.body.Status != 1) {
          try {
            localStorage.setItem('isLoggedIn', 'true');
            this.accountService.getCustomerData(result.body.CustomerId).then((data: any) => {
              if (data && data.Data) {
                localStorage.setItem('user', JSON.stringify(data.Data));
                this.userService.customerData = data.Data;
                localStorage.setItem('userService', JSON.stringify(this.userService));
                this.userService.customerTypeID = this.userService.customerData.CustomerType;
                if (this.previousType !== this.userService.customerTypeID) {
                  this.userService.couponInfo.Allcoupons = [];
                  this.autoshipConfigurationService.autoshipDate = '';
                  this.userService.shippingMethods = [];
                  this.userService.selectedShippingMethod = 0;
                  this.autoshipConfigurationService.init();
                }
                if (!this.utilityService.isEmptyObject(this.userService.customerData.DefaultShippingAddress)) {
                  this.user.setShippingAddress();
                } else {
                  this.userService.shippingAddress = new UserServiceModal().newshippingAddress;
                }

                if (this.userService.customerData.WebAlias) {
                  this.apiService.validateWebAlias(this.userService.customerData.WebAlias).subscribe((res: any) => {
                    if (res.Data) {
                      this.userService.WebAlias = this.userService.customerData.WebAlias;
                      this.loginredirect(this.userService.WebAlias);
                    }
                  }, (error) => {
                    if (error.Data && !error.Data.WebAlias) {
                      this.notificationService.error('error_', 'webalias_not_exists');
                      return false;
                    }
                  },
                    () => {

                    });
                }
                else if (this.userService.customerData.SponsorId) {
                  this.apiService.getSearchCustomerDetail(this.userService.customerData.SponsorId).subscribe((resp: any) => {
                    if (resp.Data) {
                      this.apiService.validateWebAlias(resp.Data.WebAlias).subscribe((res: any) => {
                        if (res.Data) {
                          this.userService.WebAlias = resp.Data.WebAlias;
                          location.href = `${location.origin}/${resp.Data.WebAlias}`;
                        }
                      }, (error) => {
                        if (error.Data && !error.Data) {
                          this.notificationService.error('error_', 'webalias_not_exists');
                          return false;
                        }
                      },
                        () => {

                        });
                    }
                  }, (error) => {
                    if (error.Data && !error.Data.WebAlias) {
                      this.notificationService.error('error_', 'webalias_not_exists');
                      return false;
                    }
                  },
                    () => {

                    });
                }
              } else {
                this.notificationService.error('error_', 'error_occured_try_again');
              }
            }).catch((error) => {
              this.notificationService.error('error_', 'error_occured_try_again');
              console.error('ex', error);
            });
          } catch (successEx) {
            this.notificationService.error('error_', 'error_occured_try_again');
            console.error('ex', successEx);
          }
        } else {
          this.notificationService.error('error_', 'Authentication Failed');
        }
      }, err => {
        this.notificationService.error('error_', 'error_occured_try_again');
      },
      () => {

      });
  }



  // *********** new method from neumi ****************
  private loginredirect(alias) {
    let newUrl: any;
    const subdomain = getSubdomain(window.location.host);
    newUrl = `${location.origin}/${alias}`;

    if (this.checkitem()) {
      this.userService.checkItems = true;
      window.location.assign(newUrl.replace('login', 'checkout'));
    } else if (this.itemsService.selectedAutoOrderItems.length) {
      this.userService.checkItems = true;
      window.location.assign(newUrl.replace('login', 'products/all'));
    } else {
      window.location.assign(newUrl.replace('login', 'products/all'));
    }
  }

  navLoginPath(state) {
    // this.checkWebAliasService.checkWebAlias();
    this.router.navigate([state], { queryParams: { WebAlias: this.userService.WebAlias } });
  }


  redirectToForgotPassword() {
    this.router.navigateByUrl('/ForgotPassword', { skipLocationChange: false });

  }
  isMobile(): boolean {
    return false;
  }

  createGuestCustomer(guestemail) {
    this.userService.customerTypeID = 2;
    const randomPassword = '6Zy$Ce6yrzz';
    const request = {
      CustomerType: 2,
      EmailAddress: guestemail,
      FirstName: 'Guest User',
      LastName: 'Guest User',
      PrimaryAddress: {
        Street1: 'No Address',
        Region: this.userService.regionMainState || 'UT',
        CountryCode: this.configService.commonData.selectedCountry || 'us'
      },
      SponsorId: this.userService.enrollerInfo.CustomerId || 2,
      Username: guestemail,
      Password: randomPassword
    };
    this.accountService.createGuestUser(request).subscribe((result) => {
      try {
        if (Number(result.Data) > 0) {
          this.loginFunction(this.userInfo.guestemail, randomPassword);
          this.userService.newUser = true;

          this.notificationService.success('Success', 'customer_created_successfully');
        } else {
          this.notificationService.error('error_', result.ErrorDescription);
        }
      } catch (ex) {
        this.notificationService.error('error_', 'error_occured_try_again');
      }
    },
      err => {
        // Do stuff whith your error
      },
      () => {

      });
  }

  showLogin(value: boolean) {
    this.showLoginSection = value;
  }
}
