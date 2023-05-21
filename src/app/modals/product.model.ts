import { ResponseBase } from './responsebase.modal';

// Product Tag
export type ProductTags = 'nike' | 'puma' | 'lifestyle' | 'caprese';

// Product Colors
export type ProductColor = 'white' | 'black' | 'red' | 'green' | 'purple' | 'yellow' | 'blue' | 'gray' | 'orange' | 'pink';



export class Product {
  id?: number;
  Id?: number;
  name?: string;
  price?: number;
  type?: string;
  salePrice?: number;
  discount?: number;
  pictures?: string;
  state?: string;
  shortDetails?: string;
  description?: string;
  stock?: number;
  newPro?: boolean;
  brand?: string;
  sale?: boolean;
  category?: string;
  tags?: ProductTags[];
  colors?: ProductColor[];
  Discounts?: any[];
  Languages?: any[];
  Category?: any = {};
  Image?: any;

  constructor(
    id?: number,
    Id?: number,
    name?: string,
    price?: number,
    salePrice?: number,
    discount?: number,
    pictures?: string,
    type?: string,
    shortDetails?: string,
    description?: string,
    stock?: number,
    state?: string,
    newPro?: boolean,
    brand?: string,
    sale?: boolean,
    category?: string,
    tags?: ProductTags[],
    colors?: ProductColor[],
    Discounts?: any[],
    Languages?: any[],
    Category?: any[],
    Image?: any,
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.type = type;
    this.salePrice = salePrice;
    this.discount = discount;
    this.pictures = pictures;
    this.shortDetails = shortDetails;
    this.description = description;
    this.stock = stock;
    this.newPro = newPro;
    this.brand = brand;
    this.sale = sale;
    this.category = category;
    this.tags = tags;
    this.colors = colors;
    this.state = state;
    this.Discounts = Discounts;
    this.Languages = Languages;
    this.Category = Category;
    this.Image = Image;
  }

}
// Color Filter
export interface ColorFilter {
  color?: ProductColor;
}










export interface Category {
  Id: number;
  Name: string;
  Description: string;
  DisplayIndex: number;
  ImageUrl?: any;
  ParentId: number;
  ProductLineId: number;
  ShortDescription: string;
  StoreIds: number[];
  HasChildren: boolean;
}

export interface Custom {
  ItemId: number;
  Field1: string;
  Field2: string;
  Field3: string;
  Field4: string;
  Field5: string;
}

export interface FastStart {
  Gen1: number;
  Gen2: number;
  Gen3: number;
  Gen4: number;
  Gen5: number;
  Gen6: number;
  Gen7: number;
  Gen8: number;
  Gen9: number;
  Gen10: number;
}

export interface Image {
  Description: string;
  Path: string;
}

export interface Language {
  Description: string;
  LanguageCode: string;
  ProductName: string;
  SeoKeywords: string;
  Specifications: string;
}

export interface Discount {
  Id: number;
  Bonus?: number;
  End: Date;
  Price: number;
  PriceCurrency: string;
  Cv: number;
  Qv?: number;
  RewardPointsEarned: number;
  Start: Date;
  Type: number;
  Stores: number[];
  OrderType: number[];
  PriceGroups: number[];
  Regions: number[];
}

export class Product1233 {
  Id: number;
  Sku: string;
  KitLevel: number;
  Category: Category;
  ChargeShipping: boolean;
  Disabled: boolean;
  Height: number;
  Image: string;
  Length: number;
  LengthUnitOfMeasure: string;
  ManufacturerPartNum: string;
  OutOfStockStatus: number;
  PackCount: number;
  PackageGroupId: number;
  PreferedVendorId: number;
  SortOrder: number;
  TaxClassId: number;
  ProductClass: number;
  TrackStock: boolean;
  UnitOfMeasure: string;
  Upc: string;
  Weight: number;
  WeightUnitOfMeasure: string;
  Width: number;
  FlagCancer: boolean;
  FlagBirthDefects: boolean;
  HasKitGroups: boolean;
  HsCode: string;
  Custom: Custom;
  FastStart: FastStart;
  Images: Image[];
  Languages: Language[];
  Options: any[];
  OptionsMap: any[];
  Discounts: Discount[];
}
export class GetItemsResponse extends ResponseBase {
  Data: Product;
}




