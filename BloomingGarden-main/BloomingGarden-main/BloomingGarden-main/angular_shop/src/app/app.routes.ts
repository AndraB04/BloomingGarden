import {Routes} from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {HomeComponent} from "./home/home.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AuthGuard} from "./auth/auth.guard";
import {CustomersManagerComponent} from "./dashboard/customers-manager/customers-manager.component";
import {OrdersManagerComponent} from "./dashboard/orders-manager/orders-manager.component";
import {ProductsManagerComponent} from "./dashboard/products-manager/products-manager.component";
import {ProductDetailsComponent} from "./product-details/product-details.component";


export const routes: Routes = [
  {
    path: "auth", component: AuthComponent,
  },
  {
    path: "home", component: HomeComponent,
  },
  {
    path:'product-details/:id', component: ProductDetailsComponent
  },
  {
    path: "dashboard", children: [
      {path: '', component: DashboardComponent},
      {path: 'customers-manager', component: CustomersManagerComponent},
      {path: 'orders-manager', component: OrdersManagerComponent},
      {path: 'products-manager', component: ProductsManagerComponent},
    ],
    canActivate: [AuthGuard]
  },

  {
    path: "", redirectTo: "home", pathMatch: "full"
  }
];
