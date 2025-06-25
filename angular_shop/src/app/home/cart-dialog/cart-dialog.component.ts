import {Component} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {NgForOf, NgIf} from "@angular/common";
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
    ReactiveFormsModule
  ],
  templateUrl: './cart-dialog.component.html',
  styleUrl: './cart-dialog.component.css'
})
export class CartDialogComponent {
  products: Array<any> = [];
  modernCartItems: Array<any> = [];
  details: FormControl = new FormControl<any>('', Validators.required);

  constructor(private orderService: OrderService, private cartService: CartService, private router: Router) {
    // Load products from old cart system
    this.orderService.getCart().subscribe((productsList: Array<any>) => {
      this.products = productsList;
    });
    
    // Load items from modern cart system
    this.cartService.cartItems.subscribe((cartItems) => {
      this.modernCartItems = cartItems;
    });
  }

  public onBuy() {
    // Transfer products from old cart to modern cart service
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

    // Clear old cart
    this.products.forEach(product => {
      this.orderService.removeFromCart(product);
    });

    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  public onDeleteFromCart(product: any) {
    this.orderService.removeFromCart(product);
  }

  public onDeleteFromModernCart(item: any) {
    this.cartService.remove(item);
  }

  getErrorMessage(input: FormControl): string {
    if (input.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }
}
