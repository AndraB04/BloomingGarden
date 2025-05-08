import { Component } from '@angular/core';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {Router} from "@angular/router";
import {ListProductsComponent} from "../list-products/list-products.component";
import {CartButtonComponent} from "./cart-button/cart-button.component";
import {CustomerService} from "../services/customer.service";
import {NgFor, NgIf} from "@angular/common";
import {ConfigurationsService} from "../services/configurations.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    CartButtonComponent,
    NgIf,
    NgFor

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  banners = [
    {
      imageUrl: 'https://i.pinimg.com/736x/70/6c/92/706c9219f11f0eef6671126929e5e5b0.jpg',
      redirectUrl: '/products',
      buttonText: 'Shop Now'
    },
    {
      imageUrl: 'https://i.pinimg.com/736x/c9/e2/1a/c9e21a41c9eb47a538b403e9d5ba392e.jpg',
      redirectUrl: '/auth',
      buttonText: 'Create an account'
    }
  ];

  constructor(
    public appConfig: ConfigurationsService,
    private router: Router,
    public customerService: CustomerService
  ) {}
  isUserAdmin(){
    if(this.customerService.getLoggedUser() != null && this.customerService.getLoggedUser().userRole == "ADMIN"){
      return true;
    }
    return false;

  }
  public currentYear: number = new Date().getFullYear();

  onDashboard(){
    this.router.navigate(['/','dashboard']);
  }
  onLogOut(){
    this.router.navigate(['/','auth']);
  }
  navigateTo(url: string) {
    this.router.navigate([url]);
  }

}
