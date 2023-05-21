

import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { RetailData } from 'src/app/modals/storage.modal';
import { UtilityService } from './utility.service';


@Injectable({
    providedIn: 'root'
})
/**
 * Persistent service
 * used for persist application data in observable key value pair
 */
export class PersistentService {
    retailData: RetailData;
    constructor(
        public utilityService: UtilityService
        ) {
        this.getRetailData();
    }

    init() {
        this.retailData = {
            isNewAutoship: false,
            CurrentSelectedAutoOrder: 0,
            isChanged: false,
            AddMoreItemInAutoshipFlag: false,
            AddMoreItemInAutoshipData: {},
            editAutoshipItems: [],
            uniqueCategoryId: 0,
            IsPaid: false,
            SelectedAutoshipPayment: {
                PaymentTypeID: '',
                Name: '',
                Ending: '',
                PaymentDisplay: '',
                ExpireMonth: '',
                ExpireYear: '',
                BillingAddress: '',
                BillingAddress2: '',
                BillingCity: '',
                BillingCountry: '',
                BillingState: '',
                BillingZip: ''
            },
            Autoship: {
                Frequency: '',
                FrequencyTypeDescription: '',
                FrequencyTypeID: 0
            },
            autoshipDate: '',
            isNewAddress: '',
            isAddresschanged: false,
            IsMailingAddressVerified: false,
            AutoOrderShippingAddress: {},
        } as RetailData;
    }

    setRetailData(){
        localStorage.setItem('retailData', JSON.stringify(this.retailData));
        this.getRetailData();
    }

    getRetailData(){
        this.retailData = JSON.parse(localStorage.getItem('retailData'));
        if (!this.retailData || this.utilityService.isEmptyObject(this.retailData)) {
            this.init();
        }
    }
}
