export interface PersonalInfo {
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    phoneNumber: string;
    email: string;
}
export interface FreeShipping {
    activated: boolean;
    coupon: string;
}
export interface CouponInfo {
    IsAppliedcode: boolean;
    promoCodeValid: boolean;
    promoCode: string;
    Allcoupons: Array<any>;
    RewardsForUse: Array<any>;
    FreeShipping: FreeShipping;
    availableRewards: Array<any>;
    OrderAllowCoupons: [];
}
export interface CardDetail {
    CardExpirationYear: number;
    CardExpirationMonth: number;
    CardNumber: string;
}
export interface DynamicCouponCode {
    promoCode: string;
}
export interface ShippingAddress {
    AddressId: 0;
    City: string;
    CountryCode: string;
    PostalCode: string;
    Region: string;
    Street1: string;
    Street2: string;
    FirstName: string;
    LastName: string;
    Phone: string;
}

export class EnrollmentModal111 {
    billingAddressSame: boolean = false;
    selectedLanguageCode: string;
    selectedCountry: string;
    WebAlias: string;
    customerTypeID: number;
    enrollerInfo: any;
    guestUserLogin: boolean;
    guestUserData: any;
    shippingAddress: ShippingAddress;
    mailingAddress: any;
    newshippingAddress: any;
    personalInfo: PersonalInfo;
    couponInfo: CouponInfo;
    DynamicCouponCode: DynamicCouponCode;
    paymentMethods: Array<any>;
    referralURL: string;
    restrictedStates: Array<any>;
    restrictedShipStates: string;
    selectedShippingMethod: number;
    shippingMethods: Array<any>;
    autoshipCardDetail: any;
    cardDetail: CardDetail;
    commissionPayment: any;
    licenseNumber: string;
    legName: string;
    enrollerId: number;
    sponsorId: number;
    doNotWishAutoship: boolean;
    checkItems: boolean;
    autologin: boolean;
    regionMainState: string;
    newUser: boolean;
    TotalSteps: number;
    noOfStepsVerified: number;
    defaultState: string;
    isAddressChanged: boolean = false;
}
