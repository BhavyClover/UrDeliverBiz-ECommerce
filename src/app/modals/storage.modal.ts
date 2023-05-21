export interface RetailData {
    isNewAutoship: boolean;
    CurrentSelectedAutoOrder: number;
    isChanged: boolean;
    AddMoreItemInAutoshipFlag: boolean;
    AddMoreItemInAutoshipData: any;
    editAutoshipItems: Array<any>;
    uniqueCategoryId: number;
    IsPaid: boolean;
    SelectedAutoshipPayment: any;
    Autoship: any;
    autoshipDate: string;
    isNewAddress: string;
    isAddresschanged: boolean;
    IsMailingAddressVerified: boolean;
    AutoOrderShippingAddress: any;
    AutoOrdersData: Array<any>;
    isAutoshipEdit: boolean;
    getAutoOrderDetailsByID: any;
}
export interface SelectedAutoshipPayment {
    PaymentTypeID: string;
    Name: string;
    Ending: string;
    PaymentDisplay: string;
    ExpireMonth: string;
    ExpireYear: string;
    BillingAddress: string;
    BillingAddress2: string;
    BillingCity: string;
    BillingCountry: string;
    BillingState: string;
    BillingZip: string;
}

export interface Autoship {
    Frequency: string;
    FrequencyTypeDescription: string;
    FrequencyTypeID: number;
}
