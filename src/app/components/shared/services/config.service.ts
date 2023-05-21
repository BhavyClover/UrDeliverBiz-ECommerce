import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonSetting } from 'src/app/modals/commonsetting.modal';
import { UserService } from './user.service';
import { RestApiService } from './restapi.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './notification.service';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from './company.service';
import { ShoppingCartService } from './shopping-cart.service';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {
  public commonSettings: CommonSetting;
  public localSettings: any;
  public countryLanguageCode: any = {};
  public commonData: any = {};
  public allowedCountries: any;
  constructor(
    public user: UserService,
    public http: HttpClient,
    public apiService: RestApiService,
    public translate: TranslateService,
    public notificationService: NotificationService,
    public activatedRoute: ActivatedRoute,
    public companyService: CompanyService,
    public shoppingCartService: ShoppingCartService
  ) {
    this.commonData.selectedLanguage = this.activatedRoute.snapshot.queryParams.language || sessionStorage.getItem('selectedLanguageCode') || 'en';
  }
  init(data: CommonSetting) {
    return new Promise((resolve, reject) => {
      this.commonSettings = data;
      this.user.init();
      if (!sessionStorage.getItem('allowedCountries')) {
        this.apiService.getActiveCountries().subscribe(data => {
          if(data && data.Data) {
            this.allowedCountries = this.countryLanguageCode = data.Data;
            sessionStorage.setItem('allowedCountries', JSON.stringify(this.allowedCountries))
            this.setSelectedCountry((this.activatedRoute.snapshot.queryParams.countrycode || (sessionStorage.getItem('selectedCountry')) || 'us'), this.commonData.selectedLanguage);
            resolve(this.allowedCountries);
          }
          else {
            this.notificationService.error('error_', 'API error: Countries not found!');
            reject([]);
          }
        }, (error) => {
          this.notificationService.error('error_', 'API error: Countries not found!' + error.toString());
          reject([]);
        });
      } 
      else {
        this.allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'))
        this.setSelectedCountry((this.activatedRoute.snapshot.queryParams.countrycode || (sessionStorage.getItem('selectedCountry')) || 'us'), this.commonData.selectedLanguage);
        resolve(this.allowedCountries);
      }
    });

  }

  getConfig() {
    return this.commonSettings;
  }
  getLocalConfig() {
      return this.localSettings;
  }

  setSelectedCountry(country, selectedLanguage) {
    selectedLanguage = selectedLanguage || this.commonData.selectedLanguage;
    sessionStorage.setItem('selectedCountry', country);
    sessionStorage.setItem('selectedLanguageCode', selectedLanguage);
    this.commonData.selectedCountry = country;
    sessionStorage.removeItem('CommonSettings');
    this.companyService.setCurrencyDetail(country);
    this.companyService.getRegionIDbyPromise(country).then((id: any) => {
      this.shoppingCartService.setShoppingCart(id);
    });
    this.getCommonSetting(country, selectedLanguage || this.commonData.selectedLanguage);
  }

  getCommonSetting(countryCode, languageCode) {
    const commonPromise = new Promise((resolve, reject) => {
      if (sessionStorage.getItem('CommonSettings')) {
        const data = JSON.parse(sessionStorage.getItem('CommonSettings'));
        this.setCommonSettingData(data, languageCode, countryCode);
        this.updateLocale(this.commonData.SelectedLanguage);
        resolve(data);
      } else {
        this.http.get(`assets/data/clientsetting.json`,
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json; charset=utf-8'
            }),
            withCredentials: true
          }).toPromise()
          .then((result: CommonSetting) => {
            this.commonSettings = result;
            this.setCommonSettingData(this.commonSettings, languageCode, countryCode);
            sessionStorage.setItem('CommonSettings', JSON.stringify(this.commonSettings));
            this.updateLocale(this.commonData.SelectedLanguage);
            resolve(this.commonSettings);
          }).finally(() => {
          });

      }
    });
    return commonPromise;
  }

  updateLocale(locale) {
    let languageCode = 'en';
    try {
        if (locale || parseInt(locale, 10) === 0) {
          if (this.commonData.selectedLanguage) {
            languageCode = this.commonData.selectedLanguage;
          } else if (this.commonData.Language) {
            const language = _.filter(this.commonData.Language, (lang) => {
              return parseInt(lang.LanguageID, 10) === parseInt(locale, 10);
            });
            if (language.length > 0) {
              languageCode = language[0].ISOCode;
            }
          }

          this.translate.use(languageCode == 'undefined' ? ('en') : languageCode);
        }
    }
    catch (ex) {
      console.warn('ex', ex.message);
    }
  }

  getLanguageId(languageData, languageCode) {
    let selectedLanguage = [];
    if (languageCode) {
      selectedLanguage = _.filter(languageData, (lang) => {
        return lang.LanguageCode === languageCode;
      });
      if (selectedLanguage.length > 0) {
        return selectedLanguage[0].LanguageCode;
      }
      else {
        return 0;
      }
    }
    else if (languageData) {
      return languageData[0]?.LanguageCode || 0;
    }
  }

  setCommonSettingData(data, languageCode, countryCode) {
    this.commonData = data;
    const country = _.find(this.allowedCountries, (item) => {
      return (
        item.CountryCode?.toLowerCase() === (countryCode?.toLowerCase() || "us")
      );
    });
    this.commonData.SelectedLanguage = this.getLanguageId(country?.CountryLanguages, languageCode);
    this.commonData.selectedCountry = countryCode || 'us';
    this.commonData.selectedLanguage = languageCode || country?.CountryLanguages[0].LanguageCode || 'en';
    this.commonData.AddressVerification = data?.AddressVerification;
    if (data.Countries && data.Countries.length) {
      _.each(data.Countries, (country) => {
        if (country.CountryCodeISO2.toLowerCase() == countryCode.toLowerCase()) {
          this.commonData.selectedCountryDescription = country.CountryName;
        }
      });
    }
    sessionStorage.setItem('CommonSettings', JSON.stringify(this.commonData));
    sessionStorage.setItem('selectedLanguageCode', this.commonData.selectedLanguage == 'undefined' ? ('en') : this.commonData.selectedLanguage);
  }

  checkGlCountryAvailable(countryCode) {
    const availableCountry = _.filter(this.countryLanguageCode, (item) => {
      return item.CountryCode.toLowerCase() == countryCode.toLowerCase();
    });

    return availableCountry.length > 0;
  }


  checkGlLanguageAvailable(languageCode) {
    const availableLanguage = _.filter(this.countryLanguageCode, (item) => {
      return item.ISOCode.toLowerCase() == languageCode.toLowerCase();
    });
    return availableLanguage.length > 0;
  }

  setWebsiteInfo(websiteInfo) {
    this.user.setEnrollerInfo(websiteInfo);
  }
}
