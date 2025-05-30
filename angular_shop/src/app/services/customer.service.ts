import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ConfigurationsService} from "./configurations.service";

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private loggedUserSubject = new BehaviorSubject<any | null>(this.loadLoggedUserFromStorage());
  public loggedUser$: Observable<any | null> = this.loggedUserSubject.asObservable();

  private customerObservable = new BehaviorSubject<Array<any>>([]);

  constructor(private appConfig: ConfigurationsService, private httpClient:HttpClient) {
    this.readCustomers();
  }

  public setLoggedUser(user: any): void {
    this.loggedUserSubject.next(user);
    console.log("[CustomerService] User set via AuthService call:", user);
  }

  public getLoggedUser(): any | null {
    return this.loadLoggedUserFromStorage();
  }


  public logout(): void {

    localStorage.removeItem('loggedUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.loggedUserSubject.next(null);
    console.log("[CustomerService] User logged out (from CustomerService).");
  }

  private loadLoggedUserFromStorage(): any | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  getIsAdminObservable(): Observable<boolean> {
    return this.loggedUserSubject.asObservable().pipe(
      map(user => user && user.userRole === 'ADMIN')
    );
  }


  getCustomerList(): Observable<Array<any>> {
    return this.customerObservable.asObservable();
  }

  createCustomer(user: any): void {
    this.httpClient.post(`${this.appConfig.getApiUrl()}/customers/addCustomer`, user).subscribe({
      next: (response: any) => {
        console.log("Customer created successfully:", response);
        this.readCustomers();
      },
      error: (error) => console.error("Error creating customer:", error)
    });
  }

  updateCustomer(user: any): void {
    this.httpClient.put(`${this.appConfig.getApiUrl()}/customers/updateCustomer`, user).subscribe({
      next: (response: any) => {
        console.log("Customer updated successfully:", response);
        this.readCustomers();
      },
      error: (error) => console.error("Error updating customer:", error)
    });
  }

  deleteCustomer(user: any): void {
    this.httpClient.delete(`${this.appConfig.getApiUrl()}/customers/deleteCustomerById/${user.id}`).subscribe({
      next: (response: any)=> {
        console.log("Customer deleted successfully:", response);
        this.readCustomers();
      },
      error: (error) => console.error("Error deleting customer:", error)
    });
  }

  readCustomers(): void {
    this.httpClient.get(`${this.appConfig.getApiUrl()}/customers`).subscribe({
      next: (response: any) => {
        this.customerObservable.next(response.data);
        console.log("Customers loaded:", response);
      },
      error: (error) => console.error("Error loading customers:", error)
    });
  }
}
