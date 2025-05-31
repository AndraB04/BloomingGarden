import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ProductService } from "../services/product.service";
import { MatCardModule } from "@angular/material/card";
import { NgForOf, NgIf, TitleCasePipe, CurrencyPipe } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { OrderService } from "../services/order.service";
import { CustomerService } from "../services/customer.service";
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { User } from '../services/auth.service';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [
    MatCardModule,
    NgForOf,
    MatButtonModule,
    NgIf,
    TitleCasePipe,

  ],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent implements OnInit, OnDestroy {
  @Output() changeData = new EventEmitter<any>();

  isAdmin: boolean = false;
  loggedInUser: User | null = null;

  products: Array<any> = [];

  private isAdminSubscription: Subscription | undefined;
  private loggedUserSubscription: Subscription | undefined;
  private productsSubscription: Subscription | undefined;


  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private router: Router
  ) {

    console.log("[ListProductsComponent Ctor] Component created.");
  }

  ngOnInit(): void {
    console.log("[ListProductsComponent OnInit] Initializing component...");

    // Abonare la starea de admin
    this.isAdminSubscription = this.customerService.getIsAdminObservable().subscribe(
      (isAdminStatus: boolean) => {
        this.isAdmin = isAdminStatus;
        console.log("[ListProductsComponent] isAdmin status updated via Observable:", this.isAdmin);
      }
    );

    // Abonare la starea utilizatorului logat
    this.loggedUserSubscription = this.customerService.loggedUser$.subscribe(
      (user: User | null) => {
        this.loggedInUser = user;
        console.log("[ListProductsComponent] loggedInUser updated via Observable:", this.loggedInUser ? this.loggedInUser.email : 'null');
      }
    );

    this.loadProducts();
  }

  ngOnDestroy(): void {
    console.log("[ListProductsComponent OnDestroy] Destroying component. Unsubscribing...");
    if (this.isAdminSubscription) {
      this.isAdminSubscription.unsubscribe();
    }
    if (this.loggedUserSubscription) {
      this.loggedUserSubscription.unsubscribe();
    }
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    this.productsSubscription = this.productService.getProductList().subscribe(
      (productList: Array<any>) => {
        this.products = productList;
        console.log("[ListProductsComponent] Products loaded:", this.products.length);
      },
      (error: any) => {
        console.error("[ListProductsComponent] Error loading products:", error);
      }
    );
  }

  onEdit(item: any) {
    // Presupunând că onEdit va naviga direct, nu va emite la o componentă părinte imediat
    this.router.navigate(['/', 'product-edit', item.id]);
    // this.changeData.emit(item); // Dacă vrei să emită și să navigheze, e ok, dar onEdit e de obicei pentru navigare
  }

  onDelete(item: any) {
    console.log("[ListProductsComponent] Attempting to delete product:", item);
    if (confirm("Ești sigur că vrei să ștergi acest produs?")) {
      // Asigură-te că deleteProduct returnează un Observable
      this.productService.deleteProduct(item.id).subscribe({ // Trimitem doar ID-ul, nu tot obiectul
        next: (response: any) => {
          console.log("[ListProductsComponent] Product deleted successfully!", response);
          this.loadProducts(); // Reîncarcă produsele după ștergere
        },
        error: (error: any) => {
          console.error("[ListProductsComponent] Error deleting product:", error);
          alert("Eroare la ștergerea produsului.");
        }
      });
    }
  }

  onBuy(item: any) {
    if (this.loggedInUser == null) { // Folosește direct this.loggedInUser
      alert("Utilizatorul nu este logat, trebuie sa te loghezi inainte sa adaugi produse in cos");
      this.router.navigate(["/", "auth"]);
    } else {
      this.router.navigate(['/', 'product-details', item.id]);
    }
  }
}
