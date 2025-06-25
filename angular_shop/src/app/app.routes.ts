// src/app/app.routes.ts
import {Routes} from '@angular/router';
import {AuthComponent} from "./auth/auth.component";
import {HomeComponent} from "./home/home.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {AuthGuard} from "./auth/auth.guard";
import {CustomersManagerComponent} from "./dashboard/customers-manager/customers-manager.component";
import {OrdersManagerComponent} from "./dashboard/orders-manager/orders-manager.component";
import {ProductsManagerComponent} from "./dashboard/products-manager/products-manager.component";
import {ProductDetailsComponent} from "./product-details/product-details.component";
import { ListProductsComponent } from './list-products/list-products.component';
import { NewsletterManagerComponent } from './dashboard/newsletter-manager/newsletter-manager.component';
import { EmailSettingsComponent } from './preferences/email-settings/email-settings.component';
import { UnsubscribeComponent } from './shared/unsubscribe/unsubscribe.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';



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
    path: 'product-edit/:id',
    component: ProductsManagerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'newsletter-manager',
    component: NewsletterManagerComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'preferences/email-settings',
    component: EmailSettingsComponent
  },
  {
    path: 'unsubscribe',
    component: UnsubscribeComponent,
    data: { title: 'Unsubscribe from Newsletter' }
  },
  {
    path: 'subscribe',
    redirectTo: '/preferences/email-settings',
    pathMatch: 'full'
  },
  {
    path: 'products',
    component: ListProductsComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'order-confirmation/:orderTrackingNumber',
    component: OrderConfirmationComponent
  },
  {
    path: "dashboard", children: [
      {path: '', component: DashboardComponent},
      {path: 'customers-manager', component: CustomersManagerComponent},
      {path: 'orders-manager', component: OrdersManagerComponent},
      {path: 'products-manager', component: ProductsManagerComponent},
      {path: 'newsletter-manager', component: NewsletterManagerComponent},
    ],
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
];
