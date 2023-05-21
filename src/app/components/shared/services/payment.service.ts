import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { HostedpaymentDialogComponent } from '../model/hostedpayment-dialog/hostedpayment-dialog.component';
import { NotificationService } from './notification.service';
import { RestApiService } from './restapi.service';
import { UserService } from './user.service';
import { UniquePipe } from '../pipes/unique.pipe';
import * as moment from 'moment';
import { UtilityService } from './utility.service';
import { CompanyService } from './company.service';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    public PaymentDataResponse: any = {};
    public PaymentTypeResponse: Array<any> = [];
    public selectedPaymentTypeName = '';
    public SelectedPaymentTypes: any = {};
    public OldSelectedPaymentType: any = {};
    public oldSelectedPaymentTypeName: string = '';
    public AllowedMethods = [];
    public SaveMethods = [];
    public IsFrameReload: boolean;
    userService: UserServiceModal;

    isModalOpen = false;
    constructor(public dialog: MatDialog, public notificationService: NotificationService, public user: UserService, public apiService: RestApiService, public utilityService: UtilityService, public companyService: CompanyService, public configService: ConfigService) {
        this.userService = user.userServiceModal;
    }
    isLoggedIn() {
        if ((Object.keys(this.userService.customerData).length) && (this.userService.customerData.CustomerId) && this.user.checkIfUserAuthenticatedOrNot()) {
            return true;
        } else {
            return false;
        }
    }

    public getPaymentType(statecode?, countryCode?): Promise<Array<any>> {
        const getPaymentTypePromise = new Promise((resolve, reject) => {
            const request = {
                customerId: 0,
                storeid: 4,
              countrycode: countryCode || this.configService.commonData.selectedCountry || 'us',
                region: statecode || this.companyService.getRegionID(this.configService.commonData.selectedCountry) || this.userService.defaultState || "UT" 
            };
            this.apiService.getPaymentMerchants(request)
                .subscribe((result) => {
                    try {
                        if (parseInt(result.Status, 10) === 0) {
                            this.PaymentTypeResponse['AllowedMethods'] = new UniquePipe().transform(result.Data, 'MerchantId');
                            resolve(this.PaymentTypeResponse);
                        } else {
                            this.notificationService.error('error_', result.Message);
                            reject(result);
                        }
                    } catch (ex) {

                        this.notificationService.error('error_', 'error_occured_try_again');
                        reject(ex);
                    }
                }, error => {
                    reject(error);
                }, () => {

                });
        });

        const getCustomerSavedPaymentMethodPromise = new Promise((resolve, reject) => {
            const request = {
                customerId: 0,
                storeId: 4
            };
            this.apiService.getCustomerSavedPaymentMethods(request)
                .subscribe((result) => {
                    try {
                        if (parseInt(result.Status, 10) === 0) {
                            this.PaymentTypeResponse['SaveMethods'] = new UniquePipe().transform(result.Data, 'PaymentMethodId');
                            resolve(this.PaymentTypeResponse);
                        } else {
                            this.notificationService.error('error_', result.Message);
                            reject(result);
                        }
                    } catch (ex) {
                        this.notificationService.error('error_', 'error_occured_try_again');
                        reject(ex);
                    }
                }, error => {
                    reject(error);
                }, () => {

                });
        });

        const res = Promise.all([getPaymentTypePromise, getCustomerSavedPaymentMethodPromise]);
        return res;
    }

    public getPaymentData(paymentdata?: any, paymentMethod: any = '', IsApplication: boolean = false) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.role = 'dialog';
        dialogConfig.width = '720px';
        const promise = new Promise((resolve, reject) => {
            const getPaymentDataRequest = {
                iframeid: 'DsIframe',
                storeid: 0,
                CountryCode: this.configService.commonData.selectedCountry || 'us',
                region: this.companyService.getRegionID(this.configService.commonData.selectedCountry),
                languagecode: this.configService.commonData.selectedLanguage || 'en',
                customerId: this.userService.customerData.CustomerId || 0
            };
            this.apiService.getPaymentMethodIFrameTempUser(getPaymentDataRequest)
                .subscribe((result) => {
                    try {
                        if (Number(result.Status) === 0) {
                            const paymentData = result.Data;
                            this.PaymentDataResponse = paymentData;

                            const iframe = this.dialog.open(HostedpaymentDialogComponent, {
                                data: paymentData,
                                panelClass: 'hosted_payment-Dialog'
                            });
                            iframe.afterClosed().subscribe(result => {
                                if (result) {
                                    const newPayment: any = result;
                                    newPayment.MerchantId = paymentdata.MerchantId;
                                    if (!IsApplication && (!localStorage.getItem('guestLogin') || localStorage.getItem('guestLogin') == 'false')) {
                                        this.savePaymentMethod(newPayment);
                                    }
                                    else {
                                        this.getPaymentType();
                                    }
                                    const paymentMethods = [];
                                    const editingPaymentMethod = paymentMethod;
                                    if (editingPaymentMethod) {
                                        paymentMethods.splice(paymentMethods.indexOf(editingPaymentMethod), 1, newPayment);
                                        this.userService.paymentMethods = paymentMethods;
                                    } else if (paymentMethods.length >= 2) {
                                        paymentMethods.splice(paymentMethods.indexOf(editingPaymentMethod), paymentMethods.length - 1, newPayment);
                                    } else {
                                        // newPayment.CardType = newPayment.type;
                                        // newPayment.Last4 = newPayment.lastFour;
                                        // newPayment.ExpireMonth = newPayment.expireMonth;
                                        // newPayment.ExpireYear = newPayment.expireYear;
                                        newPayment.CardType = newPayment.type || newPayment.cardType;
                                        newPayment.Last4 = newPayment.lastFour || newPayment.token.lastFour;
                                        newPayment.ExpireMonth = newPayment.expireMonth || newPayment.card.expirationMonth;
                                        newPayment.ExpireYear = newPayment.expireYear || newPayment.card.expirationYear;
                                        newPayment.token = newPayment.token.token || newPayment.token;
                                        paymentMethods.push(newPayment);
                                        this.selectedPaymentTypeName = newPayment.CardType + ' ' + newPayment.Last4;
                                        this.userService.paymentMethods = paymentMethods;

                                    }
                                    this.userService.isPaymentChanged = true;
                                    localStorage.setItem('userService', JSON.stringify(this.userService));
                                    return;
                                }
                            });
                            iframe.afterOpened().subscribe(result => {
                                this.isModalOpen = true;
                            });
                            resolve(result);
                        } else {
                            this.notificationService.error('error_', result.ErrorDescription);
                            reject(result);
                        }
                    } catch (ex) {
                        this.notificationService.error('error_', 'error_occured_try_again');
                        reject(ex);
                    }
                }, (error) => {
                    reject(error);
                });
        });
        return promise;
    }

    public savePaymentMethod(payment) {
        const promise = new Promise((resolve, reject) => {
            const request = {
                customerId: 0,
                createPaymentMethod: {
                    MerchantId: payment.MerchantId || 99,
                    PaymentToken: payment.token,
                    CardType: payment.type,
                    NameOnAccount: payment.billingInfo.fullName || '',
                    Ending: payment.lastFour,
                    Expires: moment({ year: payment.expireYear, month: (parseInt(payment.expireMonth, 10) - 1), day: parseInt(moment().format('D'), 10) }).format(),
                    CurrencyCode: this.companyService.selectedCurrency.CurrencyCode
                }
            };
            this.apiService.createPaymentMethod(request).subscribe((response) => {
                const result = response.Data;
                if (response.Status.toString() !== '0') {
                    reject(response.ErrorDescription);
                    return;
                }
                this.getPaymentType();
                resolve(result);
            });
        });
        return promise;
    }

    public clearPayment() {
        this.PaymentDataResponse = {};
        this.PaymentTypeResponse = [];
        this.selectedPaymentTypeName = '';
        this.SelectedPaymentTypes = {};
        this.OldSelectedPaymentType = {};
        this.AllowedMethods = [];
        this.SaveMethods = [];
        localStorage.setItem('paymentService', JSON.stringify({}));
    }
}
