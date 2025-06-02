import {Component} from '@angular/core';
import {OrderService} from "../../services/order.service";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {NgForOf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-list-reservations',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    NgForOf,
    MatIconModule
  ],
  templateUrl: './list-orders.component.html',
  styleUrl: './list-orders.component.css'
})
export class ListOrdersComponent {
  orders: Array<any> = [];
  currentProductIndex: number = 0;

  constructor(private orderService: OrderService) {
    this.loadOrders();
  }

  private loadOrders() {
    this.orderService.getOrders().subscribe((orderList:Array<any>) => {
      console.log('Received orders:', orderList);
      this.orders = orderList;
    });
  }

  nextProduct(reservation: any) {
    if (reservation.productList && reservation.productList.length > 0) {
      this.currentProductIndex = (this.currentProductIndex + 1) % reservation.productList.length;
    }
  }

  prevProduct(reservation: any) {
    if (reservation.productList && reservation.productList.length > 0) {
      this.currentProductIndex = this.currentProductIndex === 0 
        ? reservation.productList.length - 1 
        : this.currentProductIndex - 1;
    }
  }

  setProductIndex(reservation: any, index: number) {
    if (reservation.productList && index >= 0 && index < reservation.productList.length) {
      this.currentProductIndex = index;
    }
  }

  onDelete(order:any){
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(order.id);
      this.orderService.readOrders();
    }
  }

  onConfirm(order: any) {
    if (order.paymentStatus !== 'PENDING') {
      console.warn('Cannot confirm order that is not in PENDING state');
      return;
    }

    this.orderService.confirmOrder(order.id).subscribe({
      next: (response) => {
        console.log('Order confirmed successfully:', response);
        this.orderService.readOrders();
      },
      error: (error) => {
        console.error('Error confirming order:', error);
        alert('Failed to confirm order. Please try again.');
      }
    });
  }

  onCanceled(order: any) {
    if (order.paymentStatus !== 'PENDING') {
      console.warn('Cannot cancel order that is not in PENDING state');
      return;
    }

    this.orderService.canceledOrder(order.id).subscribe({
      next: (response) => {
        console.log('Order canceled successfully:', response);
        this.orderService.readOrders();
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    });
  }

}
