import { AfterViewInit, Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { noop as _noop } from 'lodash';
import { Observable } from 'rxjs/internal/Observable';
import { map, startWith } from 'rxjs/operators';
import { OrderHistoryResult } from 'src/app/modals/orderhistory.modal';
import { CompanyService } from '../../shared/services/company.service';
import { NotificationService } from '../../shared/services/notification.service';
import { RestApiService } from '../../shared/services/restapi.service';
import { UserService } from '../../shared/services/user.service';
import { OrderInvoiceComponent } from '../order-invoice/order-invoice.component';


@Component({
    selector: 'app-order-history',
    templateUrl: './order-history.component.html',
    styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit, AfterViewInit, OnChanges {


    constructor(private titleService: Title, public dialog: MatDialog, public apiService: RestApiService, public translate: TranslateService, public notificationService: NotificationService, public userService: UserService, public companyService: CompanyService) {

    }
    displayedColumns: string[] = ['Status', 'TotalQV', 'TotalCV', 'OrderTotal', 'OrderNumberS', 'OrderDate', 'OrderNumber', 'TrackingNumber', 'TotalBonus'];
    dataSource = new MatTableDataSource(new OrderHistoryResult().Data);

    @ViewChild(MatPaginator, { static: false })
    set paginator(value: MatPaginator) {
        this.dataSource.paginator = value;
    }

    @ViewChild(MatSort, { static: false })
    set sort(value: MatSort) {
        this.dataSource.sort = value;
    }
    myControl = new FormControl();
    options: string[] = [];
    filteredOptions: Observable<string[]>;
    itemCount: number = 0;
    ngOnInit() {
        this.translate.get('global_Company_Title').subscribe((text: string) => {
            this.titleService.setTitle(this.translate.instant('pagetitle_order_history') + ' | ' + text);
        });
        this.filteredOptions = this.myControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value))
            );

        this.initOrders();
    }
    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }
    /**
     * @hidden
     */
    /**
     * Lifecycle hook that is called when any data-bound property of a datasource changes.
     */
    ngOnChanges() {
        this.apiService.getCustomerOrders().subscribe((data: OrderHistoryResult) => {
            this.dataSource = new MatTableDataSource(data.Data);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        }, (err) => {
            // Do stuff whith your error

        }, () => {

        });
    }

    initOrders() {

        this.apiService.getCustomerOrders().subscribe((data: OrderHistoryResult) => {
            this.dataSource = new MatTableDataSource(data.Data);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.itemCount = data.Data.length;
        }, (err) => {
            // Do stuff whith your error

        }, () => {

        });

    }
    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
    viewOrderInvoice(dialogData): void {

        const dialogRef = this.dialog.open(OrderInvoiceComponent, {
            width: '90vw',
            maxWidth: '90vw',
            panelClass: 'invoiceDialog',
            data: dialogData,
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(dialogResult => {
            const result = dialogResult;
        });
    }

}
