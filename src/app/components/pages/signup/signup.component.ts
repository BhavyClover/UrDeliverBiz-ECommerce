import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/notification.service';
import { ProductService } from '../../shared/services/product.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UserService } from '../../shared/services/user.service';
import { getSubdomain } from 'tldts';
import { ConfigService } from '../../shared/services/config.service';
import { ValidateKeywordService } from '../../shared/services/validatekeyword.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { Title } from '@angular/platform-browser';
import { UtilityService } from '../../shared/services/utility.service';
declare const Object: {
  keys<T extends {}>(object: T): (keyof T)[]
};

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  public userInfo: any = {
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    confirmpassword: ''
  };
  userService: UserServiceModal;
  public loadingDetails: boolean = false;
  public UserNameCheck: boolean = false;
  public EmailCheck: boolean = true;
  constructor(
    public user: UserService,
    private router: Router,
    public notificationService: NotificationService,
    public apiService: RestApiService,
    public translate: TranslateService,
    public itemsService: ProductService,
    public configService: ConfigService,
    public validateKeywordService: ValidateKeywordService,
    public titleService: Title,
    public utilityService: UtilityService
  ) {
    this.userService = user.userServiceModal;
  }

  ngOnInit(): void {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_signup') + ' | ' + text);
    });
    if (Object.keys(this.userService.customerData).length || this.userService.guestUserData.Email) {
      this.notificationService.error('message_', 'you_are_already_logged_in');
      this.router.navigate(['products/all'], { skipLocationChange: false });
    }
  }


  createCustomer() {
    if (!(this.UserNameCheck && this.EmailCheck)) { return; }
    this.loadingDetails = true;
    this.userService.customerTypeID = 2;
    const request = {
      CustomerType: 2,
      EmailAddress: this.userInfo.email,
      FirstName: this.userInfo.firstName,
      LastName: this.userInfo.lastName,
      Password: this.userInfo.password,
      PrimaryAddress: {
        Street1: 'No Address',
        Region: this.userService.regionMainState || 'UT',
        CountryCode: this.configService.commonData.selectedCountry || 'us'
      },
      SponsorId: this.userService.enrollerInfo.CustomerId || 2,
      Username: this.userInfo.username,
    };
    this.apiService.createCustomer(request).subscribe((result) => {
      this.loadingDetails = false;
      try {
        if (Number(result.Data) > 0) {
          this.loginFunction(this.userInfo.username, this.userInfo.password);
          this.userService.newUser = true;
          this.userInfo = {};
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
        this.loadingDetails = false;
      },
      () => {

      });
  }

  verifyUsername(username: string) {
    this.UserNameCheck = false;
    if (this.userInfo.username) {
      const isValidPost = this.validateKeywordService.CheckValidation(this.configService.localSettings.Global.blockword, username);
      if (isValidPost && !(isValidPost.isvalid)) {
        this.notificationService.error('error_', this.translate.instant('username_not_available_'));
        this.UserNameCheck = false;
        this.userInfo.username = '';
      } else {

        this.loadingDetails = true;

        this.apiService.validateUsername(this.userInfo.username).subscribe((result) => {
          this.loadingDetails = false;
          try {
            if (!result.Data) {
              this.UserNameCheck = true;
              this.notificationService.success('success', this.translate.instant('username_available_'));
            } else {
              this.notificationService.error('error_', this.translate.instant('username_not_available_'));
              this.userInfo.username = '';
            }
          } catch (ex) {
            this.notificationService.error('error_', this.translate.instant('error_occured_try_again'));
          }
        },
          err => {
            // Do stuff whith your error
            this.loadingDetails = false;
          },
          () => {

          });
      }
    }
  }

  loginFunction(userName, pass) {
    this.loadingDetails = true;
    const loginrequest = {
      granttype: 'password',
      scope: 'office',
      username: userName,
      password: pass
    };
    this.apiService.Login(loginrequest).subscribe(
      (result) => {
        if (result) {
          try {
            localStorage.setItem('isLoggedIn', 'true');
            this.apiService.getCustomer().subscribe((data) => {
              this.loadingDetails = false;
              if (data && data.Data) {
                this.userService.customerData = data.Data;
                this.userService.customerTypeID = this.userService.customerData.CustomerType;
                if (!this.utilityService.isEmptyObject(this.userService.customerData.DefaultShippingAddress)) {
                  this.user.setShippingAddress();
                } else {
                  this.userService.shippingAddress = new UserServiceModal().newshippingAddress;
                }
                if (this.userService.customerData.Webalias) {
                  this.apiService.validateWebAlias(this.userService.customerData.Webalias).subscribe((res: any) => {
                    if (res.Data) {
                      this.userService.WebAlias = this.userService.customerData.Webalias;
                      this.loginredirect();
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
                          this.loginredirect();
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
            }, err => {
              this.notificationService.error('error_', 'error_occured_try_again');
              this.loadingDetails = false;
            },
              () => {

              });
          } catch (successEx) {
            this.notificationService.error('error_', 'error_occured_try_again');
            this.loadingDetails = false;
            console.error('ex', successEx);
          }
        } else {
          this.loadingDetails = false;
          this.notificationService.error('error_', 'error_occured_try_again');
        }
      }, err => {
        this.loadingDetails = false;
        this.notificationService.error('error_', 'error_occured_try_again');
      },
      () => {

      });
  }

  loginredirect() {
    let newUrl: any;
    const subdomain = getSubdomain(window.location.host);
    if (subdomain) {
      newUrl = window.location.href.replace(subdomain, this.userService.WebAlias);
    }

    if (this.itemsService.selectedPacks.length || this.itemsService.selectedOrderItems.length) {
      this.userService.checkItems = true;

      window.location.assign(newUrl.replace('signup', 'checkout'));
    } else if (this.itemsService.selectedAutoOrderItems.length) {
      this.userService.checkItems = true;

      window.location.assign(newUrl.replace('signup', 'products/all'));
    } else {
      window.location.assign(newUrl.replace('signup', 'products/all'));
    }
  }

  // For check android Mobile only
  validEmailData(value) {
    this.userInfo.email = value.replace(/\s/g, '');
    this.verifyUserNameAndEmail();
  }

  verifyUserNameAndEmail() {
    const filter = new RegExp('^([\\w-\\.+]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([\\w-]+\\.)+))([a-zA-Z]{2,10}|[0-9]{1,3})(\\]?)$');
    if (this.userInfo.email && filter.test(this.userInfo.email)) {
      this.apiService.validateEmailAddress({ EmailAddress: this.userInfo.email }).subscribe((result) => {
        if (!result.Data) {
          this.EmailCheck = true;
          this.notificationService.success('success', 'email_available_');
        } else {
          this.notificationService.error('error_', 'error_email_exists');
          this.userInfo.email = '';
        }
      });
    }
  }

  back() {
    this.router.navigateByUrl('/login', { skipLocationChange: true });
  }

}
