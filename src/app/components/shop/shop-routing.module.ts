import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductDetailsComponent } from './products/product-details/product-details.component';
import { ProductNoSidebarComponent } from './products/product-no-sidebar/product-no-sidebar.component';

// Routes
const routes: Routes = [
  { path: 'products/:category', component: ProductNoSidebarComponent },
  { path: 'product/:id', component: ProductDetailsComponent , pathMatch: 'full'}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
