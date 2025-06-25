// src/app/checkout/checkout.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { CartItem } from '../models/cart-item';
import { CheckoutRequest, CheckoutItemDto, OrderResponse } from '../models/checkout';

@Component({
  selector: 'app-checkout',
  // Marchează componenta ca standalone
  standalone: true,
  // Importă modulele necesare direct
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule

  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {


  checkoutFormGroup!: FormGroup;
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  shippingAddressStates: string[] = [];
  billingAddressStates: string[] = [];

  paymentMethods: any[] = [
    { id: 'cash', name: 'Plată la livrare (Cash)' },
    { id: 'card', name: 'Plată cu cardul' }
  ];


  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),
      shippingAddress: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required],
        country: ['Romania', Validators.required]
      }),
      billingAddress: this.formBuilder.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zipCode: ['', Validators.required],
        country: ['Romania', Validators.required]
      }),
      payment: this.formBuilder.group({
        paymentMethod: ['cash', Validators.required]
      })
    });

    this.reviewCartDetails();
  }

  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

    this.cartService.cartItems.subscribe(
      items => this.cartItems = items
    );

    this.cartService.computeCartTotals(); // Presupune că CartService are această metodă
  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    const customer = this.checkoutFormGroup.get('customer')!.value;
    const shippingAddress = this.checkoutFormGroup.get('shippingAddress')!.value;
    const billingAddress = this.checkoutFormGroup.get('billingAddress')!.value;
    const paymentMethod = this.checkoutFormGroup.get('payment.paymentMethod')!.value;

    let orderItems: CheckoutItemDto[] = this.cartItems.map(
      item => ({ productId: item.id, quantity: item.quantity } as CheckoutItemDto)
    );

    const checkoutRequest: CheckoutRequest = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      shippingStreet: shippingAddress.street,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state,
      shippingZipCode: shippingAddress.zipCode,
      shippingCountry: shippingAddress.country,
      billingStreet: billingAddress.street,
      billingCity: billingAddress.city,
      billingState: billingAddress.state,
      billingZipCode: billingAddress.zipCode,
      billingCountry: billingAddress.country,
      orderItems: orderItems,
      paymentMethod: paymentMethod
    };

    console.log("Checkout Request:", checkoutRequest);

    this.checkoutService.placeOrder(checkoutRequest).subscribe({
      next: (response: OrderResponse) => {
        alert(`Comandă plasată cu succes!\nNumăr de urmărire: ${response.orderTrackingNumber}`); // Corectează typo-ul 'Comandă', 'plasată'
        this.cartService.clearCart(); // Presupune că CartService are această metodă
        this.router.navigate(['/order-confirmation', response.orderTrackingNumber]);
      },
      error: (err: any) => {
        alert(`A apărut o eroare la plasarea comenzii: ${err.message}`);
        console.error("Order placement error:", err);
      }
    });
  }

  copyShippingAddressToBillingAddress(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      // Folosește ! după get() dacă ești sigur că sub-formularul există
      this.checkoutFormGroup.get('billingAddress')!.setValue(
        this.checkoutFormGroup.get('shippingAddress')!.value
      );
      this.checkoutFormGroup.get('billingAddress')!.disable(); //foloseste ! daca nu mrrge
    } else {
      this.checkoutFormGroup.get('billingAddress')!.reset();
      this.checkoutFormGroup.get('billingAddress')!.enable();
    }
  }

  getStates(formGroupName: string) {
    // Placeholder - implement logic to load states
  }

  hasError(formGroupName: string, controlName: string): boolean {
    const control = this.checkoutFormGroup.get(formGroupName + '.' + controlName);
    return control != null && control.invalid && control.touched;
  }

  get paymentMethodControl() {
    return this.checkoutFormGroup.get('payment.paymentMethod'); // Acesta poate fi null/undefined dacă paymentMethod nu există, deci getter-ul e ok
  }

  onPaymentMethodChange() {
  }
}
