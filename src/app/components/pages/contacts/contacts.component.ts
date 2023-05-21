import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/notification.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UserService } from '../../shared/services/user.service';
import $ from 'jquery';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactComponent implements OnInit {
  captchaError = true;
  contact: any = {};
  public a: number;
  captchaRequired: boolean = false;
  public userService: any = {};
  public b: number;
  constructor(
    private domSanitizer: DomSanitizer, public apiService: RestApiService, public notificationService: NotificationService, private titleService: Title, public translate: TranslateService, public user: UserService
  ) {

  }

  ngOnInit() {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle('ContactUS' + ' | ' + text);
    });
    this.getCustomerSite();
  }

  getRandom(reloadCaptcha) {
    if (reloadCaptcha) {
      $('#answer').val(null);
      this.captchaRequired = true;
      this.captchaError = true;
    }
    const numbers = new Array();
    for (let i = 1; i < 100; i++) {
      numbers.push(i);
    }
    this.a = numbers[Math.floor(Math.random() * numbers.length)];
    this.b = numbers[Math.floor(Math.random() * numbers.length)];
    setTimeout(() => {
      if (document.getElementById('captchaQuestion')) {

        document.getElementById('captchaQuestion').innerHTML = this.a + '+' + this.b;
      }
    }, 1000);


  }
  checkCaptch() {

    if (Number(this.contact.result) == (Number(this.a) + Number(this.b))) {
      this.captchaError = true;
    } else {
      if (this.contact.result == '') {
        this.captchaError = true;
      } else {
        this.captchaError = false;
      }
    }
  }
  getCustomerSite() {
    const req = this.user.userServiceModal.WebAlias || this.user.userServiceModal.enrollerInfo.WebAlias;
    this.apiService.getWebsiteInformation(req).subscribe((result) => {
      try {
        if ((Number(result.Status) === 0) && result.Data) {
          this.userService = result.Data;
          this.getRandom(false);
        }
      } catch (ex) {

      }
    });
  }
  contactUser() {
    if (this.captchaError) {
      const request = {
        NewProspect: {
          ID: 0,
          AssociateID: 0,
          Rating: 0,
          StageID: 0,
          BackOfficeID: '',
          FirstName: this.contact.FirstName,
          LastName: this.contact.LastName,
          Email: this.contact.Email,
          MobilePhone: this.contact.MobilePhone,
          HomePhone: '',
          WorkPhone: '',
          Address: '',
          City: '',
          State: '',
          Country: '',
          Zip: '',
          Notes: this.contact.Message,
          ImgUrl: '',
          CreatedDate: '',
          LastUpdatedDate: ''
        },
        CommandKey: ''
      };
      this.apiService.createProspect(request).subscribe((result) => {
        if (result) {
          this.contact = {};
          this.notificationService.success('Success', this.translate.instant('contact_info_added'));

        } else {
          this.notificationService.error('Error', this.translate.instant('some_error_occur_try_again'));
        }
      });
    } else {
      this.notificationService.error('Error', this.translate.instant('Please enter valid captcha'));
    }
  }
  trustHtml(html) {
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }
}
