export interface DefaultShippingAddress {
    ID: number;
    Line1: string;
    Line2: string;
    Line3: string;
    City: string;
    State: string;
    Zip: string;
    CountryCode: string;
}

export interface PrimaryAddress {
    ID: number;
    Line1: string;
    Line2: string;
    Line3: string;
    City: string;
    State: string;
    Zip: string;
    CountryCode: string;
}

export class User {
    CustomerId: number;
    BackOfficeId: string;
    BirthDate: Date;
    CompanyName: string;
    CustomerStatus: number;
    CustomerType: number;
    DefaultShippingAddress: DefaultShippingAddress;
    EmailAddress: string;
    EnrollerId: number;
    ExternalReferenceId?: any;
    FirstName: string;
    InactiveDate: Date;
    LanguageCode: string;
    LastName: string;
    PrimaryAddress: PrimaryAddress;
    PrimaryPhone: string;
    SecondaryPhone: string;
    SendEmails: boolean;
    SignupDate: Date;
    SponsorId: number;
    TaxExemptId: string;
    TaxId: string;
    TermsAccepted: boolean;
    TextPhone: string;
    Username: string;
    WebAlias: string;
}
