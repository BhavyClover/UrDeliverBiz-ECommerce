import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  constructor(private titleService: Title, public translate: TranslateService) { }

  ngOnInit() {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle('FAQ' + ' | ' + text);
    });
  }

}
