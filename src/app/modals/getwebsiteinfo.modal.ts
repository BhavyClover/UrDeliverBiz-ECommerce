import { ResponseBase } from './responsebase.modal';

export interface GetWebSiteInformation {
    FirstName: string;
    LastName: string;
    EmailAddress: string;
    PrimaryPhone: string;
    SecondaryPhone: string;
    WebAlias: string;
    CustomerId: number;
    City: string;
    Region: string;
    CountryCode: string;
    AboutMe: string;
    EnrollmentUrl: string;
    OfficeUrl: string;
    ShoppingLink: string;
    Facebook: string;
    Twitter: string;
    Pinterest: string;
    YouTube: string;
    Linkdin: string;
    ImageUrl: string;
    BackOfficeId: string;
    ReplicatedSiteUrl?: any;
    LanguageCode: string;
    CustomerType: string;
}
export class GetWebSiteInformationResult extends ResponseBase {
    Data: GetWebSiteInformation;
}
