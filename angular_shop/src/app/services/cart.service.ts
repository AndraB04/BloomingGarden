import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: BehaviorSubject<CartItem[]> = new BehaviorSubject<CartItem[]>([]);
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if (this.cartItems.getValue().length > 0) {
      existingCartItem = this.cartItems.getValue().find(tempCartItem => tempCartItem.id === theCartItem.id);
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if (alreadyExistsInCart) {
      // @ts-ignore
      existingCartItem.quantity++;
    } else {
      this.cartItems.next([...this.cartItems.getValue(), theCartItem]);
    }

    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPricesValue: number = 0;
    let totalQuantitiesValue: number = 0;

    for (let tempCartItem of this.cartItems.getValue()) {
      totalPricesValue += tempCartItem.quantity * tempCartItem.unitPrice;
      totalQuantitiesValue += tempCartItem.quantity;
    }

    this.totalPrice.next(totalPricesValue);
    this.totalQuantity.next(totalQuantitiesValue);
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {
    const index = this.cartItems.getValue().findIndex(tempCartItem => tempCartItem.id === theCartItem.id);

    if (index > -1) {
      const currentItems = this.cartItems.getValue();
      currentItems.splice(index, 1);
      this.cartItems.next(currentItems);
      this.computeCartTotals();
    }
  }

  clearCart() {
    this.cartItems.next([]);
    this.totalPrice.next(0);
    this.totalQuantity.next(0);
  }
}
