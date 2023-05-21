import { UtilityService } from 'src/app/components/shared/services/utility.service';
import { PersistentService } from './../../../shared/services/persistent.service';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ProductService } from 'src/app/components/shared/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Product } from 'src/app/modals/product.model';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';
import { ConfigService } from 'src/app/components/shared/services/config.service';
import { Cart1Service } from 'src/app/components/shared/services/cart1.service';
import { CompanyService } from 'src/app/components/shared/services/company.service';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {

  @Output() onOpenProductDialog: EventEmitter<Product> = new EventEmitter();
  @Input() product: any;

  constructor(
    public configService: ConfigService,
    public cart1Service: Cart1Service,
    public productsService: ProductService,
    private dialog: MatDialog,
    private router: Router,
    public persistentService: PersistentService,
    public utilityService: UtilityService,
    public companyService: CompanyService
  ) { }

  public openProductDialog(product) {
    this.dialog.open(ProductDialogComponent, {
      data: product,
      panelClass: 'product-dialog',
      autoFocus: false
    });
  }
}
