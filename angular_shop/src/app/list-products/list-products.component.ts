import {Component, OnInit} from '@angular/core'; // Adaugam OnInit
import {ProductService} from "../services/product.service";
import {MatCardModule} from "@angular/material/card";
import {NgForOf, NgIf, TitleCasePipe, CurrencyPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {OrderService} from "../services/order.service"; // Probabil nu mai e necesar aici, dar il lasam
import {CustomerService} from "../services/customer.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [
    MatCardModule,
    NgForOf,
    MatButtonModule,
    NgIf,
    TitleCasePipe,
    CurrencyPipe
  ],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent implements OnInit { // Implementam OnInit
  isAdmin: boolean = false; // Nu mai este @Input, va fi gestionat intern
  products: Array<any> = [];

  constructor(
    private productService: ProductService,
    private orderService: OrderService, // Pastram pentru compatibilitate, dar ar putea fi eliminat daca nu e folosit
    private customerService: CustomerService,
    private router: Router
  ) {
    // Aici putem initializa produsele, dar isAdmin ar trebui setat in ngOnInit
  }

  ngOnInit(): void {
    // Verificam rolul utilizatorului la initializarea componentei
    const loggedUser = this.customerService.getLoggedUser();
    if (loggedUser && loggedUser.role === 'admin') { // Presupunem ca utilizatorul are o proprietate 'role'
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }

    this.productService.getProductList().subscribe((productList: Array<any>) => {
      this.products = productList;
    });
  }

  onEdit(item: any) {
    // Navigam catre o pagina de editare, de exemplu /product-edit/ID_PRODUS
    // Asigura-te ca ai o ruta configurata pentru 'product-edit/:id'
    this.router.navigate(['/', 'product-edit', item.id]);
  }

  onDelete(item: any) {
    console.log("Attempting to delete product:", item);
    // Aici ar trebui sa adaugi o confirmare inainte de stergere, nu un alert!
    // Exemplu simplu pentru moment:
    if (confirm("Esti sigur ca vrei sa stergi acest produs?")) { // Foloseste un modal custom in loc de confirm() in aplicatii reale
      this.productService.deleteProduct(item);
      // Optional: reincarca lista de produse sau actualizeaza-o local
      this.productService.getProductList().subscribe((productList: Array<any>) => {
        this.products = productList;
      });
    }
  }

  onBuy(item: any) {
    if (this.customerService.getLoggedUser() == null) {
      // Afiseaza un mesaj intr-un modal custom, nu alert()
      alert("Utilizatorul nu este logat, trebuie sa te loghezi inainte sa adaugi produse in cos");
      this.router.navigate(["/", "auth"]);
    } else {
      this.router.navigate(['/', 'product-details', item.id]);
    }
  }
}
