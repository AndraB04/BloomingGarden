import {Component, Input} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {OrderService} from "../../services/order.service";
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

  constructor(public dialog: MatDialog, private orderService: OrderService) {
    orderService.getCart().subscribe((products: Array<any>) => {
      this.productsCount = products.length;
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
