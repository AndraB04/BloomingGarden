import {Component, EventEmitter, Output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {NgForOf, NgIf} from "@angular/common";
import {CustomerService} from "../../services/customer.service";

@Component({
  selector: 'app-list-customers',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.css'
})
export class ListCustomersComponent {
  @Output() changeCustomerData: EventEmitter<any> = new EventEmitter<any>();

  customers: Array<any> = [];

  constructor(private customerService: CustomerService) {
    this.customerService.getCustomerList().subscribe((customerList: Array<any>) => {
      this.customers = customerList;
    })
  }

  onEdit(customer: any) {
    this.changeCustomerData.emit(customer);
  }

  onDelete(customer: any) {
    this.customerService.deleteCustomer(customer)
  }

}
