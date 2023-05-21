import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSettings } from './services/color-option.service';

import { FlexLayoutModule } from '@angular/flex-layout';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDividerModule} from '@angular/material/divider';
import {MatRadioModule} from '@angular/material/radio';
import {MatListModule} from '@angular/material/list';
import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import { ProductOrderByPipe } from './pipes/order-by.pipe';
import { ProductService } from './services/product.service';
import { CartService } from './services/cart.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BannersComponent } from './banners/banners.component';
import { ShoppingWidgetsComponent } from './shopping-widgets/shopping-widgets.component';
import {MatBadgeModule} from '@angular/material/badge';

import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ImagePreloadDirective } from './directive/default-img.directive';
import { OrderService } from './services/order.service';
import { NotificationService } from './services/notification.service';
import { TranslateModule } from '@ngx-translate/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ConfirmDialogComponent } from './model/confirm-dialog/confirm-dialog.component';
import { HostedpaymentDialogComponent } from './model/hostedpayment-dialog/hostedpayment-dialog.component';
import { FindEnrollerComponent } from './model/findenroller/findenroller.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { AutoshipEditComponent } from './autoship-edit/autoship-edit.component';
import { MarketSelectorComponent } from './model/market-selector/market-selector.component';
import { UnsafePipe } from './pipes/unsafe.pipe';
import { GroupByCountPipe } from './pipes/group-by-count.pipe';
import { PaymentTranslatePipe } from './pipes/payment-translate.pipe';
import { RangePipe } from './pipes/eange.pipe';
import { TrustAsUrlPipe } from './pipes/trustas-url.pipe';
import { IsDecimalNumberPipe } from './pipes/decimal-number.pipe';
import { AddSymbolWithNumberPipe } from './pipes/add-symbol-with-number.pipe';
import { CheckValidDatePipe } from './pipes/check-valid-date.pipe';
import { ChangeDateFormatPipe } from './pipes/date-format.pipe';
import { TranslateSmartShipMonthPipe } from './pipes/smartship-month.pipe';
import { IconClassDirective } from './directive/iconclass.directive';
import { ShippingAddressComponent } from '../pages/shippingaddress/shippingaddress.component';

import { RemoveStarPipe } from './pipes/remove-star.pipe';
import { NgInitDirective } from './directive/ng-init';
import { SideBarSummaryCartComponent } from './sidebar-summary-cart/sidebar-summary-cart.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SafePipe } from './pipes/safe.pipe';
import { ValidateDirective } from './directive/validation.directive';
import { ItemsListService } from './services/itemsList.service';
import { OrderModule } from 'ngx-order-pipe';
import { ProductSearchPipe } from './pipes/product-search.pipe';
import { ContactComponent } from './model/contact/contact.component';
import { ProductDialogComponent } from '../shop/products/product-dialog/product-dialog.component';
import { CategoryPipe } from './pipes/category-filter.pipe';
import { ShipMethodsComponent } from './model/ship-methods/ship-methods.component';
import { AllowCvvComponent } from './model/allow-cvv/allow-cvv.component';
import { ShippingAddressDialogComponent } from './model/shipping-address-dialog/shipping-address-dialog.component';
import { UniquePipe } from './pipes/unique.pipe';
import { PaymentService } from './services/payment.service';
import { PersistentService } from './services/persistent.service';
import { AutoshipConfigurationService } from './services/autoshipConfiguration.service';
@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    SidebarComponent,
    SideBarSummaryCartComponent,
    ProductOrderByPipe,
    CategoryPipe,
    UniquePipe,
    SafePipe,
    UnsafePipe,
    RemoveStarPipe,
    GroupByCountPipe,
    PaymentTranslatePipe,
    ProductSearchPipe,
    RangePipe,
    TrustAsUrlPipe,
    GroupByCountPipe,
    IsDecimalNumberPipe,
    AddSymbolWithNumberPipe,
    CheckValidDatePipe,
    ChangeDateFormatPipe,
    TranslateSmartShipMonthPipe,
    BannersComponent,
    ShoppingWidgetsComponent,
    BreadcrumbComponent,
    ConfirmDialogComponent,
    HostedpaymentDialogComponent,
    FindEnrollerComponent,
    ContactComponent,
    ShippingAddressComponent,
    ImagePreloadDirective,
    IconClassDirective,
    NgInitDirective,
    ValidateDirective,
    AutoshipEditComponent,
    MarketSelectorComponent,
    AllowCvvComponent,
    ProductDialogComponent,
    ShipMethodsComponent,
    ShippingAddressDialogComponent

  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatListModule,
    MatSliderModule,
    MatExpansionModule,
    MatBadgeModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatRadioModule,
    MatDialogModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatSidenavModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    MatCardModule,
    FlexLayoutModule,
    NgxSkeletonLoaderModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatCheckboxModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    OrderModule
  ],
  exports: [
    CommonModule,
    MatButtonModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatListModule,
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
    ProductOrderByPipe,
    CategoryPipe,
    UniquePipe,
    SafePipe,
    UnsafePipe,
    RemoveStarPipe,
    GroupByCountPipe,
    PaymentTranslatePipe,
    ProductSearchPipe,
    RangePipe,
    TrustAsUrlPipe,
    GroupByCountPipe,
    IsDecimalNumberPipe,
    AddSymbolWithNumberPipe,
    CheckValidDatePipe,
    ChangeDateFormatPipe,
    TranslateSmartShipMonthPipe,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    SidebarComponent,
    SideBarSummaryCartComponent,
    BannersComponent,
    FlexLayoutModule,
    ShoppingWidgetsComponent,
    BreadcrumbComponent,
    ConfirmDialogComponent,
    HostedpaymentDialogComponent,
    FindEnrollerComponent,
    AllowCvvComponent,
    ShippingAddressComponent,
    MarketSelectorComponent,
    ContactComponent,
    AutoshipEditComponent,
    ImagePreloadDirective,
    IconClassDirective,
    NgInitDirective,
    ValidateDirective,
    ProductDialogComponent,
    ShipMethodsComponent,
    ShippingAddressDialogComponent
  ],
  providers: [
    NotificationService,
    MatDatepickerModule,
    OrderService,
    PaymentService,
    PersistentService,
    AutoshipConfigurationService,
    ProductService,
    CartService,
    ItemsListService,
    AppSettings
  ],
  entryComponents: [
    ConfirmDialogComponent,
    HostedpaymentDialogComponent,
    FindEnrollerComponent,
    AllowCvvComponent,
    ShippingAddressComponent,
    MarketSelectorComponent,
    ContactComponent,
    AutoshipEditComponent,
    ProductDialogComponent,
    ShipMethodsComponent,
    ShippingAddressDialogComponent
  ]
})
export class SharedModule {}
