

import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class RegexService {
    constructor() {
    }

    getRegex(countryCode) {
        let regex: any;
        switch (countryCode) {
            case 'AR':
                regex = /^[a-zA-Z0-9 _.-]*$/;
                break;
            case 'AT':
            case 'AU':
            case 'BE':
            case 'HU':
            case 'NZ':
            case 'PH':
            case 'ZA':
                regex = /^\d{4}$/;
                break;
            case 'CR':
            case 'DE':
            case 'ES':
            case 'FR':
            case 'MX':
            case 'PE':
                regex = /^\d{5}$/;
                break;
            case 'RU':
            case 'EC':
            case 'SG':
            case 'IN':
                regex = /^\d{6}$/;
                break;
            case 'PA':
                regex = /^\d{5,6}$/;
                break;
            case 'JP':
                regex = /^([0-9]){3}[-]([0-9]){4}$/;
                break;
            case 'CA':
                regex = /^([ABCEGHJKLMNPRSTVXYabceghjklmnprstvxy]\d[ABCEGHJKLMNPRSTVWXYZabceghjklmnprstvwxyz]) {0,1}(\d[ABCEGHJKLMNPRSTVWXYZabceghjklmnprstvwxyz]\d)$/;
                break;
            case 'CL':
                regex = /^(\d{7}|\d{3}[-]\d{4})$/;
                break;
            case 'KR':
                regex = /^(\d{5}|\d{3}[-]\d{3})$/;
                break;
            case 'NL':
                regex = /^[1-9][0-9]{3}\s?([a-zA-Z]{2})?$/;
                break;
            case 'PT':
                regex = /^\d{4}([-]?\d{3})?$/;
                break;
            case 'US':
                regex = /^\d{5}([-]?\d{4})?$/;
                break;
            case 'GB':
                regex = /^([A-Pa-pR-Ur-uWYZwyz](([0-9](([0-9]|[A-Ha-hJKSTUWjkstuw])?)?)|([A-Ha-hK-Yk-y][0-9]([0-9]|[ABEHMNPRVWXYabehmnprvwxy])?)) [0-9][ABabD-Hd-hJLNjlnP-Up-uW-Zw-z]{2})|GIRgir 0AAaa$/;
                break;
            default:
                regex = /^[a-zA-Z0-9 _.-]*$/;
                break;
        }
        return regex;
    }
}
