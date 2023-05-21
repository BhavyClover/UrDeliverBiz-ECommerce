
export class ResponseBase {
    Status: number;
    ErrorDescription: string;
    Message: string;
    ErrorTransactionId?: any;
    constructor(){
        this.Status = ResponseStatus.Success;
        this.Message = ResponseStatus.Success.toString();
        this.ErrorDescription = '';
    }
}
enum ResponseStatus {
    Success = 0,
    Failed = 1
}
