import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
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
    console.log('CartService - addToCart called with:', theCartItem);

    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if (this.cartItems.getValue().length > 0) {
      existingCartItem = this.cartItems.getValue().find(tempCartItem => tempCartItem.id === theCartItem.id);
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if (alreadyExistsInCart) {
      console.log('CartService - Item already exists, incrementing quantity for ID:', theCartItem.id);
      if (existingCartItem) {
        existingCartItem.quantity++;
      }
    } else {
      console.log('CartService - Adding new item:', theCartItem);
      this.cartItems.next([...this.cartItems.getValue(), theCartItem]);
    }

    console.log('CartService - Current items:', this.cartItems.getValue());
    this.computeCartTotals();
    console.log('CartService - computeCartTotals finished.');
  }

  computeCartTotals() {
    let totalPricesValue: number = 0;
    let totalQuantitiesValue: number = 0;

    const items = this.cartItems.getValue();

    for (let tempCartItem of items) {
      totalPricesValue += (tempCartItem.quantity || 0) * (tempCartItem.unitPrice || 0);
      totalQuantitiesValue += (tempCartItem.quantity || 0);
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
