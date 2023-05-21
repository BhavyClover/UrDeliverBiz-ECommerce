import { ResponseBase } from './responsebase.modal';

export interface BillAddress {
    ID: number;
    Line1: string;
    Line2: string;
    Line3: string;
    City: string;
    State: string;
    Zip: string;
    CountryCode: string;
}

export interface LineItem {
    Amount: number;
    Bonus: number;
    Cost: number;
    CurrencyCode: string;
    Height: number;
    Length: number;
    OrderNumber: number;
    PackageNumber: number;
    CV: number;
    QV: number;
    Qty: number;
    SKU: string;
    ItemID: number;
    ProductName: string;
    Weight: number;
    Width: number;
    FlagCancer: boolean;
    FlagBirthDefect: boolean;
    ItemId: number;
    Sku?: any;
    Name?: any;
    Price: number;
    CategoryId: number;
    Cv: number;
    Qv: number;
    FlagBirthDefects: boolean;
    HasKitGroups: boolean;
    Image?: any;
    Quantity: number;
}

export interface Total {
    TaxableSubTotal: number;
    CurrencyCode: string;
    ExchangeRate: number;
    OrderNumber: number;
    Shipping: number;
    SubTotal: number;
    Tax: number;
    TaxTransactionID?: any;
    DiscountTotal: number;
    OverridenShippingTax: boolean;
    Total1: number;
    PaidAmount: number;
    TotalDue: number;
}

export interface Payment {
    Amount: number;
    SavePaymentMethodId?: any;
    OnFileCard?: any;
    CurrencyCode: string;
    MerchantId: number;
    SavePayment: boolean;
    OrderRewardPoints?: any;
    OrderCreditCard?: any;
    AuthorizationNumber?: any;
    TransactionNumber?: any;
    ExchangeRate: number;
    Merchant: number;
    OrderNumber: number;
    PayDate: Date;
    PaymentResponse: string;
    PayType: string;
    Reference?: any;
    Status: string;
}

export interface OrderCustom {
    AutoShipId: number;
    Field1?: any;
    Field2?: any;
    Field3?: any;
    Field4?: any;
    Field5?: any;
}

export class OrderHistory {
    BillPhone: string;
    CommissionDate: Date;
    DistributorID: number;
    Email: string;
    InvoiceDate: Date;
    LocalInvoiceNumber: number;
    Name: string;
    OrderDate: Date;
    OrderType: number;
    OrderTypeDescription: string;
    OrderNumber: number;
    SpecialInstructions: string;
    Status: string;
    TotalBonus: number;
    TotalCost: number;
    TotalCV: number;
    TotalQV: number;
    Void: boolean;
    BillAddress: BillAddress;
    IsPaid: boolean;
    IsShipped: boolean;
    LineItems: Array<LineItem>;
    Packages: Array<any>;
    Totals: Array<Total>;
    Payments: Array<Payment>;
    OrderCustom: OrderCustom;
}

export class OrderHistoryResult extends ResponseBase {
    Data: Array<OrderHistory>;
}
