import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { throwError } from 'rxjs/internal/observable/throwError';
import { retry, catchError, tap } from 'rxjs/internal/operators';
import { environment } from 'src/environments/environment';
import { Enrollment } from 'src/app/modals/enrollment.model';
import { FindEnrollerResponse } from 'src/app/modals/findenroller.modal';
import { GetWebSiteInformationResult } from 'src/app/modals/getwebsiteinfo.modal';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  public loginStatus = new BehaviorSubject<boolean>(this.hasToken());
  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.getheaders();
  }

  getheaders(): any {
    let httpOptions: any;
    if (this.cookieService.get('X-Auth')) {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: 'Bearer ' + this.cookieService.get('X-Auth')
        })
      };
    } else {
      httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8'
        })
      };
    }
    return httpOptions;
  }
  // Error handling
  handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // window.alert(errorMessage);
    return throwError(errorMessage);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loginStatus.asObservable();
  }
  private hasToken(): boolean {
    return this.cookieService.check('X-Auth');
  }
  // Address  Controller
  getActiveCountries(): Observable<any> {
    if (sessionStorage.getItem('allowedCountries')) {
      let a = JSON.parse(sessionStorage.getItem('allowedCountries'))
      return a
    }
    else {
      const response = this.http.get<any>(`${environment.apiUrl}api/Address/GetActiveCountries`, this.getheaders())
        .pipe(
          catchError(this.handleError)
        );
      return response;
    }
  }

  getRegionID(stateCode: string, countryCode: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Address/GetRegionID`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  getStates(countryCode: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Address/GetStates?countryCode=${countryCode}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Company  Controller
  getCompanyDetails(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Company/Details`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }


  postCustomData(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Custom/PostCustomData`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  postCustomDatatoExtension(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Custom/PostCustomDatatoExtension`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Customers Controller

  addCustomerRewardPoints(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/AddCustomerRewardPoints`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  calculateCustomerOrderTotal(request): Observable<any> {

    return this.http.post<any>(`${environment.apiUrl}api/Customers/CalculateCustomerOrderTotal`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  createProspect(request): Observable<any> {

    return this.http.post<any>(`${environment.apiUrl}api/DiscoApi/CreateProspect`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }


  createCustomer(request: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/CreateCustomer`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createCustomerAutoshipOrder(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/CreateCustomerAutoshipOrder`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createCustomerOrder(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/CreateCustomerOrder`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  createCustomerOrderAndAutoship(request: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Orders/CreateOrderAutoOrder`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createCustomerServiceLogEntry(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/CreateCustomerServiceLogEntry`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createPaymentMethod(request): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/CreatePaymentMethod`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  deductCustomerRewardPoints(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/DeductCustomerRewardPoints`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  deleteCustomerAutoship(autoshipid: any): Observable<any> {

    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromString: 'autoshipId=' + autoshipid });
    return this.http.get<any>(`${environment.apiUrl}api/Customers/DeleteAutoship`, requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  deleteCustomer(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/DeleteCustomer`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  deletePaymentMethod(request: any): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromObject: request });
    return this.http.post<any>(`${environment.apiUrl}api/Customers/DeletePaymentMethod`, '', requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomer(customerID?: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomer?customerId=${customerID}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  getSearchCustomerDetail(customerID: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetSearchCustomerDetail?customerId=${customerID}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }


  getCustomerAutoships(customerID?): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerAutoships?customerId=${customerID}&includeServiceAutoships=true`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerCountries(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers​/GetCustomerCountries`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerCustomFields(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerCustomFields`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerDownlineIds(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerDownlineIds`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerIDs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers​/GetCustomerIDs`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerIDsbyFilter(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerIDsbyFilter`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerOrders(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerOrders`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerOrderDetail(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerOrderDetail`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerParties(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerParties`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerPartyTotals(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerPartyTotals`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerRewardPoints(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerRewardPoints`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerSavedPaymentMethods(request: any): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerSavedPaymentMethods`, requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerServices(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerServices`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerStats(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomerStats`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomersByParameter(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomersByParameter`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomersDataPoints(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/GetCustomersDataPoints`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomersToPlaceTo(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetCustomersToPlaceTo`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getDataPointCategories(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetDataPointCategories`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getNotificationEvents(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetNotificationEvents`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPaymentMerchants(request): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetPaymentMerchants`, requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPaymentMethodIFrame(request): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetPaymentMethodIFrame`, requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPaymentMethodIFrameTempUser(request): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetPaymentMethodIFrameTempUser`, requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getUnplacedCustomers(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers/GetUnplacedCustomers`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getWebsiteInformation_V1(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers​/GetWebsiteInformation_V1`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getWebsiteInformation(Webalias): Observable<any> {
    return this.http.get<GetWebSiteInformationResult>(`${environment.apiUrl}api/Customers/GetWebsiteInformation?webAlias=${Webalias}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  placeNode(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers​/PlaceNode`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  resetPassword(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Customers/ResetPassword`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  searchAssociate(req: any): Observable<any> {
    return this.http.get<FindEnrollerResponse>(`${environment.apiUrl}api/Customers/SearchAssociate?searchTerm=${req.searchTerm}&includeWebAliases=${req.includeWebAliases}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  submitEnrollmentForm(request: Enrollment): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/SubmitEnrollmentForm`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateAutoShipDateandAmount(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Customers/UpdateAutoShipDateandAmount`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateCustomer(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Customers/UpdateCustomer`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateCustomerByParameter(): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}​/api/Customers/UpdateCustomerByParameter`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  usernameAvailabilityCheck(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Customers​/UsernameAvailabilityCheck`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  sendWelComeEmail(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Customers/SendWelComeEmail`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Echo  Controller


  ping(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Echo​/Ping`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  pingDeep(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Echo​/PingDeep`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Office  Controller


  getMediaResources(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Office​/GetMediaResources`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getNotificationSettings(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Office​/GetNotificationSettings`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTrainingDetailsandProgress(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Office​/GetTrainingDetailsandProgress`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  triggerForgotPasswordProcess(request): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Office/TriggerForgotPasswordProcess`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Orders  Controller


  cancelOrder(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders/CancelOrder`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  deleteAutoship(autoshipid: number): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromString: 'autoshipId=' + autoshipid });
    return this.http.post<any>(`${environment.apiUrl}api/Orders/DeleteAutoship`, '', requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  enqueueStats(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/EnqueueStats`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  getAutoship(autoorderid): Observable<any> {
    const requestquery = this.getheaders();
    requestquery['params'] = new HttpParams({ fromString: 'autoshipId=' + autoorderid });
    return this.http.get<any>(`${environment.apiUrl}api/Orders/GetAutoship`, requestquery)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  getOrder(orderId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders/GetOrder?orderId=${orderId}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getOrderIds(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetOrderIds`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getOrderIdsFilter(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetOrderIdsFilter`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getOrderPackageDetails(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetOrderPackageDetails`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getOrderRMAs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetOrderRMAs`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getOrderType(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetOrderType`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getOrderTypes(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetOrderTypes`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPriceGroup(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetPriceGroup`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getPriceGroups(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetPriceGroups`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getShippingMethod(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetShippingMethod`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getShippingMethods(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetShippingMethods`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getUnshippedPackages_Deprecated(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Orders​/GetUnshippedPackages_Deprecated`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  importExternalOrder(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Orders/ImportExternalOrder`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  insertPayments(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Orders/InsertPayments`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  refundPayment(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Orders/RefundPayment`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  sendOrderReceipt(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Orders/SendOrderReceipt`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  setOrderShipped_Deprecated(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/SetOrderShipped_Deprecated`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  setPackageReturned_Deprecated(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/SetPackageReturned_Deprecated`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  setPackageShipped_Deprecated(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/SetPackageShipped_Deprecated`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  splitPackage(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Orders/SplitPackage`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateAutoship(autoshipid: number, request: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/UpdateAutoship/${autoshipid}`, JSON.stringify(request), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updatePackageStatus(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/UpdatePackageStatus`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updatePackageStatusBatch(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Orders/UpdatePackageStatusBatch`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Products Controller


  deleteItem(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products/DeleteItem`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getItembyId(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products​/GetItembyId`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getItembySKU(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products​/GetItembySKU`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getItems(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products/GetItems`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getItemsbyFilter(request: any): Observable<any> {
    const getItemsrequest = this.getheaders();
    getItemsrequest['params'] = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${environment.productUrl}api/Products/GetItemsbyFilter`, getItemsrequest)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getRegions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products/GetRegions`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getStockLevel(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products​/GetStockLevel`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getStores(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products​/GetStores`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getSubCategories(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products​/GetSubCategories`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getWarehouses(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Products​/GetWarehouses`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTopSellingProducts(request: any): Observable<any> {
    const getTopSellingrequest = this.getheaders();
    getTopSellingrequest['params'] = new HttpParams({ fromObject: request });
    return this.http.get<any>(`${environment.apiUrl}api/Products/GetTopSellingProducts`, getTopSellingrequest)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  updateStockLevel(): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}api/Products/UpdateStockLevel`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // RMAs  Controller


  createRMA(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/RMAs/CreateRMA`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  deleteRMA(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/RMAs​/DeleteRMA`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  getRMA(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/RMAs​/GetRMA`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getRMAs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/RMAs​/GetRMAs`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  markRMAReceived(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/RMAs/MarkRMAReceived`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  markRMAShipped(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/RMAs/MarkRMAShipped`, JSON.stringify({}), this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  // SSO  Controller


  getCustomerBySSOToken(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/SSO​/GetCustomerBySSOToken`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getAdminBySSOToken(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/SSO​/GetAdminBySSOToken`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerSSOURL(request: any): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/SSO/GetCustomerSSOURL?CustomerID=${request.CustomerID}&Dest=${request.Dest}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCustomerSSOURLByExternalId(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/SSO​/GetCustomerSSOURLByExternalId`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  // Utilities  Controller


  clearCache(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Utilities/ClearCache`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getError(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Utilities​/GetError`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Utilities​/GetStatus`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
  // Validate  Controller
  validateEmailAddress(request): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Validate/EmailAddress?EmailAddress=${request.EmailAddress}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  Login(request: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${environment.apiUrl}api/Validate/Login`, JSON.stringify(request), {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      }),
      observe: 'response'
    })
      .pipe(
        retry(1),
        tap((resp: HttpResponse<any>) => {
          if (resp.headers && resp.headers.get('X-Auth')) {
            this.cookieService.set('X-Auth', resp.headers.get('X-Auth'), null, '/');
            this.getheaders();
          }
          return resp;
        }),
        catchError(this.handleError)
      );
  }

  Logout(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}api/Validate/Logout`, '', this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  validateTaxId(taxId: string) {
    return this.http.get<any>(`${environment.apiUrl}api/Validate​/TaxId?taxId=${taxId}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  validateUsername(username: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/Validate/Username?username=${username}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  validateWebAlias(webAlias: string) {
    return this.http.get<any>(`${environment.apiUrl}api/Validate/WebAlias?webAlias=${webAlias}`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getCompanyCountryLanguages() {
    return this.http.get<any>(`${environment.apiUrl}api/Common/GetCompanyCountryLanguages`, this.getheaders())
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }
}
