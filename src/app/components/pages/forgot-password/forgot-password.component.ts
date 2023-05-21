import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../shared/services/notification.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPasswordData: any = {
    userName: ''
  };
  public loadingDetails: boolean = true;
  public forgotpasswordtype: string = '';
  public forgotPasswordOptions: any = [
    { option: 1, description: 'resetpassword_option_username' },
    { option: 2, description: 'resetpassword_option_email' },
    { option: 3, description: 'resetpassword_option_customerid' }
  ];
  public selectedForgotPasswordOption: any = {
    option: 1
  };
  public sentEmail: boolean = false;
  constructor(
    private titleService: Title,
    public translate: TranslateService,
    public notificationService: NotificationService,
    public apiServie: RestApiService,
    public userService: UserService) { }

  ngOnInit(): void {

    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_forgotpassword') + ' | ' + text);
    });
  }


  // /**
  //  * @ngdoc method
  //  * @name emailSentForgotPassword
  //  * @description method to send forget password link
  //  */
  emailSentForgotPassword() {
    this.loadingDetails = true;
    this.forgotpasswordtype = this.selectedForgotPasswordOption.option;
    if (this.forgotPasswordData.userName && this.selectedForgotPasswordOption.option) {
      if (this.selectedForgotPasswordOption.option == 1) {
        this.forgotpasswordtype = 'username'; // 'username';
      } else if (this.selectedForgotPasswordOption.option == 2) {
        this.forgotpasswordtype = 'email'; // 'email';
      } else if (this.selectedForgotPasswordOption.option == 3) {
        this.forgotpasswordtype = 'customerid'; // 'customerid';
      }
      const forgotPasswordRequest = {
        value: this.forgotPasswordData.userName,
        valType: this.forgotpasswordtype
      };
      this.apiServie.triggerForgotPasswordProcess(forgotPasswordRequest).subscribe(() => {
        this.loadingDetails = false;
        this.forgotPasswordData.userName = '';
        this.sentEmail = true;
      }, (error) => {
        this.loadingDetails = false;
      }, () => {
      });
    } else {
      this.loadingDetails = false;
      this.notificationService.error('Error', 'choose_one_option');
      return;
    }
  }
}
