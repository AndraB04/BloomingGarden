import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import {CustomerService} from "../../services/customer.service";
import {NgIf} from "@angular/common";


@Component({
  selector: 'app-add-edit-customer',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    NgIf
  ],
  templateUrl: './add-edit-customer.component.html',
  styleUrl: './add-edit-customer.component.css'
})
export class AddEditCustomerComponent implements OnChanges {
  @Input("customer") customer: any;

  id: string = "";
  name = new FormControl('', [Validators.required]);
  email = new FormControl('', [Validators.required]);
  address = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  userRole = new FormControl('', [Validators.required]);
  phone = new FormControl('', [Validators.required]);


  constructor(private customerService: CustomerService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(this.customer);
    if (this.customer != null) {
      this.id = this.customer.id;
      this.name = new FormControl(this.customer.name, [Validators.required]);
      this.email = new FormControl(this.customer.email, [Validators.required]);
      this.address = new FormControl(this.customer.address, [Validators.required]);
      this.password = new FormControl(this.customer.password, [Validators.required]);
      this.userRole = new FormControl(this.customer.userRole, [Validators.required]);
      this.phone = new FormControl(this.customer.phone, [Validators.required]);
    }
  }

  getErrorMessage(input: FormControl): string {
    if (input.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }

  onSave(): void {
    let customerData = {
      id: this.id,
      name: this.name.getRawValue()!,
      email: this.email.getRawValue()!,
      address: this.address.getRawValue()!,
      password: this.password.getRawValue()!,
      phone: this.phone.getRawValue()!,
      userRole: this.userRole.getRawValue()!
    };
    console.log(customerData);
    if (customerData.id == "") {
      this.customerService.createCustomer(customerData);
    } else {
      this.customerService.updateCustomer(customerData);
    }
    this.resetForm();
  }

  resetForm() {
    this.customer = null;
    this.id = "";
    this.name = new FormControl('', [Validators.required]);
    this.email = new FormControl('', [Validators.required]);
    this.address = new FormControl('', [Validators.required]);
    this.phone = new FormControl('', [Validators.required]);
    this.password = new FormControl('', [Validators.required]);
    this.userRole = new FormControl('', [Validators.required]);
  }
}

