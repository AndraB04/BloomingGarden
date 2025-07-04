// home.component.ts

import { Component } from '@angular/core';
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { Router } from "@angular/router";
import { ListProductsComponent } from "../list-products/list-products.component";
import { CartButtonComponent } from "./cart-button/cart-button.component";
import { CustomerService } from "../services/customer.service";
import { NewsletterSubscriptionComponent } from '../shared/newsletter-subscription/newsletter-subscription.component';
import { NgFor, NgIf } from "@angular/common";
import { ConfigurationsService } from "../services/configurations.service";

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
    NewsletterSubscriptionComponent,
    NgIf,
    NgFor
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  banners = [
    {
      imageUrl: 'https://chauvinparis.com/wp-content/uploads/2020/11/0647.jpg',
      redirectUrl: '/products',
      buttonText: 'Shop Now'
    },
    {
      imageUrl: 'https://images.squarespace-cdn.com/content/v1/5a6a90197131a5be62ea265b/1579750697481-O6T7MS06PUPRAF5MMGFH/florist+near+me+new+orleans+mitchs+flowers+stephanie+tarrant+monique+chauvin+baby+shower+flowers.jpg',
      redirectUrl: this.getAuthUrl(),
      buttonText: this.getAuthButtonText()
    }
  ];

  private getAuthUrl(): string {
    return this.customerService.getLoggedUser() ? '/account' : '/auth';
  }

  private getAuthButtonText(): string {
    return this.customerService.getLoggedUser() ? 'My Account' : 'Create an Account';
  }

  constructor(
    public appConfig: ConfigurationsService,
    private router: Router,
    public customerService: CustomerService
  ) {}

  isUserAdmin(): boolean { // Add return type for clarity
    const loggedUser = this.customerService.getLoggedUser(); // Store the result in a variable
    if (loggedUser != null && loggedUser.userRole == "ADMIN") {
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
