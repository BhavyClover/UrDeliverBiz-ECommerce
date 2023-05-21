import { cloneDeep } from 'lodash';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { environment } from '../../../../environments/environment';
import { RestApiService } from './restapi.service';
import { User } from 'src/app/modals/user.modal';
import { UserServiceModal, ShippingAddress } from 'src/app/modals/userservice.modal';
import { ConfigService } from './config.service';
import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { CookieService } from 'ngx-cookie-service';
import { UtilityService } from './utility.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  userServiceModal: UserServiceModal;

  constructor(
    private router: Router,
    private http: HttpClient,
    public apiService: RestApiService,
    public configService: ConfigService,
    public userService: UserService,
    public notificationService: NotificationService,
    private cookieService: CookieService,
    private utilityService: UtilityService

  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
    this.userServiceModal = this.userService.userServiceModal;
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  login(loginrequest) {
    return this.apiService.Login(loginrequest)
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user.body));
        this.userSubject.next(user.body);
        return user;
      }));
  }
  createGuestUser(createGuestRequest) {
    return this.apiService.createCustomer(createGuestRequest)
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
        return user;
      }));
  }

  logout() {
    this.cookieService.delete('X-Auth', '/');
    this.cookieService.deleteAll('/');
    // remove user from local storage and set current user to null
    this.apiService.Logout().subscribe(() => {
      this.router.navigate(['/login']).then(() => {
        localStorage.removeItem('user');
        localStorage.clear();
        sessionStorage.clear();
        this.userService.setDefault();
        this.userSubject.next(null);
        window.location.reload();
      });
    });
  }

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/users/register`, user);
  }

  getCustomerData(customerID?: any) {
    const promise = new Promise((resolve, reject) => {
      this.apiService.getCustomer(customerID).subscribe((result) => {
        if (result && result.Data) {
          this.userServiceModal.customerData = result.Data;
          if (!this.configService.commonData.selectedLanguage ||
            (this.configService.commonData.selectedLanguage && this.configService.commonData.selectedCountry.toLowerCase() !== result.Data.DefaultShippingAddress?.CountryCode)) {
            _.each(this.configService.countryLanguageCode, (item) => {
              if (item.CountryCode == result.Data.DefaultShippingAddress?.CountryCode &&
                item.CountryLanguages.filter((val) => {
                  return (val.LanguageCode == result.Data.LanguageCode);
                }
                )) {
                this.configService.commonData.selectedLanguage = item.LanguageCode || result.Data.LanguageCode;
              }
            });
          }
          // for autologin
          if (this.userServiceModal.customerData.LanguageCode) {
            this.configService.commonData.selectedLanguage = this.userServiceModal.customerData.LanguageCode;
          }
          this.configService.setSelectedCountry(this.userServiceModal.customerData.DefaultShippingAddress?.CountryCode || this.userServiceModal.customerData.PrimaryAddress?.CountryCode, this.configService.commonData.selectedLanguage);
          this.userServiceModal.shippingAddress = !this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ?
            cloneDeep(this.userServiceModal.customerData.DefaultShippingAddress) : {};

          if (this.userServiceModal.customerData.DefaultShippingAddress.Street1 == 'No Address on file') {
            // check if loginned user have address saved
            this.userServiceModal.customerData.DefaultShippingAddress = [];
            this.userServiceModal.shippingAddress = {} as ShippingAddress;
          }

          try {
            resolve(result);
          } catch (ex) {
            reject();
            console.error('ex', ex);
          }
        } else {
          reject();
          this.notificationService.error('error_', result.ErrorDescription);
        }
      });
    });
    return promise;
  }
  isLoggedIn(): boolean {
    let isLoggedIn = false;
    this.apiService.loginStatus.subscribe(val => {
      alert();
      isLoggedIn = val;
    });
    return isLoggedIn;
  }
}
