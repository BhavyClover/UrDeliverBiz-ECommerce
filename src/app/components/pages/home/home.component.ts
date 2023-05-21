import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    public translate: TranslateService,
    private titleService: Title
  ) {}
  ngOnInit() {
    this.translate.get("global_Company_Title").subscribe((text: string) => {
      this.titleService.setTitle(
        this.translate.instant("pagetitle_home") + " | " + text
      );
    });
  }
}
