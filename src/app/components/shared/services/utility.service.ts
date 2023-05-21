

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';


@Injectable({
    providedIn: 'root'
})
export class UtilityService {
    constructor(
        public route: ActivatedRoute,
        public http: HttpClient
        ) {

    }
    isPackMultipleQuantity = true;
    isShowSimplifiedheader = false;
    // /**
    // *Get utility
    // * @method  birthDays
    // * @method  birthYears
    // * @method  birthMonths
    // * @method  getSortKey
    // */
    birthDays(BirthYear?: number, BirthMonth?: number) {
        const year = BirthYear ? Number(BirthYear) : (moment().year() - 18);
        const month = BirthMonth ? Number(BirthMonth) : Number('01');
        const num = new Date(year, month, 0).getDate();
        let i;
        const days = [];
        for (i = 1; i <= num; i++) {
            if (String(i).length === 1) {
                days.push('0' + String(i));
            } else {
                days.push(String(i));
            }
        }
        return days;
    }

    birthYears() {
        let years = [];
        const currentyear = moment().year();

        for (let i = currentyear - 100; i <= currentyear - 18; i++) {
            years.push({ text: String(i), value: String(i) });
        }

        years = years.reverse();
        return years;
    }

    birthMonths() {
        const months = [
            { text: 'January', value: '01' },
            { text: 'February', value: '02' },
            { text: 'March', value: '03' },
            { text: 'April', value: '04' },
            { text: 'May', value: '05' },
            { text: 'June', value: '06' },
            { text: 'July', value: '07' },
            { text: 'August', value: '08' },
            { text: 'September', value: '09' },
            { text: 'October', value: '10' },
            { text: 'November', value: '11' },
            { text: 'December', value: '12' }
        ];
        return months;
    }

    getSortKey() {
        return [
            { id: 1, name: 'item_name', lname: 'A-Z', sortby: 'ProductName', sorttype: 'desc' },
            { id: 2, name: 'item_name', lname: 'Z-A', sortby: 'ProductName', sorttype: 'asc' },
            {
                id: 3,
                name: 'global_qv',
                lname: 'high_to_low',
                sortby: 'QV',
                sorttype: 'asc'
            },
            {
                id: 4,
                name: 'global_qv',
                lname: 'low_to_high',
                sortby: 'QV',
                sorttype: 'desc'
            },
            { id: 5, name: 'price', lname: 'high_to_low', sortby: 'Price', sorttype: 'asc' },
            { id: 6, name: 'price', lname: 'low_to_high', sortby: 'Price', sorttype: 'desc' }
        ];

    }

    getParameterByName(name, url) {
        if (!url) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, '\\$&'); /*eslint no-useless-escape:0*/
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) { return null; }
        if (!results[2]) { return ''; }
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    getDefaultTranslation(translated, key, defaultValue) {
        if (translated == key) {
            return defaultValue;
        } else {
            return translated;
        }
    }
    getQueryParam(param) {
        if (param != null) {
            const search = this.route.snapshot.queryParams;
            if (Object.keys(search).length > 0) {
                const newObject = {};
                _.each(search, (value, key) => {
                    newObject[key.toLowerCase()] = value;
                });
                return newObject[param.toLowerCase()] || '';
            } else {
                return null;
            }
        }
    }
    getQueryParamKey(param) {
        if (param != null) {
            const search = this.route.snapshot.queryParams;
            if (Object.keys(search).length > 0) {
                let parmKey;
                _.each(search, (value, key) => {
                    if (key.toLowerCase() == param.toLowerCase()) {
                        parmKey = key;
                    }
                });
                return parmKey;
            } else {
                return null;
            }
        }
    }
    isEmptyObject(obj) {
        return (obj && (Object.keys(obj).length === 0));
    }
    getRegionID(countryCode: string, stateCode?: string): any{
        if (!sessionStorage.getItem('CommonSettings')){
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
            if (data1.length > 0){
               return data1[0].ID;
            }else{
                return 1;
            }
          }, (error) => {
            return 1;
          }, () => {
            return 1;
          });
        }else{
            const regionsData = JSON.parse(sessionStorage.getItem('CommonSettings'));
            const data1 = _.filter(regionsData.Regions, (region) => {
                return region.CountryList.some((country) => {
                    return country.CountryCode.toLowerCase() == countryCode.toLowerCase();
                });
            });
            if (data1.length > 0){
               return data1[0].ID;
            }else{
                return 1;
            }
        }
    }
    setAutoshipEditFlag(value) {
        localStorage.setItem('isEditAutoshipFlag', value);
    }

    getAutoshipEditFlag() {
        return localStorage.getItem('isEditAutoshipFlag') == 'true' ? true : false;
    }
    showSimplifiedheader(value = false){
        this.isShowSimplifiedheader = value;
    }
    isEnrollment(){
        return !!JSON.parse(sessionStorage.getItem('IsEnrollment'));
    }
}
