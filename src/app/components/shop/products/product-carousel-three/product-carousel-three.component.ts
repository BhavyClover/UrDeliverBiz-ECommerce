import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CartService } from 'src/app/components/shared/services/cart.service';
import { ProductService } from 'src/app/components/shared/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductDialogComponent } from '../../products/product-dialog/product-dialog.component';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import { CompanyService } from 'src/app/components/shared/services/company.service';

@Component({
  selector: 'app-product-carousel-three',
  templateUrl: './product-carousel-three.component.html',
  styleUrls: ['./product-carousel-three.component.scss']
})
export class ProductCarouselThreeComponent implements OnInit {
  contentLoaded = false;
  @Output() onOpenProductDialog: EventEmitter<any> = new EventEmitter();

  @Input('product') product: any[] = [];
  public config: SwiperConfigInterface = {};

  constructor(public configService: ConfigService, private cartService: CartService, private productsService: ProductService, private dialog: MatDialog, private router: Router, public companyService: CompanyService) { }
  // @ViewChild(SwiperDirective) directiveRef: SwiperDirective;

  ngOnInit() {
    setTimeout(() => {
      this.contentLoaded = true;
    }, 3000);
  }

  // Add to cart
  public addToCart(product: any, quantity: number = 1) {
    this.cartService.addToCart(product, quantity);
  }

  public openProductDialog(product) {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(product => {
      if (product) {
        this.router.navigate(['/products', product.Id, product.Languages[0].ProductName]);
      }
    });
  }
  changeProductDetail(ItemID) {
    this.router.navigate(['/product', ItemID])
      .then(() => {
        window.location.reload();
      });
  }
}
