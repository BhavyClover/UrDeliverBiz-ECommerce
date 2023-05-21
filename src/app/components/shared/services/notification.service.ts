import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(
        private readonly snackBar: MatSnackBar,
        public dialog: MatDialog,
        private translate: TranslateService
    ) { }
    public service = {};
    /*
* Notification
* @method  Notification
* @param {string}  title    Notification title
* @param {string}  message  Notification message
* @param {string}  type    Notification type
* @param {string}  from     Notification position
* @param {string}  align    Notification alignment
* @param {object}  icon  Notification icon
* @param {boolean}  animIn    Notification animation in
* @param {boolean}  animOut     Notification animation out
* @param {number}  delay    Notification delay
*/

    private showSnackBar(title, message, className, from, align, icon, animIn, animOut, delay): void {
        this.openSnackBar(message, 'X', className, delay);

    }
    openSnackBar(
        message: string,
        action: string,
        className = '',
        duration = 1500
    ) {
        this.snackBar.open(this.translate.instant(message), action, {
            duration: duration,
            verticalPosition: 'top',
            horizontalPosition: 'right',
            panelClass: [className]
        });
    }

    /*
* Success Notification
* @method  success
* @param {string}  title    Notification title
* @param {string}  message  Notification message
* @param {string}  type    Notification type
* @param {string}  from     Notification position
* @param {string}  align    Notification alignment
* @param {object}  icon  Notification icon
* @param {boolean}  animIn    Notification animation in
* @param {boolean}  animOut     Notification animation out
* @param {number}  delay    Notification delay
*/
    public success(title: string, message: string, from?: string, align?: string, icon?: string, animIn?: string, animOut?: string, delay?: number) {
        this.showSnackBar(title, message, 'success', from, align, icon, animIn, animOut, delay);
    }
    /*
* Error Notification
* @method  error
* @param {string}  title    Notification title
* @param {string}  message  Notification message
* @param {string}  type    Notification type
* @param {string}  from     Notification position
* @param {string}  align    Notification alignment
* @param {object}  icon  Notification icon
* @param {boolean}  animIn    Notification animation in
* @param {boolean}  animOut     Notification animation out
* @param {number}  delay    Notification delay
*/
    public error(title: string, message: string, from?: string, align?: string, icon?: string, animIn?: string, animOut?: string, delay?: number) {
        this.showSnackBar(title, message, 'error', from, align, icon, animIn, animOut, delay);
    }
    /*
* Warning Notification
* @method  warning
* @param {string}  title    Notification title
* @param {string}  message  Notification message
* @param {string}  type    Notification type
* @param {string}  from     Notification position
* @param {string}  align    Notification alignment
* @param {object}  icon  Notification icon
* @param {boolean}  animIn    Notification animation in
* @param {boolean}  animOut     Notification animation out
* @param {number}  delay    Notification delay
*/
    public warning(title, message, from?: string, align?: string, icon?: string, animIn?: string, animOut?: string, delay?: number) {
        this.showSnackBar(title, message, 'warning', from, align, icon, animIn, animOut, delay);
    }
    /*
* Info Notification
* @method  info
* @param {string}  title    Notification title
* @param {string}  message  Notification message
* @param {string}  type    Notification type
* @param {string}  from     Notification position
* @param {string}  align    Notification alignment
* @param {object}  icon  Notification icon
* @param {boolean}  animIn    Notification animation in
* @param {boolean}  animOut     Notification animation out
* @param {number}  delay    Notification delay
*/
    public info(title: string, message: string, from?: string, align?: string, icon?: string, animIn?: string, animOut?: string, delay?: number) {
        this.showSnackBar(title, message, 'info', from, align, icon, animIn, animOut, delay);
    }
}
