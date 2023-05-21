import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { Currency } from 'src/app/modals/currency.modal';
import { UserService } from './user.service';


@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    public defaultCurrency = {
        CurrencyCode: 'USD',
        DecimalLength: 2,
        Description: 'United States Dollar',
        ExchangeRate: 1,
        Symbol: '$'
    } as Currency;
    public selectedCurrency: Currency;
    constructor(
        public route: ActivatedRoute,
        public http: HttpClient,
        public userService: UserService
    ) {
        const selectedCountry = sessionStorage.getItem('selectedCountry') || 'us';
        this.setCurrencyDetail(selectedCountry);
    }
    getRegionIDbyPromise(countryCode: string, stateCode?: string): any {
        const promise = new Promise((resolve, reject) => {
            if (!sessionStorage.getItem('CommonSettings')) {
                this.http.get<any>(`assets/data/clientsetting.json`, {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json; charset=utf-8'
                    }),
                    withCredentials: true
                }).subscribe((data) => {
                    const data1 = _.filter(data.Regions, (region) => {
                        return region.CountryList.some((country) => {
                            return country.CountryCode.toLowerCase() == countryCode?.toLowerCase();
                        });
                    });
                    if (data1.length > 0) {
                        resolve(data1[0].ID);
                        return data1[0].ID;
                    } else {
                        resolve(1);
                        return 1;
                    }
                }, (error) => {
                    reject({});
                    return 1;
                }, () => {
                    reject({});
                    return 1;
                });
            } else {
                const regionsData = JSON.parse(sessionStorage.getItem('CommonSettings'));
                const data1 = _.filter(regionsData.Regions, (region) => {
                    return region.CountryList.some((country) => {
                        return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                    });
                });
                if (data1.length > 0) {
                    resolve(data1[0].ID);
                    return data1[0].ID;
                } else {
                    resolve(1);
                    return 1;
                }
            }
        });
        return promise;
    }

    getRegionID(countryCode: string, stateCode?: string): any {
        if (!sessionStorage.getItem('CommonSettings')) {

            this.http.get<any>(`assets/data/clientsetting.json`, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json; charset=utf-8'
                }),
                withCredentials: true
            }).subscribe((data) => {
                const data1 = _.filter(data.Regions, (region) => {
                    return region.CountryList.some((country) => {
                        return country?.CountryCode?.toLowerCase() == countryCode?.toLowerCase();
                    });
                });
                if (data1.length > 0) {
                    return this.sortingAscendingOrder(data1)[0].ID;
                } else {
                    return 1;
                }
            }, (error) => {
                return 1;
            }, () => {
                return 1;
            });
        } else {
            // found item in session storage
            const regionsData = JSON.parse(sessionStorage.getItem('CommonSettings'));
            // filtering regions data
            const data1 = _.filter(regionsData.Regions, (region) => {
                return region.CountryList.some((country) => {
                    return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                });
            });
            // data1 now has every country with same country code so arranging in lower to higher ids of country
            if (data1.length > 0) {
                return this.sortingAscendingOrder(data1)[0].ID;
            } else {
                return 1;
            }
        }
    }

    getCurrencyDetail(countryCode = 'us'): Currency {
        if (!sessionStorage.getItem('CommonSettings')) {
            this.http.get<any>(`assets/data/clientsetting.json`, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json; charset=utf-8'
                }),
                withCredentials: true
            }).subscribe((data) => {
                const data1 = _.filter(data.Regions, (region) => {
                    return region.CountryList.some((country) => {
                        return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                    });
                });
                if (data1.length > 0) {
                    return this.sortingAscendingOrder(data1)[0].Currency;
                } else {
                    return this.defaultCurrency;
                }
            }, (error) => {
                return this.defaultCurrency;
            }, () => {
                return this.defaultCurrency;
            });
        } else {
            const regionsData = JSON.parse(sessionStorage.getItem('CommonSettings'));
            const data1 = _.filter(regionsData.Regions, (region) => {
                return region.CountryList.some((country) => {
                    return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                });
            });
            if (data1.length > 0) {
                return this.sortingAscendingOrder(data1)[0].Currency;
            } else {
                return this.defaultCurrency;
            }
        }
    }
    setCurrencyDetail(countryCode = 'us') {
        this.userService.userServiceModal.selectedShippingMethod = 0;
        if (!sessionStorage.getItem('CommonSettings')) {
            this.http.get<any>(`assets/data/clientsetting.json`, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json; charset=utf-8'
                }),
                withCredentials: true
            }).subscribe((data) => {
                const data1 = _.filter(data.Regions, (region) => {
                    return region.CountryList.some((country) => {
                        return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                    });
                });
                if (data1.length > 0) {
                    this.selectedCurrency = this.sortingAscendingOrder(data1)[0].Currency;
                } else {
                    this.selectedCurrency = this.defaultCurrency;
                }
            }, (error) => {
                this.selectedCurrency = this.defaultCurrency;
            }, () => {
                this.selectedCurrency = this.defaultCurrency;
            });
        } else {
            const regionsData = JSON.parse(sessionStorage.getItem('CommonSettings'));
            const data1 = _.filter(regionsData.Regions, (region) => {
                return region.CountryList.some((country) => {
                    return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                });
            });
            if (data1.length > 0) {
                // this.selectedCurrency = this.sortingAscendingOrder(data1)[0].Currency;
                this.selectedCurrency = this.defaultCurrency;
            } else {
                this.selectedCurrency = this.defaultCurrency;
            }
        }
    }
    setAutoshipEditFlag(value) {
        localStorage.setItem('isEditAutoshipFlag', value);
    }

    getAutoshipEditFlag() {
        return localStorage.getItem('isEditAutoshipFlag') == 'true' ? true : false;
    }
    sortingAscendingOrder(Array){
        for (let i = 0; i < Array.length; i++) {
            for (let j = i + 1; j < Array.length; j++) {
                if (Array[i]?.ID > Array[j]?.ID) {
                    const temp = Array[i];
                    Array[i] = Array[j];
                    Array[j] = temp;
                }
            }
        }
        return Array;
    }
}
