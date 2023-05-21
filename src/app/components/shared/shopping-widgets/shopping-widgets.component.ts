import { Component, Input } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Observable, Subject } from 'rxjs';
import { CartItem } from 'src/app/modals/cart-item';
import { ProductService } from '../services/product.service';
import { SideNavBarService } from '../services/sidenavbar.service';
import { DSProduct } from 'src/app/modals/dsproduct.modal';
import * as _ from 'lodash';
import { UtilityService } from '../services/utility.service';
@Component({
  selector: 'app-shopping-widgets',
  templateUrl: './shopping-widgets.component.html',
  styleUrls: ['./shopping-widgets.component.scss']
})
export class ShoppingWidgetsComponent {
  products: Array<DSProduct>;
  indexProduct: number;
  public sidenavMenuItems: Array<any>;
  @Input() shoppingCartItems: CartItem[] = [];
  @Input() isWhite: boolean = true;
  sideBarSummaryToogle: Subject<void> = new Subject<void>();
  constructor(
    private cartService: CartService,
    public productService: ProductService,
    public sideNavBarService: SideNavBarService,
    public itemsService: ProductService,
    public utilityService: UtilityService
  ) { }

  public removeItem(item: CartItem) {
    this.cartService.removeFromCart(item);
  }
  public getTotal(): Observable<number> {
    return this.cartService.getTotalAmount();
  }
  getQuanity() {
    let quantity = 0;
    if (this.utilityService.isEnrollment()) {
      _.each(this.itemsService.selectedPacks, (item) => {
        quantity += (item.Quantity ? Number(item.Quantity) : 0);
      });
    }
    _.each(this.itemsService.selectedOrderItems, (item) => {
      if (!item.UsePoints) {
        quantity += (item.Quantity ? Number(item.Quantity) : 0);
      }
      if (item.UsePoints) {
        quantity += (item.rewardQuantity ? Number(item.rewardQuantity) : 0);
      }
    });
    _.each(this.itemsService.selectedAutoOrderItems, (item) => {
      quantity += (item.Quantity ? Number(item.Quantity) : 0);
    });
    return quantity;
  }
}
