import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutComponent } from './checkout/checkout.component';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { FaqComponent } from './faq/faq.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TranslateModule } from '@ngx-translate/core';
import { SignupComponent } from 'src/app/components/pages/signup/signup.component';
import { ApplicationComponent } from './application/application.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { ManageAutoshipComponent } from './manage-autoship/manage-autoship.component';
import { OrderInvoiceComponent } from './order-invoice/order-invoice.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { MainCarouselComponent } from '../shop/main-carousel/main-carousel.component';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { ProductVerticalComponent } from '../shop/products/product-vertical/product-vertical.component';
import { PackCarouselComponent } from '../shared/pack-carousel/pack-carousel.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatBadgeModule } from '@angular/material/badge';
import { CustomerTypeCarouselComponent } from '../shared/customer-type-carousel/customer-type-carousel.component';
import { CompleteComponent } from './complete/complete.component';
import { MatSortModule } from '@angular/material/sort';
import { NgxPrintModule } from 'ngx-print';
import { ContactComponent } from './contacts/contacts.component';
import { FlickityComponent } from './flickity/flickity.component';
import { FlickityModule } from 'ngx-flickity';
import 'flickity-as-nav-for';
import { NgxImageZoomModule } from 'ngx-image-zoom';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SwiperModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    SharedModule,
    NgxSkeletonLoaderModule,
    TranslateModule,
    MatButtonModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
    MatChipsModule,
    MatExpansionModule,
    MatMenuModule,
    MatTableModule,
    MatSliderModule,
    MatRadioModule,
    MatDialogModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    MatCardModule,
    MatDatepickerModule,
    MatBadgeModule,
    NgxPrintModule,
    FlickityModule,
    NgxImageZoomModule
  ],
  declarations: [
    MainCarouselComponent,
    ProductVerticalComponent,
    HomeComponent,
    CheckoutComponent,
    LoginComponent,
    FaqComponent,
    AboutUsComponent,
    ErrorPageComponent,
    SignupComponent,
    ApplicationComponent,
    OrderHistoryComponent,
    ManageAutoshipComponent,
    OrderInvoiceComponent,
    ForgotPasswordComponent,
    PackCarouselComponent,
    CustomerTypeCarouselComponent,
    CompleteComponent,
    ContactComponent,
    FlickityComponent
  ],
  exports: [
    MatButtonModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
    MatChipsModule,
    MatExpansionModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatSliderModule,
    MatRadioModule,
    MatDialogModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    NgxPrintModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    MatCardModule,
    MatDatepickerModule,
    MatBadgeModule,
  ],
})
export class PagesModule { }
