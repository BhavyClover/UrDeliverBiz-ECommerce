import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Product } from 'src/app/modals/product.model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class Resolver implements Resolve<Product> {

  public product: Product = {};

  constructor(
    private router: Router,
    public productService: ProductService
  ) { }

  // Resolver
  async resolve(route: ActivatedRouteSnapshot): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.productService.getProductBySlug(route.params.slug).subscribe(product => {
      if (!product) { // When product is empty redirect 404
        this.router.navigateByUrl('/404', { skipLocationChange: true });
      } else {
        this.product = product;
      }
    });
    return this.product;
  }
}
