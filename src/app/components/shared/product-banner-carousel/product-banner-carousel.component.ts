import { Component, Input } from '@angular/core';
import { SwiperConfigInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper';

@Component({
  selector: 'app-product-banner-carousel',
  templateUrl: './product-banner-carousel.component.html',
  styleUrls: ['./product-banner-carousel.component.scss']
})
export class ProductBannerCarouselComponent {
  @Input('slides') slides: Array<any> = [];
  public config: SwiperConfigInterface = {};
  private pagination: SwiperPaginationInterface = {
    el: '.swiper-pagination',
    clickable: true
  };
}
