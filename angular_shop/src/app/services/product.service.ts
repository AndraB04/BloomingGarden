import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {ConfigurationsService} from "./configurations.service";


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productObservable = new BehaviorSubject<Array<any>>([]);

  constructor(private appConfig: ConfigurationsService, private httpClient: HttpClient) {
    this.readProducts();
  }

  private getApiUrl(): string {
    return this.appConfig.getApiUrl();
  }
  getProductList() {
    return this.productObservable.asObservable();
  }

  getProductById(id: string) {
    return this.httpClient.get(`${this.appConfig.getApiUrl()}/products/productById/${id}`);
  }

  createProduct(product: any) {
    this.httpClient.post(`${this.appConfig.getApiUrl()}/products/addProduct`, product).subscribe((response: any) => {
      console.log(response);
      console.log(response.message);

      this.readProducts();
    })
  }

  updateProduct(product: any) {
    this.httpClient.put(`${this.appConfig.getApiUrl()}/products/updateProduct`, product).subscribe((response: any) => {
      console.log(response);
      console.log(response.message);

      this.readProducts();
    })
  }

  deleteProduct(productId: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.getApiUrl()}/products/deleteProduct/${productId}`);
  }

  readProducts() {
    this.httpClient.get(`${this.appConfig.getApiUrl()}/products`).subscribe((response: any) => {
      this.productObservable.next(response.data);
      console.log(response);
    })
  }

}
