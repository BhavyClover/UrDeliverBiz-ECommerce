import { ResponseBase } from './responsebase.modal';

export class FindEnrollerResponse extends ResponseBase {
    Data: FindEnroller[];
}
export interface FindEnroller {
    BackOfficeId: string;
    CustomerId: number;
    FirstName: string;
    LastName: string;
    LegalFirstName: string;
    LegalLastName: string;
    AssociateType: string;
    Phone: string;
    EMail: string;
    AssociateTypeId: number;
    City: string;
    CountryCode: string;
    ProfileImageUrl: string;
    RomanizedFirstName: string;
    RomanizedLastName: string;
    State: string;
    StatusId: number;
    TextPhone: string;
}
