import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { getBaseLocation } from 'src/app/baseUrl';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { RestApiService } from '../../services/restapi.service';
import { UserService } from '../../services/user.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-find-enroller',
    templateUrl: './findenroller.component.html',
    styleUrls: ['./findenroller.component.scss']
})
export class FindEnrollerComponent implements OnInit {
    public isButtonEnable: boolean = false;
    public selection = new SelectionModel<any>(false, []);
    public SelectedSponsor: any = {};
    userService: UserServiceModal;
    searchText: string = '';
    result: string = '';
    itemCount: number = 0;
    constructor(public configService: ConfigService, public dialog: MatDialog, public apiService: RestApiService, public translate: TranslateService, public notificationService: NotificationService, public user: UserService, private route: ActivatedRoute) {
        this.selection.changed.subscribe(item => {
            this.isButtonEnable = this.selection.selected.length == 0;
        });
        this.userService = user.userServiceModal;
    }
    displayedColumns: string[] = ['SelectEnroller', 'ProfileImageUrl', 'FirstName', 'LastName', 'BackOfficeId', 'EMail', 'Phone'];
    dataSource = new MatTableDataSource([]);
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    myControl = new FormControl();
    options: string[] = [];
    filteredOptions: Observable<string[]>;

    ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value))
            );
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    searchEnroller(searchText: string) {
        const req = {
            includeWebAliases: true,
            searchTerm: searchText
        };
        this.apiService.searchAssociate(req).subscribe((data) => {
            let filterData = [];
            if (data.Data && data.Data.length) {
                filterData = _.filter(data.Data, (data) => {
                    return data.AssociateTypeId != 2;
                }
                );
            }
            this.dataSource = new MatTableDataSource(filterData);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.itemCount = filterData.length;
        },
            err => {
                // Do stuff whith your error
            },
            () => {
            });
    }
    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
    singleSelection($event, dataSource) {
        const numSelected = this.selection.selected.length;
        numSelected <= 0 ? this.isButtonEnable = false : this.isButtonEnable = true;
        if ($event.checked) {
            this.SelectedSponsor = dataSource;
        }
    }
    setSponsor() {
        if (this.SelectedSponsor && this.SelectedSponsor.CustomerId && this.SelectedSponsor.WebAliases && this.SelectedSponsor.WebAliases.length > 0) {
            const baseurl = getBaseLocation();
            sessionStorage.setItem('enrollerSet', 'true');
            this.route.queryParams.subscribe((params) => {
                if (Object.keys(params).length === 0) {
                    location.href = (location.href.replace(baseurl, ('/' + this.SelectedSponsor.WebAliases[0])));
                } else {
                    this.userService.WebAlias = this.SelectedSponsor.WebAliases[0];
                    localStorage.setItem('userService', JSON.stringify(this.userService));
                    location.href = (location.href.replace(baseurl, ('/' + this.SelectedSponsor.WebAliases[0])));
                }
            });
        } else {
            this.notificationService.error('error_', 'webalias_not_exists');
            return false;
        }
    }
    confirmDialog(): void {
        const message = `Are you sure you want to do this?`;

        const dialogData = new ConfirmDialogModel('Confirm Action', message);

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '400px',
            data: dialogData,
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(dialogResult => {
            this.result = dialogResult;
        });
    }
}
