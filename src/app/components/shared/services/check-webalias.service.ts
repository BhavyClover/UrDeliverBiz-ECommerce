import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { RestApiService } from './restapi.service';
import { UserService } from './user.service';
import { ConfigService } from './config.service';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class CheckWebAliasService {
    service = {};
    isRequestPending = false;
    webAlias = '';
    $stateParams: any = {};
    userService: UserServiceModal;
    constructor(
        public apiService: RestApiService,
        public user: UserService,
        public configService: ConfigService,
        private route: ActivatedRoute
    ) {
        this.userService = user.userServiceModal;
    }

    // /**
    // * Verify Webalias
    // * @method  verifyWebalias
    // * @param   {string}  id   Webalias name.
    // */

    verifyWebalias(id): any {
        const webaliasDefer = new Promise((resolve, reject) => {
            const verifyWebaliasRequest = '?id=' + id;
            this.apiService.getWebsiteInformation(verifyWebaliasRequest).subscribe((result) => {
                if (result.Status === 0) {
                    this.userService.WebAlias = id;
                    if (result.Data.CustomerId > 0) {
                        this.userService.enrollerInfo = result.Data[0];
                        if (this.userService.enrollerInfo) {
                            this.userService.enrollerInfo.Referral = id;
                            if (!this.userService.customerData.CustomerId) {
                                this.configService.setSelectedCountry((this.route.snapshot.queryParams.countrycode?.toLowerCase() || this.configService.commonData.selectedCountry.toLowerCase() || this.userService.enrollerInfo.Country.toLowerCase()), (this.route.snapshot.queryParams.language?.toLowerCase() || this.configService.commonData.selectedLanguage.toLowerCase() || 'en'));
                            }
                        }
                    }
                    resolve(result);
                }
                else {
                    reject(result);
                }
            }, (error) => {
                reject(error);
            });
            return webaliasDefer;
        });
    }

    // /**
    // * Check WebAlias
    // * @method  checkWebAlias
    // */

    checkWebAlias(): any {
        const promise = new Promise((resolve, reject) => {
            if (this.$stateParams.WebAlias === undefined) {
            }
            else {
                this.userService.WebAlias = this.$stateParams.WebAlias;
                if (this.webAlias !== this.$stateParams.WebAlias) {
                    this.webAlias = this.$stateParams.WebAlias;
                    if (!this.isRequestPending) {
                        this.isRequestPending = true;
                        this.verifyWebalias('').then((result) => {
                            this.isRequestPending = false;
                            if ((this.userService.enrollerInfo.WebAlias !== this.$stateParams.WebAlias) && (this.userService.enrollerInfo.Referral !== this.$stateParams.WebAlias)) {
                                this.userService.enrollerInfo = '';
                            }
                            resolve(result);
                        }, () => {
                            this.isRequestPending = false;
                            reject();
                        });
                    }
                } else {
                    if (this.userService.enrollerInfo && this.userService.enrollerInfo.CustomerId) {
                    }
                    if (!this.isRequestPending) {
                        resolve('');
                    }

                }
            }
        });
        return promise;
    }
}
