// src/app/checkout/checkout.component.ts

import { Component, OnInit } from '@angular/core';
// Import AbstractControl AICI!
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { CartItem } from '../models/cart-item';
// Importă CardDetails și CheckoutRequest
import { CheckoutRequest, CheckoutItemDto, OrderResponse, CardDetails } from '../models/checkout';

@Component({
  selector: 'app-checkout',
  standalone: true,
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

  countries: string[] = ['Romania', 'Germania', 'Franța', 'Spania', 'Italia', 'Polonia', 'Ungaria', 'Marea Britanie', 'Statele Unite', 'Canada'];

  shippingAddressStates: string[] = []; // Unused field warning - OK if needed later
  billingAddressStates: string[] = []; // Unused field warning - OK if needed later

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

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
    this.populateCreditCardMonthsAndYears();

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
        paymentMethod: ['cash', Validators.required],
        creditCard: this.formBuilder.group({
          cardNumber: ['', [Validators.required, Validators.pattern('[0-9]{16}')]],
          expirationMonth: ['', Validators.required],
          expirationYear: ['', Validators.required],
          cvc: ['', [Validators.required, Validators.pattern('[0-9]{3,4}')]],
          cardholderName: ['', Validators.required]
        })
      })
    });

    // Cast to FormGroup before disabling
    (this.checkoutFormGroup.get('payment.creditCard') as FormGroup).disable();

    this.reviewCartDetails();

    // Abonează-te la schimbările metodei de plată
    this.checkoutFormGroup.get('payment.paymentMethod')!.valueChanges.subscribe(
      value => this.onPaymentMethodChange(value)
    );
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

    this.cartService.computeCartTotals();
  }

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      console.log('Formular invalid. Marchează câmpurile atinse.');
      this.checkoutFormGroup.markAllAsTouched();
      // Marchează manual controalele din grupul creditCard dacă este activ și invalid
      const creditCardGroup = this.checkoutFormGroup.get('payment.creditCard');
      if (creditCardGroup?.enabled && creditCardGroup?.invalid) {
        (creditCardGroup as FormGroup).markAllAsTouched(); // Cast pentru a folosi markAllAsTouched pe FormGroup
      }
      return;
    }

    const customer = this.checkoutFormGroup.get('customer')!.value;
    const shippingAddress = this.checkoutFormGroup.get('shippingAddress')!.value;
    const billingAddress = this.checkoutFormGroup.get('billingAddress')!.value;
    const paymentMethod = this.checkoutFormGroup.get('payment.paymentMethod')!.value;

    let cardDetails: CardDetails | undefined = undefined;
    if (paymentMethod === 'card') {
      // Cast la FormGroup pentru a prelua valoarea corect tipată
      cardDetails = (this.checkoutFormGroup.get('payment.creditCard') as FormGroup).value as CardDetails;
    }

    let orderItems: CheckoutItemDto[] = this.cartItems.map(
      item => ({ productId: item.id, quantity: item.quantity } as CheckoutItemDto)
    );

    // Obiectul checkoutRequest va corespunde acum cu interfața actualizată din models/checkout.ts
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
      paymentMethod: paymentMethod,
      cardDetails: cardDetails // Adăugăm detaliile cardului (va fi undefined dacă paymentMethod e 'cash')
    };

    console.log("Checkout Request:", checkoutRequest);

    this.checkoutService.placeOrder(checkoutRequest).subscribe({
      next: (response: OrderResponse) => {
        alert(`Comanda plasată cu succes!\nNumăr de urmărire: ${response.orderTrackingNumber}`);
        this.cartService.clearCart();
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
    const billingAddressFormGroup = this.checkoutFormGroup.get('billingAddress') as FormGroup; // Cast aici
    const shippingAddressValue = this.checkoutFormGroup.get('shippingAddress')!.value;

    if (isChecked) {
      billingAddressFormGroup.enable(); // Asigură-te că e activ înainte de setValue
      billingAddressFormGroup.setValue(shippingAddressValue);
      billingAddressFormGroup.disable();
    } else {
      billingAddressFormGroup.reset();
      billingAddressFormGroup.enable();
    }
  }

  getStates(formGroupName: string) {
    const countryControl = this.checkoutFormGroup.get(`${formGroupName}.country`);
    console.log(`Country changed to ${countryControl?.value} for ${formGroupName}.`);

    // Implementează logica pentru a încărca județele/stările bazat pe țară
    // ...
  }

  hasError(formGroupName: string, controlName: string): boolean {
    const control = this.checkoutFormGroup.get(formGroupName + '.' + controlName);
    return control != null && control.invalid && (control.dirty || control.touched);
  }

  get paymentMethodControl(): AbstractControl | null {
    return this.checkoutFormGroup.get('payment.paymentMethod');
  }

  // Implementarea logică pentru onPaymentMethodChange
  onPaymentMethodChange(selectedMethod: string): void { // Adăugat tipul de retur void
    console.log('Metoda de plată selectată:', selectedMethod);
    // Cast la FormGroup
    const creditCardFormGroup = this.checkoutFormGroup.get('payment.creditCard') as FormGroup;

    if (selectedMethod === 'card') {
      creditCardFormGroup.enable();
      // Iterează peste controalele grupului de tip FormGroup
      Object.keys(creditCardFormGroup.controls).forEach(key => {
        const control = creditCardFormGroup.get(key);
        if (control) {
          const initialValidators = this.getInitialCreditCardValidators(key);
          control.setValidators(initialValidators);
          control.updateValueAndValidity();
        }
      });
    } else {
      creditCardFormGroup.disable();
      creditCardFormGroup.reset();
      // Iterează peste controalele grupului de tip FormGroup
      Object.keys(creditCardFormGroup.controls).forEach(key => {
        const control = creditCardFormGroup.get(key);
        if (control) {
          const nonRequiredValidators = this.getNonRequiredCreditCardValidators(key);
          control.setValidators(nonRequiredValidators);
          control.updateValueAndValidity();
        }
      });
    }
  }

  // Metodă ajutătoare pentru a obține validatorii inițiali ai câmpurilor cardului
  private getInitialCreditCardValidators(controlName: string): any {
    switch (controlName) {
      case 'cardNumber': return [Validators.required, Validators.pattern('[0-9]{16}')];
      case 'expirationMonth': return [Validators.required];
      case 'expirationYear': return [Validators.required];
      case 'cvc': return [Validators.required, Validators.pattern('[0-9]{3,4}')];
      case 'cardholderName': return [Validators.required];
      default: return null;
    }
  }

  // Metodă ajutătoare pentru a obține validatorii non-required ai câmpurilor cardului
  private getNonRequiredCreditCardValidators(controlName: string): any {
    switch (controlName) {
      case 'cardNumber': return [Validators.pattern('[0-9]{16}')];
      case 'cvc': return [Validators.pattern('[0-9]{3,4}')];
      default: return null;
    }
  }

  populateCreditCardMonthsAndYears() {
    for (let month = 1; month <= 12; month++) {
      this.creditCardMonths.push(month);
    }

    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 15;

    for (let year = currentYear; year <= endYear; year++) {
      this.creditCardYears.push(year);
    }
  }

  // Metodă pentru a gestiona schimbarea anului
  handleYearChange(): void { // Adăugat tipul de retur void
    // Cast to AbstractControl to safely access .value and .setValue
    const yearControl = this.checkoutFormGroup.get('payment.creditCard.expirationYear') as AbstractControl;
    const monthControl = this.checkoutFormGroup.get('payment.creditCard.expirationMonth') as AbstractControl;

    const selectedYear = yearControl.value;
    const currentYear = new Date().getFullYear();

    let startMonth: number;

    if (selectedYear === currentYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.creditCardMonths = [];
    for (let month = startMonth; month <= 12; month++) {
      this.creditCardMonths.push(month);
    }

    // Resetăm luna dacă valoarea selectată anterior nu mai este validă
    if (monthControl.value !== '' && !this.creditCardMonths.includes(monthControl.value)) {
      monthControl.setValue('');
    }
  }
}
