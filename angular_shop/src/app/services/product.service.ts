import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {ConfigurationsService} from "./configurations.service";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productObservable = new BehaviorSubject<Array<any>>([]);

  constructor(private appConfig: ConfigurationsService, private httpClient: HttpClient) {
    this.readProducts();
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

  deleteProduct(product: any) {
  this.httpClient.delete(`${this.appConfig.getApiUrl()}/products/deleteProduct/${product.id}`).subscribe((response: any)=> {
    console.log(response);
    this.readProducts();
  })
  }

  readProducts() {
    this.httpClient.get(`${this.appConfig.getApiUrl()}/products`).subscribe((response: any) => {
      this.productObservable.next(response.data);
      console.log(response);
    })
  }

}
