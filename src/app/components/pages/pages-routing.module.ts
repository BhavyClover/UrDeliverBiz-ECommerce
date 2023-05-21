import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutComponent } from './checkout/checkout.component';
import { LoginComponent } from './login/login.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { FaqComponent } from './faq/faq.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { SignupComponent } from 'src/app/components/pages/signup/signup.component';
import { ApplicationComponent } from './application/application.component';
import { AuthGuard } from '../shared/services/auth.guard.service';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { ManageAutoshipComponent } from './manage-autoship/manage-autoship.component';
import { OrderInvoiceComponent } from './order-invoice/order-invoice.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ShippingAddressComponent } from './shippingaddress/shippingaddress.component';
import { HomeComponent } from './home/home.component';
import { CompleteComponent } from './complete/complete.component';
import { LoggedInAuthGuard } from '../shared/services/loggedin.guard.service';
import { ContactComponent } from './contacts/contacts.component';
import { FlickityComponent } from './flickity/flickity.component';

const routes: Routes = [
      { path: 'home', component: HomeComponent },
      { path: 'about', component: AboutUsComponent },
      { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
      { path: 'faq', component: FaqComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'login', component: LoginComponent, canActivate: [LoggedInAuthGuard] },
      { path: 'orderhistory', component: OrderHistoryComponent, canActivate: [AuthGuard] },
      { path: 'manageautoship', component: ManageAutoshipComponent, canActivate: [AuthGuard] },
      { path: 'autoorderhistory', component: LoginComponent, canActivate: [AuthGuard] },
      { path: 'complete', component: CompleteComponent, canActivate: [AuthGuard] },
      { path: '404', component: ErrorPageComponent },
      { path: 'signup', component: SignupComponent, canActivate: [LoggedInAuthGuard]},
      { path: 'join', component: ApplicationComponent, canActivate: [LoggedInAuthGuard] },
      { path: 'orderinvoice', component: OrderInvoiceComponent, canActivate: [AuthGuard] },
      { path: 'forgotpassword', component: ForgotPasswordComponent },
      { path: 'shipping', component: ShippingAddressComponent, canActivate: [AuthGuard] },
      { path: 'item/:id', component: FlickityComponent}
    ];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
