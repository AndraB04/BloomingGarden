import {Component, Input} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {OrderService} from "../../services/order.service";
import {CartService} from "../../services/cart.service";
import {CartDialogComponent} from "../cart-dialog/cart-dialog.component";

@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.css'
})
export class CartButtonComponent {
  @Input("productsCount") productsCount: number = 0;

  constructor(public dialog: MatDialog, private orderService: OrderService, private cartService: CartService) {
    // Listen to both cart systems to get total count
    this.updateCartCount();
    
    // Subscribe to old cart system changes
    orderService.getCart().subscribe((products: Array<any>) => {
      this.updateCartCount();
    });
    
    // Subscribe to modern cart system changes
    cartService.cartItems.subscribe((cartItems) => {
      this.updateCartCount();
    });
  }

  private updateCartCount(): void {
    // Get count from old cart system
    this.orderService.getCart().subscribe((oldCartProducts: Array<any>) => {
      // Get count from modern cart system
      const modernCartItems = this.cartService.cartItems.getValue();
      
      // Calculate total quantity from modern cart (considering quantities)
      const modernCartCount = modernCartItems.reduce((total, item) => total + item.quantity, 0);
      
      // Total count is old cart products + modern cart items
      this.productsCount = oldCartProducts.length + modernCartCount;
    });
  }

  openCartDialog(): void {
    if(this.productsCount == 0) {
      alert('The cart is empty, please add some products first!')
    } else {
      const dialogRef = this.dialog.open(CartDialogComponent);

      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }
  }
}
