import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import $ from 'jquery';
import { NotificationService } from '../../services/notification.service';
import { RestApiService } from '../../services/restapi.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  captchaError = true;
  contact: any = {};
  public a: number;
  captchaRequired: boolean = false;
  public userService: any = {};
  public b: number;
  constructor(private domSanitizer: DomSanitizer, public apiService: RestApiService, public notificationService: NotificationService, private titleService: Title, public translate: TranslateService, public user: UserService) {
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
      document.getElementById('captchaQuestion').innerHTML = this.a + '+' + this.b;
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
        FirstName: this.contact.FirstName,
        LastName: this.contact.LastName,
        CustomerId: this.userService.enrollerInfo.CustomerId,
        MobilePhone: this.contact.MobilePhone,
        Email: this.contact.Email,
        Notes: this.contact.Message
      };
      this.apiService.createProspect(request).subscribe((result) => {
        if (result && result.status == 200) {
          this.contact = {};
          setTimeout(() => {
            $('#closePop').trigger('click');
          }, 1000);
          $('#answer').val(null);
          this.notificationService.success('Success', this.translate.instant('contact_info_added'));

        } else {
          this.notificationService.error('Error', this.translate.instant('some_error_occur_try_again'));
        }
      });
    }
  }
  trustHtml(html) {
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }
}
