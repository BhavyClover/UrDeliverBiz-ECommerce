import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})
export class BannersComponent implements OnInit {

  @Input('banners') banners: Array<any> = [];
  contentLoaded = false;
  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.contentLoaded = true;
    }, 3000);
  }

  public getBanner(index) {
    return this.banners[index];
  }

  public getBgImage(index) {
    const bgImage = {
      'background-image': index != null ? 'url(' + this.banners[index].image + ')' : 'url(https://via.placeholder.com/600x400/ff0000/fff/)'
    };
    return bgImage;
  }
}
