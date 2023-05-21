export class Item {
    ItemID: number;
    Quantity: number;
    IsKit: boolean;
    CurrencyCode: string;
}

export class OrderRewardPoints {
    Amount: number;
}

export class OrderCreditCard {
    CardToken: string;
    NameOnCard: string;
    Last4: string;
    CardType: string;
    ExpirationMonth: number;
    ExpirationYear: number;
}

export class Payment {
    Amount?: number;
    SavePaymentMethodId: string;
    OnFileCard?: string;
    CurrencyCode: string;
    MerchantId: number;
    SavePayment: boolean;
    AuthorizationNumber: number;
    OrderRewardPoints?: OrderRewardPoints;
    OrderCreditCard?: OrderCreditCard;
}

export class Order {
    ShipMethodID: number;
    StoreID: number;
    CurrencyCode: string;
    Items: Array<Item>;
    CouponCodes: Array<string>;
    Payments: Array<Payment>;
    RequireSuccess: boolean;
}

export class Item2 {
    ItemID: number;
    Quantity: number;
    IsKit: boolean;
    CurrencyCode: string;
}

export class AutoShip {
    StartDate: string;
    Frequency: string;
    ShipMethodID: number;
    Items: Item2[];
}

export class ApplicantAddress {
    Street1: string;
    Street2: string;
    Street3: string;
    City: string;
    Region: string;
    PostalCode: string;
    CountryCode: string;
}

export interface AssociateCustom {
    Field1: string;
    Field2: string;
    Field3: string;
    Field4: string;
    Field5: string;
    Field6: string;
    Field7: string;
    Field8: string;
    Field9: string;
    Field10: string;
}
export interface PlacementOverrides {
    TreeName: string;
    CustomerId: number;
    TreeIndex: number;
    BaseLegName: string;
}

export class Enrollment {
    billingAddressSame: boolean = true;
    Order?: Order;
    AutoShip?: AutoShip;
    AssociateID: number;
    AcceptTerms: boolean;
    FirstName: string;
    LastName: string;
    RomanizedFirstName?: string;
    RomanizedLastName?: string;
    LegalFirstName?: string;
    LegalLastName?: string;
    TaxID?: string;
    BirthDate: string;
    PrimaryPhone: string;
    SecondaryPhone?: string;
    TextNumber?: string;
    Email: string;
    Username: string;
    Password: string;
    ConfirmPassword?: string;
    LanguageCode: string;
    ApplicantAddress: ApplicantAddress;
    ShippingAddress: ApplicantAddress;
    AssociateTypeID: number;
    AssociateBaseType: number;
    SponsorID: number;
    WebPageURL?: string;
    WebPageItemID?: number;
    SendEmails: boolean;
    AssociateCustom?: AssociateCustom;
    PlacementOverrides?: PlacementOverrides;
    BirthDay?: number;
    BirthMonth?: number;
    BirthYear?: number;
}
