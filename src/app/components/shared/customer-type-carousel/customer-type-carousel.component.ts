import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/components/shared/services/cart.service';
import { ProductService } from 'src/app/components/shared/services/product.service';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import { ProductDialogComponent } from 'src/app/components/shop/products/product-dialog/product-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import $ from 'jquery';
import { ConfirmDialogComponent } from '../model/confirm-dialog/confirm-dialog.component';
import { UserService } from '../services/user.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { Cart1Service } from '../services/cart1.service';
@Component({
  selector: 'app-customer-type-carousel',
  templateUrl: './customer-type-carousel.component.html',
  styleUrls: ['./customer-type-carousel.component.scss']
})
export class CustomerTypeCarouselComponent implements AfterViewInit {
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();
  @Input('customerTypes') customerTypes: Array<any> = [];
  @Input('typeSelected') typeSelected: any;
  userService: UserServiceModal;
  public config: SwiperConfigInterface = {};
  scrollPosition: any;
  scrollDuration: any;
  paddleMargin: any;
  constructor(
    public configService: ConfigService,
    private dialog: MatDialog,
    private router: Router,
    private cartService: CartService,
    private cart1Service: Cart1Service,
    private productService: ProductService,
    public translate: TranslateService,
    public user: UserService,
    public activatedRoute: ActivatedRoute
  ) {
    this.userService = user.userServiceModal;
  }
  ngAfterViewInit() {
    this.config = {
      observer: true,
      slidesPerView: 2,
      spaceBetween: 16,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 1
        },
        740: {
          slidesPerView: 2,
        },
        960: {
          slidesPerView: 3,
        },
        1280: {
          slidesPerView: 4,
        },


      }
    };
  }


  public openProductDialog(product) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(products => {
      if (products) {
        this.router.navigate(['/products', product.id, product.name]);
      }
    });
  }

  // Add to cart
  public addToCart(product: any, quantity: number = 1) {
    this.cartService.addToCart(product, quantity);
  }
  haveScroll() {
    const menuInvisibleSize = this.getMenuSize() - $('.user-types').outerWidth() - this.paddleMargin;
    if (menuInvisibleSize <= 0) {
      return false;
    }
    return true;
  }
  setScrollPosition() {
    if ($('#status-user-type-' + this.typeSelected) && $('#status-user-type-' + this.typeSelected).position()) {
      this.scrollPosition = $('#status-user-type-' + this.typeSelected).position().left;
      $('.user-types').animate({ scrollLeft: this.scrollPosition }, this.scrollDuration);
    }
  }
  slideSectionRight() {
    this.scrollPosition += 250;
    const scrollSize = $('.user-type').length * $('.user-type').outerWidth(true);
    if (this.scrollPosition > scrollSize) {
      this.scrollPosition = scrollSize;
    }
    $('.user-types').animate({ scrollLeft: this.scrollPosition }, this.scrollDuration);
  }
  getMenuSize() {
    return $('.user-type').length * $('.user-type').outerWidth(true) - 10;
  }

  selectType(type) {
    if (type == this.typeSelected) {
      sessionStorage.setItem('customerSelected', 'true');
      return;
    }

    const dialogRef1 = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('update_customer_title'),
        message: this.translate.instant('update_customer_text'),
        takeaction: this.translate.instant('YES'),
        noaction: this.translate.instant('NO'),
      },
      disableClose: true,
      panelClass: '',
      autoFocus: false
    });
    dialogRef1.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        this.typeSelected = type;
        sessionStorage.setItem('customerSelected', 'true');
        if (this.typeSelected != '0') {
          sessionStorage.setItem('selectedCustomerTypeID', this.typeSelected);
          this.userService.customerTypeID = this.typeSelected;
        } else {
          this.typeSelected = 2;
        }
        this.router.navigate(['/join'],
          {
            relativeTo: this.activatedRoute,
            queryParams: { type: this.typeSelected },
            queryParamsHandling: 'merge'
          }).then(() => { window.location.reload(); });
        this.cart1Service.clearCart();
      }
    });
  }
  collapseSection(type) {
    if (type == this.typeSelected) {
      this.userService.sponsorSectionPanel = false;
    }
  }

}





