import {Component} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {CommonModule, NgForOf, NgIf, CurrencyPipe, DatePipe} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {OrderService} from "../../services/order.service";
import {CartService} from "../../services/cart.service";
import {CartItem} from "../../models/cart-item";
import {Router} from "@angular/router";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-cart-dialog',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    NgForOf,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    MatDialogClose,
    FormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    NgIf,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './cart-dialog.component.html',
  styleUrl: './cart-dialog.component.css'
})
export class CartDialogComponent {
  products: Array<any> = [];
  modernCartItems: Array<CartItem> = [];

  details: FormControl = new FormControl<any>('', Validators.required);

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {

    this.orderService.getCart().subscribe((productsList: Array<any>) => {
      this.products = productsList;
    });

    this.cartService.cartItems.subscribe((cartItems: CartItem[]) => {
      this.modernCartItems = cartItems;
    });
  }

  public onBuy() {

    this.products.forEach(product => {

      const cartItem: CartItem = {
        id: product.id,
        name: product.name || product.title,
        imageUrl: product.image1,
        unitPrice: product.price,
        quantity: 1
      };
      this.cartService.addToCart(cartItem);
    });

    this.products.forEach(product => {
      this.orderService.removeFromCart(product);
    });

    this.router.navigate(['/checkout']);

  }

  public onDeleteFromCart(product: any) {
    this.orderService.removeFromCart(product);
  }

  public onDeleteFromModernCart(item: CartItem) {
    this.cartService.remove(item);
  }

  getErrorMessage(input: FormControl): string {
    if (input.hasError('required')) {
      return 'You must enter a value';
    }
    if (input.hasError('email')) {
      return 'Not a valid email';
    }
    return '';
  }
}
