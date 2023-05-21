import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { UserServiceModal, PersonalInfo, WebOffice } from 'src/app/modals/userservice.modal';
import { RestApiService } from './restapi.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  // Add 'implements OnInit' to the class.
  isLoggedIn: Observable<boolean>;
  public webalias = JSON.parse(sessionStorage.getItem('CommonSettings'))?.DefaultWebalias;
  public userServiceModal: UserServiceModal;
  public userServiceSubject: BehaviorSubject<UserServiceModal>;
  public userServiceSubscriber: Subscriber<UserServiceModal>;
  constructor(
    public activatedRoute: ActivatedRoute,
    public apiService: RestApiService,
    public utilityService: UtilityService,
    public cookieService: CookieService
  ) {
    this.userServiceModal = new UserServiceModal();
    this.isLoggedIn = this.apiService.isLoggedIn();
    this.isLoggedIn.subscribe((data) => {
    });

  }
  public service: any = {};

  /** * init * @method  init */
  public init(): void {
    if (localStorage.getItem('userService')) {
      this.service = JSON.parse(localStorage.getItem('userService')) as UserServiceModal;
      this.userServiceModal.customerTypeID = parseInt(this.activatedRoute.snapshot.queryParams.type, 10) || this.service.customerTypeID || 2;
      this.userServiceModal.enrollerInfo = this.service.enrollerInfo || {};
      this.userServiceModal.guestUserLogin = this.service.guestUserLogin || false;
      this.userServiceModal.customerData = this.service.customerData || {};
      this.userServiceModal.guestUserData = this.service.guestUserData || {};
      this.userServiceModal.shippingAddress = this.service.shippingAddress || {};
      this.userServiceModal.mailingAddress = this.service.mailingAddress || {};
      this.userServiceModal.newshippingAddress = this.service.newshippingAddress || {};
      this.userServiceModal.personalInfo = this.service.personalInfo || {} as PersonalInfo;
      this.userServiceModal.personalInfo.birthDay = this.service.personalInfo.birthDay || '01';
      this.userServiceModal.personalInfo.birthMonth = this.service.personalInfo.birthMonth || '01';
      this.userServiceModal.personalInfo.birthYear = this.service.personalInfo.birthYear || (moment().year() - 18).toString();
      this.userServiceModal.personalInfo.phoneNumber = this.service.personalInfo.phoneNumber || {};
      this.userServiceModal.webOffice = this.service.webOffice || {};
      this.userServiceModal.couponInfo = this.service.couponInfo || {};
      this.userServiceModal.DynamicCouponCode = this.service.DynamicCouponCode || {};
      this.userServiceModal.couponInfo.IsAppliedcode = this.service.couponInfo.IsAppliedcode || false;
      this.userServiceModal.paymentMethods = this.service.paymentMethods || [];
      this.userServiceModal.referralURL = this.activatedRoute.snapshot.queryParams.ref;
      this.userServiceModal.restrictedStates = this.service.restrictedStates || [];
      this.userServiceModal.restrictedShipStates = this.service.restrictedShipStates || '';
      this.userServiceModal.selectedShippingMethod = this.service.selectedShippingMethod || 0;
      this.userServiceModal.shippingMethods = this.service.shippingMethods || [];
      this.userServiceModal.autoshipCardDetail = this.service.autoshipCardDetail || {};
      this.userServiceModal.cardDetail = this.service.cardDetail || {};
      this.userServiceModal.commissionPayment = this.service.commissionPayment || '';
      this.userServiceModal.licenseNumber = this.service.licenseNumber || '';
      this.userServiceModal.legName = this.activatedRoute.snapshot.queryParams.legName;
      this.userServiceModal.enrollerId = Number(this.activatedRoute.snapshot.queryParams.enrollerId || this.service.enrollerId) || 0;
      this.userServiceModal.sponsorId = Number(this.activatedRoute.snapshot.queryParams.sponsorId || this.service.sponsorId) || 0;
      this.userServiceModal.doNotWishAutoship = this.service.doNotWishAutoship || false;
      this.userServiceModal.checkItems = this.service.checkItems || false;
      this.userServiceModal.autologin = this.service.autologin || this.activatedRoute.snapshot.queryParams.autologin || false;
      this.userServiceModal.regionMainState = this.service.regionMainState || '';
      this.userServiceModal.newUser = this.service.newUser || false;
      this.userServiceModal.TotalSteps = 6;
      this.userServiceModal.noOfStepsVerified = this.service.noOfStepsVerified || 0;
      this.userServiceModal.couponInfo.availableRewards = this.service.couponInfo.availableRewards || [];
      // this.userServiceModal.selectedLanguageCode = this.activatedRoute.snapshot.queryParams.LanguageCode || this.service.selectedLanguageCode || 'en';
      // this.userServiceModal.selectedCountry = this.userServiceModal.selectedCountry || this.activatedRoute.snapshot.queryParams.countrycode || 'US';
      this.userServiceModal.WebAlias = this.userServiceModal.WebAlias || this.webalias;
    } else {
      this.setDefault();
    }
  }

  /*** clear Data of application * @method  clearData ***/
  public clearData() {
    localStorage.removeItem('userService');
    this.service = {};
    this.init();
  }

  public clearCustomerData() {
    this.userServiceModal.customerData = {};
  }

  public setEnrollerInfo(websiteinfo) {
    this.userServiceModal.enrollerInfo = websiteinfo;
    localStorage.setItem('userService', JSON.stringify(this.userServiceModal));
  }
  /** * Set Default * @method  setDefault */
  public setDefault() {
    this.userServiceModal.customerTypeID = parseInt(this.activatedRoute.snapshot.queryParams.type, 10) || this.service.customerTypeID || 2;
    this.userServiceModal.enrollerInfo = {};
    this.userServiceModal.guestUserLogin = false;
    this.userServiceModal.shippingAddress = {AddressId: 0,
      City: '',
      CountryCode: '',
      PostalCode: '',
      Region: '',
      Street1: '',
      Street2: '',
      Street3: '',
      FirstName: '',
      LastName: '',
      Phone: '',
      StateName: '',
      FullName: ''};
    this.userServiceModal.mailingAddress = {};
    this.userServiceModal.newshippingAddress = {};
    this.userServiceModal.personalInfo = {
      birthDay: 1,
      birthMonth: 1,
      birthYear: Number((moment().year() - 18).toString()),
      phoneNumber: '',
      Email: ''
    };
    this.userServiceModal.webOffice = {} as WebOffice;
    this.userServiceModal.paymentMethods = [];
    this.userServiceModal.referralURL = this.activatedRoute.snapshot.queryParams.ref;
    this.userServiceModal.autoshipCardDetail = {};
    this.userServiceModal.cardDetail = {
      CardExpirationYear: new Date().getFullYear(),
      CardExpirationMonth: (new Date().getMonth() + 1),
      CardNumber: ''
    };
    this.userServiceModal.commissionPayment = '';
    this.userServiceModal.licenseNumber = '';
    this.userServiceModal.legName = this.activatedRoute.snapshot.queryParams.legName;
    this.userServiceModal.enrollerId = Number(this.activatedRoute.snapshot.queryParams.enrollerId) || 0;
    this.userServiceModal.sponsorId = Number(this.activatedRoute.snapshot.queryParams.sponsorId) || 0;
    this.userServiceModal.doNotWishAutoship = false;
    this.userServiceModal.defaultState = '';
    this.userServiceModal.couponInfo = {
      IsAppliedcode: false,
      promoCodeValid: undefined,
      promoCode: '',
      Allcoupons: [],
      RewardsForUse: [],
      FreeShipping: {
        activated: false,
        coupon: undefined
      },
      availableRewards: [],
      OrderAllowCoupons: []
    };
    // this.userServiceModal.autoshipDate = moment().add(1, 'months').toDate();
    this.userServiceModal.customerData = {};
    this.userServiceModal.guestUserData = {};
    this.userServiceModal.restrictedShipStates = '';
    this.userServiceModal.restrictedStates = [];
    this.userServiceModal.selectedShippingMethod = 0;
    this.userServiceModal.shippingMethods = [];
    this.userServiceModal.checkItems = false;
    this.userServiceModal.autologin = this.activatedRoute.snapshot.queryParams.autologin || false;
    this.userServiceModal.regionMainState = '';
    this.userServiceModal.newUser = false;
    this.userServiceModal.TotalSteps = 6;
    this.userServiceModal.noOfStepsVerified = 0;
    this.userServiceModal.WebAlias = this.webalias;
    localStorage.setItem('userService', JSON.stringify(this.userServiceModal));
  }

  /**
   * set user shipping address
   * @method  setShippingAddress
   */
  public setShippingAddress() {
    this.userServiceModal.shippingAddress = this.userServiceModal.shippingAddress || cloneDeep(this.userServiceModal.customerData.DefaultShippingAddress);
    this.userServiceModal.shippingAddress.FullName = (this.userServiceModal.shippingAddress.FirstName || this.userServiceModal.customerData.FirstName) + (this.userServiceModal.shippingAddress.LastName || this.userServiceModal.customerData.LastName);
    this.userServiceModal.shippingAddress.FirstName = this.userServiceModal.shippingAddress.FirstName || this.userServiceModal.customerData.FirstName;
    this.userServiceModal.shippingAddress.LastName = this.userServiceModal.shippingAddress.LastName || this.userServiceModal.customerData.LastName;
    this.userServiceModal.shippingAddress.Street1 = this.userServiceModal.shippingAddress.Street1 || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.Street1 : '');
    this.userServiceModal.shippingAddress.Street2 = this.userServiceModal.shippingAddress.Street2 || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.Street2 : '');
    this.userServiceModal.shippingAddress.Street3 = this.userServiceModal.shippingAddress.Street3 || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.Street3 : '');
    this.userServiceModal.shippingAddress.Region = this.userServiceModal.shippingAddress.Region || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.Region : '');
    this.userServiceModal.shippingAddress.PostalCode = this.userServiceModal.shippingAddress.PostalCode || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.PostalCode : '');
    this.userServiceModal.shippingAddress.CountryCode = this.userServiceModal.shippingAddress.CountryCode || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.CountryCode : '');
    this.userServiceModal.shippingAddress.City = this.userServiceModal.shippingAddress.City || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.City : '');
    this.userServiceModal.shippingAddress.Phone = this.userServiceModal.shippingAddress.Phone || (!this.utilityService.isEmptyObject(this.userServiceModal.customerData.DefaultShippingAddress) ? this.userServiceModal.customerData.DefaultShippingAddress.Phone : '');
  }

  // Check if User is Authenticated Or not
  public checkIfUserAuthenticatedOrNot(): boolean {
    return this.cookieService.check('X-Auth');
  }
}
