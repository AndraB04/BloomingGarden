import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {ConfigurationsService} from "./configurations.service";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private user: any;
  private customerObservable = new BehaviorSubject([]);

  constructor(private appConfig: ConfigurationsService, private httpClient:HttpClient) {
    this.readCustomers();
  }
  public setLoggedUser(user:any){
    this.user = user;
  }

  public getLoggedUser(){
    return this.user;
  }

  getCustomerList() {
    return this.customerObservable.asObservable();
  }

  createCustomer(user: any) {
    this.httpClient.post(`${this.appConfig.getApiUrl()}/customers/addCustomer`, user).subscribe((response: any) => {
      console.log(response);
      console.log(response.message);

      this.readCustomers();// se actualizeaza lista de elemente la fiecare adaugare
    })
  }

  updateCustomer(user: any) {
    this.httpClient.put(`${this.appConfig.getApiUrl()}/customers/updateCustomer`, user).subscribe((response: any) => {
      console.log(response);
      console.log(response.message);

      this.readCustomers();
    })
  }

  deleteCustomer(user: any) {
    this.httpClient.delete(`${this.appConfig.getApiUrl()}/customers/deleteCustomerById/${user.id}`).subscribe((response: any)=> {
      console.log(response);
      this.readCustomers();
    })
  }

  readCustomers() {
    this.httpClient.get(`${this.appConfig.getApiUrl()}/customers`).subscribe((response: any) => {
      this.customerObservable.next(response.data);//lambda expresion (trimite notificari catre toti care au dat subscribe)
      console.log(response);
    })
  }
}
