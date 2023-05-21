import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { ContactComponent } from '../model/contact/contact.component';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { UserService } from '../services/user.service';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public categoriesList: any;
  public categoriesItemList: any;
  userServiceModal: UserServiceModal;

  constructor(
    public dialog: MatDialog,
    public productService: ProductService,
    public router: Router,
    public userService: UserService
  ) {
    this.userServiceModal = this.userService.userServiceModal;
    if (this.productService.allItems) {
      this.categoriesItemList = _.groupBy(this.productService.allItems, 'CategoryId');
      const unique = _.uniqBy(this.productService.allItems, x => x['CategoryId']);
      this.categoriesList = _.map(unique, (object) => {
        return _.pick(object, ['CategoryId', 'Category']);
      });
    } else {
      this.productService.getProductByCategory('all').subscribe(products => {
        this.categoriesItemList = _.groupBy(products, 'CategoryId');
        const unique = _.uniqBy(products, x => x.CategoryId);
        this.categoriesList = _.map(unique, (object) => {
          return _.pick(object, ['CategoryId', 'Category']);
        });
      });
    }
  }
  ngOnInit() {
  }
  openMegaMenu() {
    const pane = document.getElementsByClassName('cdk-overlay-pane');
    [].forEach.call(pane, (el) => {
      if (el.children.length > 0) {
        if (el.children[0].classList.contains('mega-menu')) {
          el.classList.add('mega-menu-pane');
        }
      }
    });
  }
  navigateToContact() {
    this.dialog.open(ContactComponent, {
      data: {},
      disableClose: true,
      panelClass: 'contact-dialog',
      autoFocus: false
    });
  }

  navigateProductDetails(id) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/product', id]);
    });
  }
  isLoggedIn() {
    if ((Object.keys(this.userServiceModal.customerData).length) && (this.userServiceModal.customerData.CustomerId) && this.userService.checkIfUserAuthenticatedOrNot()) {
      return true;
    } else {
      return false;
    }
  }
}
