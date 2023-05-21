import { BrowserModule, Title } from '@angular/platform-browser';
import { APP_INITIALIZER, Injectable, NgModule } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule, HttpHeaders, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DefaultUrlSerializer, Router, UrlSerializer, UrlTree } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { AppRoutingModule } from './app-routing.module';
import { ShopModule } from './components/shop/shop.module';
import { SharedModule } from './components/shared/shared.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MyLoaderComponent } from './components/my-loader/my-loader.component';
import { LoaderService } from './components/shared/services/loader.service';
import { LoaderInterceptor } from './components/shared/services/interceptors/loader-interceptor.service';
import { ConfigService } from './components/shared/services/config.service';
import { environment } from 'src/environments/environment';
import { PagesModule } from './components/pages/pages.module';
import { PersistentService } from './components/shared/services/persistent.service';
import { ApiInterceptor } from './components/shared/services/interceptors/http-interceptor.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthGuard } from './components/shared/services/auth.guard.service';
import { LoggedInAuthGuard } from './components/shared/services/loggedin.guard.service';
import { APP_BASE_HREF } from '@angular/common';
import { getBaseLocation } from './baseUrl';
import { CommonSetting } from './modals/commonsetting.modal';

const initializeConfig = (configService: ConfigService, http: HttpClient) => {
  // promise 2
  const promise2 = new Promise((resolve, reject) => {
    let subdomain = getBaseLocation();
    if (!subdomain) {
      console.log('error', 'subdomain not found try again')
    } else {
      subdomain = subdomain.replace('/', '');
    }
    // get web info api call
    http.get(`${environment.apiUrl}api/Customers/GetWebsiteInformation_V1?webAlias=${subdomain}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      }),
      withCredentials: true
    }).subscribe((result: any) => {
      if (result.Data) {
        configService.setWebsiteInfo(result.Data);
        resolve(result.Data);
      } else {
         reject('WebAlias information not found !!');
      }
    },
      (error) => {
        console.log(error);
        reject('WebAlias information not found !!');
      });

  });

  // promise 1
  const promise1 = new Promise((resolve, reject) => {
    http.get(`assets/data/clientsetting.json`,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=utf-8'
        }),
        withCredentials: true
      }).toPromise()
      .then(async (result: CommonSetting) => {
        sessionStorage.setItem('CommonSettings', JSON.stringify(result));
        await configService.init(result);
        http.get<any>(`assets/data/localconfig.json`, {
          headers: new HttpHeaders({
            'Content-Type': 'application/json; charset=utf-8'
          })
        }).subscribe((data) => {
          configService.localSettings = data;
          resolve(result);
        }, (error) => {
          reject(error);
        });
      });

  });


  return async () => {
    const res = await Promise.all([promise1]);
    return res;
  };

};

@Injectable()
export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): any {
    if (params.interpolateParams) {
      return params.interpolateParams['Default'] || params.key;
    }
    return params.key;
  }

  constructor() { }
}

@Injectable()
export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
  parse(url: string): UrlTree {

    return super.parse(url.toLowerCase());
  }
}
@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    // ColorOptionsComponent,
    MyLoaderComponent
  ],
  imports: [
    NgxSpinnerModule,
    BrowserModule,
    SharedModule,
    ShopModule,
    PagesModule,
    NgxSkeletonLoaderModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxImageZoomModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler
        // deps: [NotTranslatedService]
      }
    })
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseLocation
    },
    ConfigService,
    { provide: APP_INITIALIZER, useFactory: initializeConfig, deps: [ConfigService, HttpClient, MatDialog], multi: true },
    {
      provide: UrlSerializer,
      useClass: LowerCaseUrlSerializer
    },
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    Title,
    PersistentService,
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: function (router: Router, cookieService: CookieService) {
        return new ApiInterceptor(router, cookieService);
      },
      multi: true,
      deps: [Router, CookieService]
    },
    AuthGuard,
    LoggedInAuthGuard
  ],
  exports: [
    MatDialogModule
  ],
  bootstrap: [AppComponent],

})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
