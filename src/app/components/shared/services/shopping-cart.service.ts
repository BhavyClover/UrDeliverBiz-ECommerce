import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Cart } from 'src/app/modals/shoppingcart.modal';
import { UserService } from './user.service';


@Injectable({
    providedIn: 'root'
})
export class ShoppingCartService {
    shoppingCart: any;
    constructor(private http: HttpClient, public user: UserService) {

    }

    setShoppingCart(region: number, customerType?: number) {
        customerType = customerType || this.user.userServiceModal.customerTypeID || 2;

        const promise = new Promise((resolve, reject) => {
            this.http.get<any>(`assets/data/cart.json`, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json; charset=utf-8'
                })
            }).subscribe((data) => {
                this.shoppingCart = [];
                _.filter(data.Carts, (cart) => {
                    if (cart.Region == region) {
                        return cart.CartConfiguration.filter((carts: Cart) => {
                            if (carts.CustomerType == customerType) {
                                return this.shoppingCart.push(carts);
                            }
                        });
                    }
                });
                resolve(this.shoppingCart);
                return this.shoppingCart;
            });
        }).then(() => {
            sessionStorage.setItem('cart', JSON.stringify(this.shoppingCart))
        })
        return promise;
    }

    getShoppingCart(orderType: number): Array<Cart> {
        if (this.shoppingCart != null && this.shoppingCart != undefined) {
            return this.shoppingCart.filter((cart: Cart) => {
                return cart.OrderTypeID == orderType;
            });
        } else if (sessionStorage.getItem('cart')) {
            const carts = JSON.parse(sessionStorage.getItem('cart'))
            return carts.filter((cart: Cart) => {
                return cart.OrderTypeID == orderType;
            })
        } else {
            return [{
                Name: '',
                CurrencyCode: '',
                LanguageID: '',
                PriceTypeID: 0,
                StoreID: 4,
                CountryCode: '',
                CustomerType: 1,
                OrderTypeID: -1,
            }];
        }
    }
}
