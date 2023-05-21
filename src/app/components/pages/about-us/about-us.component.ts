import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(public translate: TranslateService, private titleService: Title) { }

  ngOnInit() {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle('AboutUs' + ' | ' + text);
    });
  }
}
