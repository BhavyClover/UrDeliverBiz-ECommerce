import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../shared/services/company.service';
import { ConfigService } from '../../shared/services/config.service';
import { NotificationService } from '../../shared/services/notification.service';
import { RestApiService } from '../../shared/services/restapi.service';

@Component({
  selector: 'app-order-invoice',
  templateUrl: './order-invoice.component.html',
  styleUrls: ['./order-invoice.component.scss']
})
export class OrderInvoiceComponent implements OnInit {
  modelData: any;
  Warning: any = {};
  GetOrderDetails: any = [];
  IsDialogMax: boolean = false;
  hostHeight: any;
  hostWidth: any;
  public OrderData: any = {};
  constructor(
    private titleService: Title,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matDialogRef: MatDialogRef<OrderInvoiceComponent>,
    public config: ConfigService,
    public apiService: RestApiService, public notificationService: NotificationService,
    public companyService: CompanyService
  ) {
    this.modelData = data;
    this.getOrderDetail();
  }

  ngOnInit(): void {
    this.translate.get('global_Company_Title').subscribe((text: string) => {
      this.titleService.setTitle(this.translate.instant('pagetitle_order_history') + ' | ' + text);
    });
  }
  getOrderDetail() {
    this.apiService.getOrder(this.modelData.OrderNumber).subscribe((result) => {
      try {
        if (parseInt(result.Status, 10) === 0) {
          this.OrderData = result.Data.OrderInfo;
          this.OrderData.OrderDate = this.OrderData.OrderDate.split('+')[0];
        } else {
          this.notificationService.error('error_', result.ErrorDescription);
        }
      } catch (ex) {
        this.notificationService.error('error_', 'error_occured_try_again');
      }
    });
  }
}
