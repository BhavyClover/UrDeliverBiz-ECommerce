import { ResponseBase } from './responsebase.modal';

export class OrderStatus {
  OrderNumber: number;
  Result: number;
}

export class EnrollmentResponse extends ResponseBase {
  Data: EnrollmentResult;
}

export class EnrollmentResult {
  OrderStatus: OrderStatus;
  AssociateID: string;
  FirstName: string;
  LastName: string;
  Email: string;
}
