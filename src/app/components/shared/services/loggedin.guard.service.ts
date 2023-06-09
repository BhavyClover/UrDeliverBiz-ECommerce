import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class LoggedInAuthGuard implements CanActivate {

    constructor(private cookieService: CookieService, private router: Router) { }

    canActivate(): boolean {
        if (this.cookieService.get('X-Auth')) {
            this.router.navigate(['/home']);
            return false;
        } else {
            return true;
        }
    }
}
