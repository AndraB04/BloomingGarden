import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckoutRequest, OrderResponse } from '../models/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private checkoutBaseUrl = 'http://localhost:8080/api/checkout';

  constructor(private httpClient: HttpClient) { }

  placeOrder(checkoutRequest: CheckoutRequest): Observable<OrderResponse> {
    return this.httpClient.post<OrderResponse>(`${this.checkoutBaseUrl}/purchase`, checkoutRequest);
  }
}
