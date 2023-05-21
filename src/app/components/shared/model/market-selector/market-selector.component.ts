import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../../services/config.service';
import { RestApiService } from '../../services/restapi.service';
import { UserService } from '../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { FindEnrollerComponent } from '../findenroller/findenroller.component';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { CompanyService } from '../../services/company.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-market-selector',
  templateUrl: './market-selector.component.html',
  styleUrls: ['./market-selector.component.scss']
})
export class MarketSelectorComponent implements OnInit {
  selectedCountry: any = {};
  selectedUserType: any = {};
  public allowedCountries: any = [];
  customerTypes: any = {};
  userService: UserServiceModal;
  constructor(
    public dialog: MatDialog,
    public configService: ConfigService,
    public user: UserService,
    public apiService: RestApiService,
    private route: ActivatedRoute,
    public companyService: CompanyService,
    public notificationService: NotificationService
  ) {
    this.userService = user.userServiceModal;
    this.customerTypes = configService.commonSettings.CustomerTypes;
      this.allowedCountries = JSON.parse(sessionStorage.getItem('allowedCountries'));
      const selectedCountry = !sessionStorage.getItem('selectedCountry') ? 'us' : sessionStorage.getItem('selectedCountry');
      const selectedCustomerTypeID = sessionStorage.getItem('selectedCustomerTypeID') === 'undefined' ? null : sessionStorage.getItem('selectedCustomerTypeID');
      this.selectedUserType = _.find(this.configService.commonSettings.CustomerTypes, (customerType) => {
        return (customerType.ID === (parseInt(this.route.snapshot.queryParams.type, 10) || parseInt(selectedCustomerTypeID, 10) || 2));
      });
      this.selectedCountry = _.find(this.allowedCountries, (item) => {
        return (item.CountryCode.toLowerCase() === (this.route.snapshot.queryParams.countrycode || selectedCountry || 'us'));
      });
  }

  ngOnInit(): void {
    let queryCategory;
    if (this.route.snapshot.queryParams.catId) {
      queryCategory = parseInt(this.route.snapshot.queryParams.catId, 10);
    } else if (this.route.snapshot.queryParams.category) {
      queryCategory = parseInt(this.route.snapshot.queryParams.category, 10);
    }
  }

  changeAffiliate() {
    this.dialog.open(FindEnrollerComponent, {
      data: {},
      panelClass: 'findenroller-dialog',
      autoFocus: false
    });
  }

  continue() {
    if (this.selectedCountry?.CountryCode) {
      this.userService.customerTypeID = this.selectedUserType.ID;
      this.dialog.closeAll();
      sessionStorage.setItem('IsMarketCountrySelected', 'true');
      sessionStorage.setItem('selectedCountry', this.selectedCountry.CountryCode || this.configService.commonData.selectedCountry);
      sessionStorage.setItem('selectedLanguageCode', this.configService.commonData.selectedLanguage || this.selectedCountry.CountryLanguages[0].LanguageCode);
      sessionStorage.setItem('selectedCustomerTypeID', this.selectedUserType.ID);
      window.location.reload();
    } else {
      this.notificationService.error('error_', 'Country is not Selected !!');
    }
  }

  selectCustomerType(ID): void {
    if (ID) {
      this.selectedUserType = _.find(this.configService.commonSettings.CustomerTypes, (customerType) => {
        return (customerType.ID === parseInt(ID, 10));
      });
    }
  }

  changeLang(code): void {
    if (code) {
      this.selectedCountry = _.find(this.allowedCountries, (country) => {
        return country.CountryCode.trim().toLowerCase() === code.trim().toLowerCase();
      });
    }
  }
}
