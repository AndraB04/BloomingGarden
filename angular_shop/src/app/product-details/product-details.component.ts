import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProductService} from "../services/product.service";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {ConfigurationsService} from "../services/configurations.service";
import {CustomerService} from "../services/customer.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {provideNativeDateAdapter} from '@angular/material/core';
import {OrderService} from "../services/order.service";
import {CartService} from "../services/cart.service";
import {CartItem} from "../models/cart-item";
import {CartButtonComponent} from "../home/cart-button/cart-button.component";
import {ListProductsComponent} from "../list-products/list-products.component";

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    NgIf,
    TitleCasePipe,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    CartButtonComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  productData: any = null;
  startDate = new FormControl('', [Validators.required]);
  endDate = new FormControl('', [Validators.required]);
  details = new FormControl('', [Validators.required]);

  data = {}

  constructor(private route: ActivatedRoute, private router: Router, private customerService: CustomerService, private productService: ProductService, public appConfig: ConfigurationsService, private orderService: OrderService, private cartService: CartService) {
  }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let id = params['id'];

      if (id != null) {
        this.productService.getProductById(id).subscribe((response: any) => {
          console.log('ProductDeztailsComponent - getProductById response:', response); // <--- ADD THIS LOG
          if (response && response.data) { // Ensure response and data exist
            this.productData = response.data;
            console.log('ProductDetailsComponent - productData set to:', this.productData); // <--- ADD THIS LOG
          } else {
            console.error('ProductDetailsComponent - getProductById: No data found in response.', response);
          }
        });
      }
      console.log('ProductDetailsComponent - ID from URL:', id);
    });
  }

  isUserAdmin() {
    if (this.customerService.getLoggedUser() != null && this.customerService.getLoggedUser().userRole == "ADMIN") {
      return true;
    }
    return false;

  }

  onDashboard() {
    this.router.navigate(['/', 'dashboard']);
  }

  onHome() {
    this.router.navigate(['/', 'home']);
  }

  onLogOut() {
    this.router.navigate(['/', 'auth']);
  }

  onBuy(): void {
    console.log('ProductDetailsComponent - onBuy: Attempting to add product to cart.');
    console.log('Product Data being added:', this.productData);

    if (this.customerService.getLoggedUser() == null) {
      alert("Utilizatorul nu este logat, trebuie sa te loghezi inainte sa adaugi produse in cos");
      this.router.navigate(["/", "auth"]);
    } else {
      if (this.productData) {
        // Use modern cart service instead of old order service
        const cartItem: CartItem = {
          id: this.productData.id,
          name: this.productData.name || this.productData.title,
          imageUrl: this.productData.image1,
          unitPrice: this.productData.price,
          quantity: 1
        };
        this.cartService.addToCart(cartItem);
        
        // Show success message and navigate to cart or stay on page
        alert('Product added to cart successfully!');
        // Optionally navigate to checkout or stay on the current page
        // this.router.navigate(['/checkout']);
      } else {
        console.error('ProductDetailsComponent - onBuy: productData is null or undefined!');
        alert('Cannot add to cart: Product details not loaded.');
      }
    }
  }

  getErrorMessage(input: FormControl): string {
    if (input.hasError('required')) {
      return 'You must enter a value';
    }
    return '';
  }

  private parseDate(date: Date) {
    let day = date.getDate();
    let month = date.getMonth() + 1; //lunile anului incep de la 0. Ianuarie=0
    let year = date.getFullYear();
    let dateStr = "";

    dateStr += year;
    dateStr += "-";
    if (month < 10) {
      dateStr += "0" + month;
    } else {
      dateStr += month;
    }
    dateStr += "-";
    if (day < 10) {
      dateStr += "0" + day;
    } else {
      dateStr += day;
    }
    console.log(dateStr);
    return dateStr;
  }
}
