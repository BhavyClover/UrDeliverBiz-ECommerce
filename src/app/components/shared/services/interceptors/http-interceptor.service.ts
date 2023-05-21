// loader-interceptor.service.ts
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { tap } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];
    constructor(public router: Router, public cookieService: CookieService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(tap(() => {}, (err) => {
            if (err instanceof HttpErrorResponse) {
                if (Number(err.status) === 401) {
                    this.router.navigate(['/login']).then(() => {
                        localStorage.removeItem('user');
                        this.cookieService.deleteAll('/');
                        sessionStorage.clear();
                        localStorage.clear();
                        window.location.reload();
                    });
                }else{
                    return;
                }
            }
        }));
    }
}
