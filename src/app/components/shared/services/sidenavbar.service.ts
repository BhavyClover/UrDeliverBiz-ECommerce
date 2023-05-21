

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';


@Injectable({
    providedIn: 'root'
})
export class SideNavBarService {

    public showsideBarSummary: boolean = false;
    constructor() {
    }

    public triggerOpen(): void{
        this.showsideBarSummary = !this.showsideBarSummary;
    }

    public closeSidePanel(): void{
        this.showsideBarSummary = false;
    }
}
