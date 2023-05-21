import { Component, OnInit, HostBinding, Input, Output, EventEmitter } from '@angular/core';
import { SidebarMenuService } from './sidebar-menu.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SidenavMenu } from './sidebar-menu.model';
import { Router } from '@angular/router';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { UserService } from '../services/user.service';
import { AccountService } from '../services/account.service';
import { ProductService } from '../services/product.service';
import { RestApiService } from '../services/restapi.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class SidebarComponent implements OnInit {
  expanded: boolean;
  // @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: SidenavMenu;
  @Input() depth: number;
  @Output() close = new EventEmitter<string>();
  @Input() children: any;
  userServiceModal: UserServiceModal;
  constructor(private sidenavMenuService: SidebarMenuService, public router: Router, public userService: UserService, public accountService: AccountService, public productService: ProductService,public apiservice:RestApiService) {
    this.userServiceModal = this.userService.userServiceModal;
    if (this.depth === undefined) {
      this.depth = 0;
    }
  }

  ngOnInit() {
    this.sidenavMenuService.currentUrl.subscribe((url: string) => {
      if (this.item.route && url) {
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        // this.ariaExpanded = this.expanded;
      }
    });
  }
  onItemSelected(item: SidenavMenu) {
    if (!item.children || !item.children.length) {
      item.displayName == 'Join' ? this.router.navigate(['/join']) : this.router.navigate([item.route]);
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
  }

  closeDialog(item) {
    this.close.emit('1');
  }
  isLoggedIn() {
    if ((Object.keys(this.userServiceModal.customerData).length) && (this.userServiceModal.customerData.CustomerId) && this.userService.checkIfUserAuthenticatedOrNot()) {
      return true;
    } else {
      return false;
    }
  }
  logoutHandler(item) {
    if (item == 'Log Out') {
      this.accountService.logout();
    }
  }
  office(){
    let windowReference = window.open();
    let request = {
      CustomerID: this.userServiceModal.customerData.CustomerId,
      Dest: 'home'
    }
    this.apiservice.getCustomerSSOURL(request).subscribe((result) => {
      windowReference.location = result.Data
    })
  }
}
