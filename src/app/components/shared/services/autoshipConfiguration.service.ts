import { Injectable } from '@angular/core';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { NotificationService } from './notification.service';
import { RestApiService } from './restapi.service';
import { UserService } from './user.service';
import * as moment from 'moment';
import { UtilityService } from './utility.service';
import { PersistentService } from './persistent.service';
import { ConfigService } from './config.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class AutoshipConfigurationService {

    public commonData: any;
    public setting: any = {};
    public userService: UserServiceModal;
    public maxCurrentMonth: boolean = false;
    public restrictCurrentMonth: boolean;
    public currentAutoshipdate: boolean;
    public autoshipDate: any;

    constructor(
        public notificationService: NotificationService,
        public user: UserService,
        public apiService: RestApiService,
        public utilityService: UtilityService,
        public persistentService: PersistentService,
        public configService: ConfigService,
        public translate: TranslateService
    ) {
        this.userService = this.user.userServiceModal;
        this.commonData = this.configService.getConfig();
        this.autoshipDate = this.autoshipDate || moment().add(1, 'months').format('DD MMMM YYYY');
    }

    onInit(): void {
        this.init();
    }

    init() {
        const autoshipConfigData = [{
            CustomerTypeId: '1',
            NewAutoshipRestrictedDates: null,
            StartDate: '2021-10-25',
            NewAutoshipEndDate: 'All',
            AutoshipNotPaidRestrictedDates: null,
            AutoshipNotPaidEndDate: 'All',
            AutoshipPaidEndDate: 'All',
            AutoshipPaidRestrictedDates: null
        }];
        if (autoshipConfigData.length > 0) {
            this.setting = autoshipConfigData[0];
            this.setting.allowEdit = true;
            this.setting.disableEdit = false;
            let isfreqcall = false;
            if (this.utilityService.getAutoshipEditFlag()) {
                this.setting.configDate = this.setting.AutoshipPaidEndDate;
                this.setting.configRestrictedDate = this.setting.AutoshipPaidRestrictedDates ? this.setting.AutoshipPaidRestrictedDates.split(',') : '';
            }

            if (moment(this.setting.configDate).format('DD-MM-YYYY') == moment().endOf('month').format('DD-MM-YYYY')) {
                this.setting.currentMonthOnly = true;
            }

            if (this.setting.configDate === 'None' || this.setting.configDate === 'All') {
                this.setting.InvalidEndDate = true;
            }
            if (this.setting.configDate !== 'None') {
                isfreqcall = true;
                this.getDefaultFrequency().then(() => {
                    this.setAutoshipDate();
                });
            } else {
                this.setting.disableEdit = true;
                this.autoshipDate = this.autoshipDate || moment().add(1, 'months').format('DD MMMM YYYY');
            }
            if (!isfreqcall) {
                this.getDefaultFrequency();
            }
        } else {
            this.setting.allowEdit = true;
            this.getDefaultFrequency();
        }

    }

    // /**
    //   * Get Next Remaining Date
    //   * @method  getNextRemainingDate
    //   */
    getNextRemainingDate() {
        try {
            let num;
            if (this.utilityService.getAutoshipEditFlag()) {
                num = this.setting.AutoshipPaidRestrictedDates.split(',');
            }
            else {
                num = this.setting.NewAutoshipRestrictedDates.split(',');
            }

            let selecteddate = true;
            let currentdate = moment(this.getDefaultDate(this.setting.autoshipSettings));
            let defaultDate = moment(this.getDefaultDate(this.setting.autoshipSettings));
            let day = moment(currentdate).format('D');
            let isRestricted = !!~num.indexOf(day);
            let assignDate;

            while (selecteddate) {
                if (
                    this.setting.configDate === 'All' ||
                    !this.setting.configDate ||
                    currentdate <= moment(this.setting.configDate) ||
                    defaultDate <= moment(new Date())
                ) {
                    day = moment(currentdate).format('D');
                    isRestricted = !!~num.indexOf(day);
                    if (!isRestricted) {
                        assignDate = moment(currentdate).format('DD MMMM YYYY');
                        selecteddate = false;
                        break;
                    }
                    currentdate = currentdate.add(1, 'days');
                    continue;
                } else if (this.setting.configDate && moment(this.setting.configDate) >= defaultDate) {
                    day = moment(defaultDate).format('D');
                    isRestricted = !!~num.indexOf(day);
                    if (!isRestricted) {
                        assignDate = moment(defaultDate).format('DD MMMM YYYY');
                        selecteddate = false;
                        break;
                    }
                    defaultDate = defaultDate.add(-1, 'days');
                    continue;
                }
                else if (moment(this.setting.configDate) <= defaultDate) {
                    defaultDate = defaultDate.add(-1, 'days');
                    continue;
                }
            }
            return assignDate;
        } catch (ex) {
            console.error('ex', ex);
        }
    }

    // /**
    // * Set Autoship Date
    // * @method  setAutoshipDate
    // */
    setAutoshipDate() {
        if (this.setting && this.setting.configRestrictedDate) {
            try {
                const dates = this.setting.configRestrictedDate;
                const counter = 0;
                const today = parseInt(moment(new Date()).format('DD'), 10);
                const endofmonth = moment(new Date()).daysInMonth();
                const num = this.setting.configRestrictedDate;
                if (dates.length > 0) {
                    let i;
                    _.each(dates, () => {
                        if (counter < 1) {
                            if ((this.setting.InvalidEndDate ? moment().add(1, 'months') : moment(this.setting.configDate)).format('MM-YY') == moment(this.setting.StartDate).format('MM-YY')) {
                                if (this.setting.currentMonthOnly) {
                                    if (endofmonth == dates.length) {
                                        this.autoshipDate = this.autoshipDate || moment(1, 'DD').add(1, 'month').format('DD MMMM YYYY');
                                        this.restrictCurrentMonth = false;
                                    } else {
                                        let existCurrentMonth = false;
                                        for (i = today + 1; i <= endofmonth; i++) {
                                            if (num.map(Number).indexOf(i) == -1) {
                                                existCurrentMonth = true;
                                                break;
                                            }
                                        }
                                        if (existCurrentMonth) {
                                            this.autoshipDate = this.autoshipDate || moment(i, 'DD').format('DD MMMM YYYY');
                                            this.restrictCurrentMonth = true;
                                            this.maxCurrentMonth = true;
                                        } else {
                                            for (i = today; i >= 1; i--) {
                                                if (num.map(Number).indexOf(i) == -1) {
                                                    this.autoshipDate = this.autoshipDate || moment(i, 'DD').add(1, 'month').format('DD MMMM YYYY');
                                                    this.restrictCurrentMonth = false;
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    let exist = false;
                                    for (i = today + 1; i <= endofmonth; i++) {
                                        if (num.map(Number).indexOf(i) == -1) {
                                            exist = true;
                                            break;
                                        }
                                    }
                                    if (exist) {
                                        this.autoshipDate = this.autoshipDate || moment(i, 'DD').format('DD MMMM YYYY');
                                        this.restrictCurrentMonth = true;
                                    } else {
                                        for (i = 1; i <= today; i++) {
                                            if (num.map(Number).indexOf(i) == -1) {
                                                this.autoshipDate = this.autoshipDate || moment(i, 'DD').add(1, 'month').format('DD MMMM YYYY');
                                                this.restrictCurrentMonth = false;
                                            }
                                        }
                                    }
                                }
                            } else {
                                this.autoshipDate = this.autoshipDate || this.getNextRemainingDate();
                            }
                        } else {
                            this.autoshipDate = this.currentAutoshipdate || this.getNextRemainingDate();
                        }
                    });
                } else {
                    if (this.setting.currentMonthOnly) {
                        this.autoshipDate = this.autoshipDate || this.getNextRemainingDate() || moment(new Date()).add(1, 'days').format('DD MMMM YYYY');
                        this.restrictCurrentMonth = true;
                        this.maxCurrentMonth = true;
                    } else {
                        this.autoshipDate = this.autoshipDate || moment().add(1, 'months').format('DD MMMM YYYY');
                    }
                }
            } catch (e) {
                if (this.setting.currentMonthOnly) {
                    this.autoshipDate = this.autoshipDate || moment(new Date()).add(1, 'days').format('DD MMMM YYYY');
                    this.maxCurrentMonth = true;
                } else {
                    this.autoshipDate = this.autoshipDate || moment().add(1, 'months').format('DD MMMM YYYY');
                }
            }
        } else if (this.setting.currentMonthOnly) {
            this.autoshipDate = this.autoshipDate || this.getNextRemainingDate() || moment(new Date()).add(1, 'days').format('DD MMMM YYYY');
            this.maxCurrentMonth = true;
        } else {
            this.autoshipDate = this.autoshipDate || this.getNextRemainingDate() || moment(this.getDefaultDate(this.setting.autoshipSettings)).format('DD MMMM YYYY');
        }
    }

    // /**
    // * Get Disable Days
    // * @method  getDisableDays
    // * @param   {number} year    Date of Year
    // */
    getDisableDays(year) {
        const disableDatesArr = [];
        const dateStart = moment(this.setting.StartDate);
        let dateEnd = moment(this.setting.configDate);
        let timeValues = [];
        let currentMonthOnly;
        if (this.setting.configDate == 'None') {
            this.autoshipDate = this.autoshipDate || '';
        }
        if (this.setting.configDate == 'All') {
            // this array is for all months
            timeValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        } else {
            if ((this.setting.InvalidEndDate ? moment().add(1, 'months') : moment(this.setting.configDate)).format('MM-YY') == moment(this.setting.StartDate).format('MM-YY') && this.restrictCurrentMonth === false) {
                currentMonthOnly = _.range(1, (this.setting.InvalidEndDate ? moment().add(1, 'months') : moment(this.setting.configDate)).daysInMonth() + 1);
                currentMonthOnly.splice(parseInt(moment(this.autoshipDate).format('DD'), 10) - 1, 1);
                dateEnd = (this.setting.InvalidEndDate ? moment().add(1, 'months') : moment(this.setting.configDate)).add(1, 'months');
            }
            while (dateEnd >= dateStart) {
                timeValues.push(dateStart.format('MM'));
                dateStart.add(1, 'month');
            }
        }
        let restricteddates = [];
        if (currentMonthOnly) {
            restricteddates = currentMonthOnly ? currentMonthOnly : [];
        } else {
            restricteddates = this.setting.configRestrictedDate || [];
        }
        if (restricteddates.length > 0) {
            const addYear = this.setting.configDate === 'All' ? 20 : 0;
            for (let y = year; y <= (year + addYear); y++) {
                for (let j = 0; j < timeValues.length; j++) {
                    if (j > 0 && timeValues[j - 1] > timeValues[j]) {
                        y++;
                    }
                    for (let i = 0; i <= restricteddates.length; i++) {
                        const daysofMonth = moment(timeValues[j], 'MM').daysInMonth();
                        if (daysofMonth >= restricteddates[i]) {
                            const dat = timeValues[j] + '/' + restricteddates[i] + '/' + y;
                            disableDatesArr.push(moment(dat).format('DD MMMM YYYY'));
                        }
                    }
                }
            }
        }
        return disableDatesArr;
    }

    getDefaultFrequency() {
        const defaultFrequencyPromise = new Promise((resolve, reject) => {
            const frequencyTypes = this.commonData.FrequencyTypes;
            const frequencies = [];
            this.setting.autoshipSettings = {},
                frequencyTypes.filter((type) => {
                    frequencies.push(type);
                });
            if (frequencies.length > 1) {

                this.setting.frequencies = frequencies;
                this.setting.autoshipFrequencies = cloneDeep(frequencies);
                this.setting.autoshipSettings.frequency = this.setting.autoshipFrequencies[0].Description;
                this.setting.autoshipSettings.frequencyTypeID = this.setting.autoshipFrequencies[0].ID;

                _.each(this.setting.autoshipFrequencies, (autoshipFrequency) => {
                    autoshipFrequency.Description = autoshipFrequency.Description
                        ? this.translate.instant(autoshipFrequency.Description.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_'))
                        : '';
                    if (this.persistentService.retailData.Autoship && this.persistentService.retailData.Autoship.FrequencyTypeID == autoshipFrequency.ID) {
                        this.setting.autoshipSettings.frequency = this.persistentService.retailData.Autoship.FrequencyTypeDescription;
                        this.setting.autoshipSettings.frequencyTypeID = this.persistentService.retailData.Autoship.FrequencyTypeID;
                    }
                    if (!this.persistentService.retailData.Autoship && (this.persistentService.retailData.Autoship.selectedFrequencyID == autoshipFrequency.ID)) {
                        this.setting.autoshipSettings.frequency = autoshipFrequency.Description;
                        this.setting.autoshipSettings.frequencyTypeID = autoshipFrequency.ID;
                    }
                });
                if (!this.setting.autoshipSettings.frequencyTypeID && this.utilityService.getAutoshipEditFlag()) {
                    this.setting.autoshipSettings.frequency = this.setting.autoshipFrequencies[0].Description;
                    this.setting.autoshipSettings.frequencyTypeID = this.setting.autoshipFrequencies[0].ID;
                }
                this.setting.IsMultipleFrequency = true;
            } else if (frequencies.length == 1) {
                this.setting.IsMultipleFrequency = false;
                this.setting.autoshipSettings.frequency = (this.persistentService.retailData.Autoship && this.persistentService.retailData.Autoship.FrequencyTypeDescription == frequencies[0].Description) ? this.persistentService.retailData.Autoship.FrequencyTypeDescription : frequencies[0].Description;
                this.setting.autoshipSettings.frequencyTypeID = (this.persistentService.retailData.Autoship && this.persistentService.retailData.Autoship.FrequencyTypeID == frequencies[0].ID) ? this.persistentService.retailData.Autoship.FrequencyTypeID : frequencies[0].ID;
            }
            resolve(this.setting.autoshipSettings);
        });
        return defaultFrequencyPromise;
    }

    getDefaultDate(frequencyList) {
        let frequency;
        if (!this.setting.IsMultipleFrequency) {
            frequency = frequencyList.frequencyTypeID;
        }
        let date = new Date();
        switch (frequency) {
            case 0:
                date = moment(new Date()).add(1, 'w').toDate();
                break;
            case 1:
                date = moment(new Date()).add(2, 'w').toDate();
                break;
            case 2:
                date = moment(new Date()).add(1, 'M').toDate();
                break;
            case 3:
                date = moment(new Date()).add(2, 'M').toDate();
                break;
            case 4:
                date = moment(new Date()).add(3, 'M').toDate();
                break;
            case 5:
                date = moment(new Date()).add(6, 'M').toDate();
                break;
            case 6:
                date = moment(new Date()).add(1, 'y').toDate();
                break;
            case 7:
                date = moment(new Date()).add(4, 'w').toDate();
                break;
            case 8:
                date = moment(new Date()).add(6, 'w').toDate();
                break;
            case 9:
                date = moment(new Date()).add(8, 'w').toDate();
                break;
            case 10:
                date = moment(new Date()).add(12, 'w').toDate();
                break;
            default:
                date = moment(new Date()).add(1, 'M').toDate();
                break;
            // code to be executed if n doesn't match any constant
        }
        return date;
    }

    getAutoshipDate() {
        return this.autoshipDate;
    }

}
