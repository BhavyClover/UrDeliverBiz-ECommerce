import { ResponseBase } from './responsebase.modal';


export interface CustomerType {
    ID: number;
    Description: string;
}

export interface CustomerStatus {
    ID: number;
    Description: string;
}

export interface AutoOrderStatus {
    ID: number;
    Description: string;
}

export interface AutoOrderPaymentType {
    ID: number;
    Description: string;
}

export interface AutoOrderProcessType {
    ID: number;
    Description: string;
}

export interface BinaryPlacementType {
    ID: number;
    Description: string;
}

export interface CreditCardType {
    ID: number;
    Description: string;
}

export interface FrequencyType {
    ID: number;
    Description: string;
}

export interface ItemType {
    ID: number;
    Description: string;
}

export interface OrderType {
    ID: number;
    Description: string;
}

export interface PeriodType {
    ID: number;
    Description: string;
}

export interface Rank {
    ID: number;
    Description: string;
}

export interface Country {
    CountryCodeISO3: string;
    CountryCodeISO2: string;
    CountryName: string;
}

export interface CountryLanguageCode {
    Country: string;
    CountryCode: string;
    DisplayName: string;
    ISOCode: string;
    LanguageCode: string;
}

export interface CommonSetting {
    CustomerTypes: Array<CustomerType>;
    CustomerStatuses: Array<CustomerStatus>;
    AutoOrderStatuses: Array<AutoOrderStatus>;
    AutoOrderPaymentTypes: Array<AutoOrderPaymentType>;
    AutoOrderProcessTypes: Array<AutoOrderProcessType>;
    BinaryPlacementTypes: Array<BinaryPlacementType>;
    CreditCardTypes: Array<CreditCardType>;
    FrequencyTypes: Array<FrequencyType>;
    ItemTypes: Array<ItemType>;
    OrderTypes: Array<OrderType>;
    PayableTypes?: any;
    PeriodTypes: Array<PeriodType>;
    Ranks: Array<Rank>;
    Countries: Array<Country>;
    CountryLanguageCode?: Array<CountryLanguageCode>;
    Regions: Array<any>;
}

export class CommonSettingResult extends ResponseBase {
    Data: CommonSetting;
}
