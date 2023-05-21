import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import { ProductDialogComponent } from 'src/app/components/shop/products/product-dialog/product-dialog.component';
import { Cart1Service } from '../services/cart1.service';

@Component({
  selector: 'app-pack-carousel',
  templateUrl: './pack-carousel.component.html',
  styleUrls: ['./pack-carousel.component.scss']
})
export class PackCarouselComponent implements OnInit {
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();
  @Input('products') products: Array<any>;
  @Input('type') type: string;
  public config: SwiperConfigInterface = {};
  constructor(
    public configService: ConfigService,
    private dialog: MatDialog,
    public cart1Service: Cart1Service,
  ) { }

  ngOnInit() {
    this.config = {
      observer: true,
      slidesPerView: 3.1,
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
    this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
    });
  }

  // Add to cart
  public addToCart(product: any, type) {
    if (type == 'pack') {
      // enroll store id 4 in this base code case
      this.cart1Service.addToCart(product, true, '', false, false, true, true);
    } else if (type == 'autoship') {
      // autoship store id 5 in this base code case
      this.cart1Service.addToCart(product, true, '', true, false, false, true);
    } else if (type == 'order') {
      // initial order store id 2 in this base code case
      this.cart1Service.addToCart(product, true, '', false, false, false, true);
    }
  }
}
