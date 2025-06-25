// src/app/dashboard/orders-manager/list-orders/list-orders.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from "../../services/order.service";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-list-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './list-orders.component.html',
  styleUrl: './list-orders.component.css'
})

export class ListOrdersComponent implements OnInit, OnDestroy {

  orders: any[] = [];
  private ordersSubscription: Subscription | undefined;
  private imagesBaseUrl = 'http://localhost:8081/images/';

  constructor(private orderService: OrderService) {
  }

  ngOnInit(): void {
    this.ordersSubscription = this.orderService.getOrders().subscribe((orderList: any[]) => {
      this.orders = orderList.map(order => {
        if (order.productList) {
          order.productList.forEach((product: any) => {
            product.imageUrl = this.imagesBaseUrl + product.image;
          });
        }
        return { ...order, currentProductIndex: 0 };
      });
      console.log('Processed orders for display:', this.orders);
    });

    this.orderService.readOrders();
  }

  ngOnDestroy(): void {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  nextProduct(order: any) {
    if (order.productList && order.productList.length > 0) {
      order.currentProductIndex = (order.currentProductIndex + 1) % order.productList.length;
    }
  }

  prevProduct(order: any) {
    if (order.productList && order.productList.length > 0) {
      order.currentProductIndex = order.currentProductIndex === 0
        ? order.productList.length - 1
        : order.currentProductIndex - 1;
    }
  }

  setProductIndex(order: any, index: number) {
    if (order.productList && index >= 0 && index < order.productList.length) {
      order.currentProductIndex = index;
    }
  }

  onDelete(order: any) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(order.id).subscribe({
        next: (response) => {
          console.log('Order deleted successfully:', order.id, response);
          this.orders = this.orders.filter(o => o.id !== order.id);
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          alert('Failed to delete order. Please try again.');
        }
      });
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
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index].paymentStatus = 'CONFIRMED';
        }
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
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index].paymentStatus = 'CANCELED';
        }
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    });
  }

  getCurrentProduct(order: any): any | undefined {
    if (order && order.productList && order.productList.length > 0) {
      const index = order.currentProductIndex;
      if (index >= 0 && index < order.productList.length) {
        return order.productList[index];
      }
    }
    return undefined;
  }
}
