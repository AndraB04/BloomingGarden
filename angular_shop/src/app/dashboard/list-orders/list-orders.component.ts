import { Component, OnInit } from '@angular/core'; // Adaugat OnInit
import { OrderService } from "../../services/order.service";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
// import { NgForOf } from "@angular/common"; // <-- Acesta nu mai este necesar odata ce importi CommonModule
import { CommonModule } from '@angular/common'; // <-- Adaugă acest import
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-list-reservations',
  standalone: true,
  imports: [
    CommonModule, // <-- Adaugă CommonModule aici
    MatButtonModule,
    MatCardModule,
    // NgForOf, // <-- Poți șterge NgForOf de aici, CommonModule îl include
    MatIconModule
    // Adauga aici alte module/componente standalone pe care le foloseste template-ul tau (daca este cazul)
  ],
  templateUrl: './list-orders.component.html',
  styleUrl: './list-orders.component.css'
})
// Componenta implementeaza OnInit
export class ListOrdersComponent implements OnInit { // <-- Adauga 'implements OnInit'

  orders: Array<any> = [];
  currentProductIndex: number = 0; // Aparent, acest index este folosit global pentru *toate* comenzile? S-ar putea sa vrei sa-l gestionezi per comanda.

  constructor(private orderService: OrderService) {
    // Mutam apelul loadOrders in ngOnInit
    // this.loadOrders();
  }

  ngOnInit(): void {
    // Apelam logica de incarcare a datelor la initializarea componentei
    this.loadOrders();
  }


  private loadOrders() {
    this.orderService.getOrders().subscribe((orderList: Array<any>) => {
      console.log('Received orders:', orderList);
      // Probabil vrei sa initializezi currentProductIndex per comanda aici, nu global
      this.orders = orderList.map(order => ({ ...order, currentProductIndex: 0 })); // Exemplu: Adaugam index per comanda
    });
  }

  // Metodele next/prev/set ar trebui sa primeasca comanda ca parametru pentru a gestiona indexul per comanda
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
      // Presupunem ca deleteOrder si readOrders sunt metode in orderService
      this.orderService.deleteOrder(order.id);
      this.orderService.readOrders(); // Sau reimprospatezi lista local
    }
  }

  onConfirm(order: any) {
    // Verifica statusul comenzii (folosind paymentStatus)
    if (order.status !== 'PENDING') { // Verifica campul 'status', nu 'paymentStatus' conform Order.java
      console.warn('Cannot confirm order that is not in PENDING state');
      return;
    }

    this.orderService.confirmOrder(order.id).subscribe({
      next: (response) => {
        console.log('Order confirmed successfully:', response);
        this.orderService.readOrders(); // Reimprospateaza lista
      },
      error: (error) => {
        console.error('Error confirming order:', error);
        alert('Failed to confirm order. Please try again.');
      }
    });
  }

  onCanceled(order: any) {
    // Verifica statusul comenzii (folosind paymentStatus)
    if (order.status !== 'PENDING') { // Verifica campul 'status', nu 'paymentStatus' conform Order.java
      console.warn('Cannot cancel order that is not in PENDING state');
      return;
    }

    this.orderService.canceledOrder(order.id).subscribe({
      next: (response) => {
        console.log('Order canceled successfully:', response);
        this.orderService.readOrders(); // Reimprospateaza lista
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    });
  }

}
