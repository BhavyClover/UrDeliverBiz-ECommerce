
    export interface Item {
        ItemId: number;
        Quantity: number;
        IsReward: boolean;
    }

    export interface OrderCreditCard {
        CardToken: string;
        NameOnCard: string;
        Last4: string;
        CardType: string;
        ExpirationMonth: number;
        ExpirationYear: number;
    }

    export interface Payment {
        Amount: number;
        SavePaymentMethodId: string;
        OnFileCard: string;
        CurrencyCode: string;
        MerchantId: number;
        SavePayment: boolean;
        OrderCreditCard: OrderCreditCard;
    }

    export interface OrderShippingAddress {
        Line1: string;
        Line2: string;
        City: string;
        State: string;
        Zip: string;
        CountryCode: string;
    }
    export interface ShippingAddress {
        Street1: string;
        Street2: string;
        Street3: string;
        City: string;
        Region: string;
        PostalCode: string;
        CountryCode: string;
    }

    export interface Custom {
        AutoOrderId: number;
        AutoShipId: number;
    }

    export interface CreateOrder {
        Attention: string;
        CouponCodes: Array<any>;
        CurrencyCode: string;
        FirstName: string;
        Items: Array<Item>;
        LastName: string;
        OrderType: number;
        PartyId: number;
        Payments: Array<Payment>;
        Phone: string;
        PriceGroup: number;
        ShipMethodId: number;
        ShippingAddress: OrderShippingAddress;
        SpecialInstructions: string;
        StoreId: number;
        WarehouseId: number;
        CountryCode: string;
    }

    export interface CreateAutoOrder {
        StartDate: Date;
        Frequency: string;
        ShipMethodId: number;
        MerchantId: number;
        PaymentMethodId: string;
        ShippingAddress?: ShippingAddress;
        Items: Array<Item>;
        PaymentMerchantId?: number;
        ShipAddress?: ShippingAddress;
        Custom?: Custom;
        CustomFields?: Custom;
    }

    export class CreateOrderAndAutoShip {
        customerId: number;
        createOrder: CreateOrder;
        createAutoOrder: CreateAutoOrder;
    }

