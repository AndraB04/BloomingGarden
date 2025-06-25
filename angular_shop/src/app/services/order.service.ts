import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { CustomerService } from "./customer.service";
import { ConfigurationsService } from "./configurations.service";
import { Order } from '../models/order';
import { CheckoutRequest, OrderResponse } from '../models/checkout';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private cartObservable = new BehaviorSubject<Array<any>>([]);
  private ordersObservable = new BehaviorSubject<Array<any>>([]);

  private totalQuantitySubject = new BehaviorSubject<number>(0);
  private totalPriceSubject = new BehaviorSubject<number>(0);

  totalQuantity: Observable<number> = this.totalQuantitySubject.asObservable();
  totalPrice: Observable<number> = this.totalPriceSubject.asObservable();

  private baseUrl = 'http://localhost:8081/api'; // Adapteaza URL-ul

  constructor(
    private appConfig: ConfigurationsService,
    private customerService: CustomerService,
    private httpClient: HttpClient
  ) {
    this.readOrders();
  }

  public addToCart(product: any): void {
    let products = this.cartObservable.getValue();
    products.push(product);
    this.cartObservable.next(products);
  }

  public removeFromCart(product: any): void {
    let products = this.cartObservable.getValue();
    products = products.filter((it: any) => it.id !== product.id);
    this.cartObservable.next(products);
  }

  public getCart(): Observable<any[]> {
    return this.cartObservable.asObservable();
  }

  public getOrders(): Observable<any[]> {
    return this.ordersObservable.asObservable();
  }

  public createOrder(details: string) {
    let cartProducts = this.cartObservable.getValue();

    let total = 0;
    let productIds = [];
    for (let product of cartProducts) {
      total += product.price;
      productIds.push({ id: product.id });
    }

    let body = {
      date: this.parseDate(),
      total: total,
      details: details,
      paymentStatus: 'PENDING',
      customer: {
        id: this.customerService.getLoggedUser().id,
      },
      productList: productIds,
    }

    this.httpClient.post(`${this.appConfig.getApiUrl()}/orders/addOrder`, body).subscribe((response: any) => {
      console.log(response)
      this.cartObservable.next([]);
      this.readOrders();
    })
  }

  public deleteOrder(id: string): Observable<any> {
    return this.httpClient.delete(`${this.appConfig.getApiUrl()}/orders/deleteOrderById/${id}`);
  }

  public confirmOrder(id: string): Observable<any> {
    return this.httpClient.post(`${this.appConfig.getApiUrl()}/orders/confirmOrderById/${id}`, {});
  }

  public canceledOrder(id: string): Observable<any> {
    return this.httpClient.post(`${this.appConfig.getApiUrl()}/orders/cancelOrderById/${id}`, {});
  }

  public readOrders() {
    return this.httpClient.get(`${this.appConfig.getApiUrl()}/orders`).subscribe((response: any) => {
      this.ordersObservable.next(response.data)
    });
  }

  public getOrderByTrackingNumber(trackingNumber: string): Observable<Order> {
    return this.httpClient.get<Order>(`${this.baseUrl}/orders/${trackingNumber}`);
  }

  public clearCart(): void {
    this.cartObservable.next([]);
  }

  computeCartTotals() {
    let totalQuantity: number = 0;
    let totalPrice: number = 0;

    for (let item of this.cartObservable.getValue()) {
      totalQuantity += (item.quantity || 0);
      totalPrice += (item.quantity || 0) * (item.unitPrice || 0);
    }

    this.totalQuantitySubject.next(totalQuantity);
    this.totalPriceSubject.next(totalPrice);
  }

  private parseDate(): string {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let dateStr = "";

    dateStr += year;
    dateStr += "-";
    dateStr += (month < 10 ? "0" : "") + month;
    dateStr += "-";
    dateStr += (day < 10 ? "0" : "") + day;

    return dateStr;
  }

  public placeOrder(purchasePayload: CheckoutRequest): Observable<OrderResponse> {
    return this.httpClient.post<OrderResponse>(`${this.baseUrl}/checkout/purchase`, purchasePayload);
  }
}
