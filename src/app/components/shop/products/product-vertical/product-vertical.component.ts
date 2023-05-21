import { Component, OnInit, Input } from '@angular/core';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import { ProductService } from 'src/app/components/shared/services/product.service';
import { DSProduct } from 'src/app/modals/dsproduct.modal';
import { Product } from 'src/app/modals/product.model';
import { UserService } from 'src/app/components/shared/services/user.service';
import { UserServiceModal } from 'src/app/modals/userservice.modal';
import { UtilityService } from 'src/app/components/shared/services/utility.service';
import { CompanyService } from 'src/app/components/shared/services/company.service';
import { ShoppingCartService } from 'src/app/components/shared/services/shopping-cart.service';

@Component({
  selector: 'app-product-vertical',
  templateUrl: './product-vertical.component.html',
  styleUrls: ['./product-vertical.component.scss']
})
export class ProductVerticalComponent implements OnInit {
  contentLoaded = false;
  userService: UserServiceModal;
 @Input() products: Array<DSProduct>;

  constructor(
    public configService: ConfigService,
    private productService: ProductService,
    public user: UserService,
    public utilityService: UtilityService,
    public companyService: CompanyService,
    public shoppingCartService: ShoppingCartService
    ) {
    this.userService = user.userServiceModal;
  }

  ngOnInit() {
    const request = {
      CurrencyCode: this.companyService.selectedCurrency.CurrencyCode,
      LanguageCode: this.configService.commonData.selectedLanguage || 'en',
      RegionID: 1,
      PriceGroup: this.userService.customerTypeID,
      StoreID: this.shoppingCartService.getShoppingCart(1)[0]?.StoreID,
      CategoryId: 0
    };
    this.productService.getProducts(request)
    .subscribe (product =>
    this.products = product
    );
    setTimeout(() => {
      this.contentLoaded = true;
    }, 3000);
  }
  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

}
