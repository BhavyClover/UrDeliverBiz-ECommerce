import { ResponseBase } from './responsebase.modal';

export interface ShipAddress {
    AddressId: number;
    Street1: string;
    Street2: string;
    Street3: string;
    PostalCode: string;
    City: string;
    Region: string;
    CountryCode: string;
}

export interface CategoryTranslation {
    Id: number;
    CategoryId: number;
    Description?: any;
    Name: string;
    LanguageCode: string;
}

export interface Category {
    ID: number;
    CategoryTranslations: CategoryTranslation[];
    Name: string;
    Description: string;
    DisplayIndex: number;
    ImageUrl: string;
    ParentID: number;
    ProductLineID: number;
    ShortDescription: string;
    StoreIDs: number[];
    HasChildren: boolean;
}

export interface Image {
    Description: string;
    Path: string;
}

export interface Price {
    GroupID: number;
    Price: number;
    PriceCurrency: string;
    OriginalPrice: number;
    Bonus: number;
    CV: number;
    QV: number;
    RewardPoints: number;
}

export interface Language {
    Description: string;
    LanguageCode: string;
    ProductName: string;
    SeoKeywords: string;
    Specifications: string;
}

export interface LineItem {
    ItemID: number;
    Quantity: number;
    Cost: number;
    ExtendedPrice: number;
    ExtendedOriginalPrice: number;
    ExtendedBonus: number;
    ExtendedCV: number;
    ExtendedQV: number;
    ExtendedRewardPoints: number;
    ExtendedCost: number;
    ProductName: string;
    Description: string;
    Specifications?: any;
    SEO?: any;
    LanguageCode: string;
    SKU: string;
    SkuID: number;
    Category: Category;
    ChargeShipping: boolean;
    Custom?: any;
    Height: number;
    Image: string;
    Length: number;
    LengthUOM: string;
    MPN: string;
    PackCount: number;
    PackageGroupID: number;
    TaxClassID: number;
    UnitOfMeasure: string;
    UPC: string;
    Weight: number;
    WeightUOM: string;
    Width: number;
    FlagBirthDefects: boolean;
    HasKitGroups: boolean;
    FlagCancer: boolean;
    PriceGroup: number;
    Images: Image[];
    Prices: Price[];
    Options: any[];
    ItemOptions: any[];
    Languages: Language[];
    OptionsMap: any[];
    HasOptions: boolean;
    Price: number;
    PriceCurrency: string;
    OriginalPrice: number;
    Bonus: number;
    CV: number;
    QV: number;
    RewardPoints: number;
    CouponsBeingUsed: number;
    StoreId: number;
    PriceGroups: number[];
}

export interface GetAutoship {
    TotalQuantity: any;
    AutoShipID: number;
    AssociateID: number;
    ShipAddress: ShipAddress;
    StartDate: Date;
    Frequency: number;
    LastProcessDate: Date;
    NextProcessDate: Date;
    LastChargeAmount: number;
    Status: string;
    ShipMethodID: number;
    PaymentMethodID: string;
    PaymentMerchantID: number;
    AutoShipType: number;
    LineItems: LineItem[];
    Custom?: any;
    FrequencyString: string;
    TotalCV: number;
    TotalQV: number;
    CurrencyCode: string;
    SubTotal: number;
}
export class GetAutoshipResult extends ResponseBase {
    Data: GetAutoship[];
}
