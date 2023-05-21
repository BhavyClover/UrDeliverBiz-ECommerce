import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductsComponent } from './products/products.component';
import { ProductComponent } from './products/product/product.component';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { CommonModule } from '@angular/common';
import { ShopRoutingModule } from './shop-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ProductNoSidebarComponent } from './products/product-no-sidebar/product-no-sidebar.component';
import { ProductCarouselThreeComponent } from './products/product-carousel-three/product-carousel-three.component';
import { ProductCarouselComponent } from './products/product-carousel/product-carousel.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TranslateModule } from '@ngx-translate/core';
import { ProductBannerCarouselComponent } from '../shared/product-banner-carousel/product-banner-carousel.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  declarations: [
    ProductsComponent,
    ProductComponent,
    ProductDetailsComponent,
    ProductNoSidebarComponent,
    ProductCarouselThreeComponent,
    ProductCarouselComponent,
    ProductBannerCarouselComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ShopRoutingModule,
    SharedModule,
    SwiperModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    NgxPaginationModule,
    NgxSkeletonLoaderModule,
    TranslateModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    NgxImageZoomModule    // <-- Add this line
  ],
  exports: [
  ],

  entryComponents: [
  ],
})

export class ShopModule { }
