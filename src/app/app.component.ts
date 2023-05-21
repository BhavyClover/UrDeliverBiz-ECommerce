import { ApplicationInitStatus, APP_INITIALIZER, Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from './components/shared/services/config.service';
import { UserService } from './components/shared/services/user.service';
import { PersistentService } from './components/shared/services/persistent.service';
import { MatDialog } from '@angular/material/dialog';
import { MarketSelectorComponent } from './components/shared/model/market-selector/market-selector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(APP_INITIALIZER) public appInit: ApplicationInitStatus,
    public configService: ConfigService,
    public router: Router,
    private translate: TranslateService,
    public userService: UserService,
    public persistent: PersistentService,
    private dialog: MatDialog,
  ) {
    if (sessionStorage.getItem('language')) {
      translate.setDefaultLang(sessionStorage.getItem('language'));
      translate.use(sessionStorage.getItem('language'));
    } else {
      translate.setDefaultLang('en');
      translate.use('en');
    }
  }
  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    localStorage.setItem('userService', JSON.stringify(this.userService.userServiceModal));
    localStorage.setItem('retailData', JSON.stringify(this.persistent.retailData));
  }

  ngOnInit() {
        // show market selector according to page
        // this.router.events.subscribe((event:RouterEvent) => 
        // {
        //    if(event.url == '/join'){
        //      this.showMarketSelector();
        //    }
        // });

        this.userService.userServiceModal.customerTypeID = 1;
        sessionStorage.setItem('selectedCountry', this.configService.commonData.selectedCountry || 'US');
        sessionStorage.setItem('selectedLanguageCode', this.configService.commonData.selectedLanguage || 'EN');
        sessionStorage.setItem('selectedCustomerTypeID', '1');
  }
  showMarketSelector() {
    if (!(sessionStorage.getItem('IsMarketCountrySelected') === 'true')) {
      const dialogRef = this.dialog.open(MarketSelectorComponent, {
        maxWidth: '400px',
        data: {},
        panelClass: 'marketselector-dialog-container',
        disableClose: true,
        autoFocus: false

      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        const result = dialogResult;
      });
    }
  }
}
