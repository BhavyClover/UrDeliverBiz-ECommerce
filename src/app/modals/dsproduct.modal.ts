

export interface Custom {
    ItemId: number;
    Field1: string;
    Field2: string;
    Field3: string;
    Field4: string;
    Field5: string;
}

export interface StockLevel {
    WarehouseId: number;
    ItemId: number;
    Avaliable: number;
    Committed: number;
    OnHand: number;
    OnOrder: number;
    OutOfStock: boolean;
    TrackStock: number;
}

export interface Item {
    ItemId: number;
    Name: string;
    Quantity: number;
}

export interface KitGroup {
    Name: string;
    Items: Array<Item>;
}

export interface Image {
    Description: string;
    Path: string;
}

export interface Price {
    PriceGroupId: number;
    Price: number;
    PriceCurrency: string;
    OriginalPrice: number;
    Bonus: number;
    CV: number;
    QV: number;
    RewardPoints: number;
}

export interface OptionValue {
    Option: string;
    SkuExt: string;
}

export interface ItemOption {
    OptionId: number;
    Option: string;
    OptionType: number;
    Values: Array<OptionValue>;
}

export interface Language {
    Description: string;
    LanguageCode: string;
    ProductName: string;
    SeoKeywords: string;
    Specifications: string;
}

export interface OptionsMap {
    Key: string;
    Checked: boolean;
    ItemId: number;
    Image: string;
    ExtSku: string;
    StockLevels: Array<any>;
}

export interface BillOfMaterial {
    ItemId: number;
    Name: string;
    Quantity: number;
}

export class DSProduct {
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
    Specifications: string;
    SEO?: any;
    LanguageCode: string;
    SKU: string;
    Category: string;
    CategoryId: number;
    ChargeShipping: boolean;
    Custom: Custom;
    Height: number;
    ImageUrl: string;
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
    Price: number;
    CurrencyCode: string;
    OriginalPrice: number;
    OutOfStockStatus: number;
    Bonus: number;
    CV: number;
    QV: number;
    RewardPoints: number;
    StoreId: number;
    HasOptions: boolean;
    PriceGroups: Array<number>;
    StockLevels: Array<StockLevel>;
    KitGroups: Array<KitGroup>;
    Images: Array<Image>;
    Prices: Array<Price>;
    ItemOptions: Array<ItemOption> = [];
    Languages: Array<Language>;
    OptionsMap: Array<OptionsMap>;
    BillOfMaterials: Array<BillOfMaterial>;
}

