import { Component, OnInit } from '@angular/core';
import {AddEditCustomerComponent} from "../add-edit-customer/add-edit-customer.component";
import {AddEditProductComponent} from "../add-edit-product/add-edit-product.component";
import {ListCustomersComponent} from "../list-customers/list-customers.component";
import {ListOrdersComponent} from "../list-orders/list-orders.component";
import {ListProductsComponent} from "../../list-products/list-products.component";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {ConfigurationsService} from "../../services/configurations.service";
import {Router, ActivatedRoute} from "@angular/router";
import {ProductService} from '../../services/product.service';

@Component({
  selector: 'app-rooms-manager',
  standalone: true,
    imports: [
        AddEditCustomerComponent,
        AddEditProductComponent,
        ListCustomersComponent,
        ListOrdersComponent,
        ListProductsComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatSidenavModule,
        MatToolbarModule
    ],
  templateUrl: './products-manager.component.html',
  styleUrl: './products-manager.component.css'
})
export class ProductsManagerComponent implements OnInit {
  productData: any;

  constructor(
    public appConfig: ConfigurationsService,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.productService.getProductById(productId).subscribe((response: any) => {
          if (response && response.data) {
            this.productData = response.data;
          }
        });
      }
    });
  }

  onChangeRoom(product: any) {
    this.productData = product;
  }

  onHome() {
    this.router.navigate(['/', 'home']);
  }

  onDashboard() {
    this.router.navigate(['/', 'dashboard']);
  }

  onLogOut() {
    this.router.navigate(['/', 'auth']);
  }
}
