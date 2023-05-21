import { Component, OnInit } from '@angular/core';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { ConfigService } from '../services/config.service';
import { UserService } from '../services/user.service';
import $ from 'jquery';
import { AccountService } from '../services/account.service';


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  userServiceModal: UserServiceModal;

  constructor(public configService: ConfigService, public userService: UserService, public accountService: AccountService) {
    this.userServiceModal = this.userService.userServiceModal;
  }
  ngOnInit() {

    // document height when all expandables are closed is less than 1150 that is why docheight < 1150 is taken
    // scrollpercentrounded calculates the percentage of page scrolled example when scrollbar touches end it is 100%
    // max height of order summar box is 610 in this case so we have dynamically used to calculate bottomfooter variable
    // media height css is found in application css when page loads for the first time and no scroll event is given
    // we are giving 430 in case of bottomfooter less than 430 because there is no need for decreasing size of order box after bottom 430
    $(window).bind('scroll', (e) => {
      const scrollTop = $(window).scrollTop();
      const docHeight = $(document).height();
      const winHeight = $(window).height();
      const scrollPercent = (scrollTop) / (docHeight - winHeight);
      const scrollPercentRounded = Math.round(scrollPercent * 100);
      const bottomfooter = scrollPercentRounded * 610 / 100;

      if (docHeight <= 1150 && scrollPercentRounded <= 20) {
        $('#sideCartBox').css({ position: 'fixed', right: '25px', top: '200px', bottom: bottomfooter + 150, left: 'inherit', 'max-height': '610px', 'box-shadow': 'inherit' });
      }
      else if (docHeight > 1150 && scrollPercentRounded <= 20) {
        $('#sideCartBox').css({ position: 'fixed', right: '25px', top: '200px', bottom: bottomfooter < 430 && docHeight > 1150 ? bottomfooter : bottomfooter < 430 && docHeight < 1150 && (bottomfooter + 100) < 430 ? bottomfooter + 100 : '430px', left: 'inherit', 'max-height': '610px', 'box-shadow': 'inherit' });
      }
      else if (scrollPercentRounded > 20) {
        $('#sideCartBox').css({ position: 'fixed', right: '25px', top: '0px', bottom: bottomfooter < 430 && docHeight > 1150 ? bottomfooter : bottomfooter < 430 && docHeight < 1150 && (bottomfooter + 100) < 430 ? bottomfooter + 100 : '430px', left: 'inherit', 'max-height': '610px', 'box-shadow': 'inherit' });
      }
      else if (scrollPercentRounded >= 35) {
        $('#sideCartBox').css({ position: 'fixed', right: '25px', top: '0px', bottom: bottomfooter < 430 && docHeight > 1150 ? bottomfooter : bottomfooter < 430 && docHeight < 1150 && (bottomfooter + 100) < 430 ? bottomfooter + 100 : '430px', left: 'inherit', 'max-height': '610px', 'box-shadow': 'inherit' });
      } else {
        $('#sideCartBox').css({ position: 'fixed', right: '25px', top: '200px', bottom: 'inherit', left: 'inherit', 'max-height': '610px', 'box-shadow': 'inherit' });
      }
    });
  }
  isLoggedIn() {
    if ((Object.keys(this.userServiceModal.customerData).length) && (this.userServiceModal.customerData.CustomerId) && this.userService.checkIfUserAuthenticatedOrNot()) {
      return true;
    } else {
      return false;
    }
  }

  logoutHandler() {
    this.accountService.logout();
  }
}
