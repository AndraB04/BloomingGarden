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

  constructor(private orderService: OrderService) {
    this.orderService.getOrders().subscribe((orderList:Array<any>) => {
      this.orders = orderList;
    })
  }

  onDelete(order:any){
    this.orderService.deleteOrder(order.id);
  }

  onConfirm(order: any) {
    this.orderService.confirmOrder(order.id)
  }

  onCanceled(order: any) {
    this.orderService.canceledOrder(order.id)
  }

}
