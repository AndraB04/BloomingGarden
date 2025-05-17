import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigurationsService } from './services/configurations.service';
import { CustomerService } from './services/customer.service';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthComponent } from './auth/auth.component'; // Import AuthComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    ToolbarComponent,
    CommonModule,
    AuthComponent, // Keep AuthComponent in imports
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [AuthComponent], // Explicitly provide AuthComponent
})
export class AppComponent implements OnInit, OnDestroy {
  showSidebar: boolean = false;
  appName: string = '';
  appLogo: string | null = null;
  appOwner: string | null = null;
  loggedInUser: any = null;
  isAdmin: boolean = false;
  toolbarColor: string = '#9B9B7A';
  currentYear: number = new Date().getFullYear();
  authSubscription: Subscription | undefined;

  constructor(
    public appConfig: ConfigurationsService,
    private authComponent: AuthComponent, // Inject AuthComponent
    private router: Router
  ) {
    this.appName = this.appConfig.getAppName();
    this.appLogo = this.appConfig.getAppLogo();
    this.appOwner = this.appConfig.getAppOwner();
    this.authComponent.getLoggedUser().subscribe(user => {
      this.loggedInUser = user;
      this.updateIsAdmin();
    });
    this.updateIsAdmin(); // Initial check
  }

  ngOnInit(): void {
    this.authSubscription = this.authComponent.onAuthStateChanged().subscribe((user) => {
      console.log('AppComponent received user:', user); // ADD THIS LINE
      this.loggedInUser = user;
      this.updateIsAdmin();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  updateIsAdmin(): void {
    this.isAdmin = this.loggedInUser?.userRole === 'ADMIN';
    console.log('AppComponent isAdmin updated:', this.isAdmin);
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
    console.log('showSidebar:', this.showSidebar);
  }

  closeSidebar(): void {
    this.showSidebar = false;
    console.log('closeSidebar called, showSidebar:', this.showSidebar);
  }

  goToDashboard(): void {
    this.router.navigate(['/', 'dashboard']);
    this.showSidebar = false;
    console.log('goToDashboard called');
  }

  logOut(): void {
    this.authComponent.logout();
    this.loggedInUser = null;
    this.updateIsAdmin();
    this.router.navigate(['/', 'auth']);
    this.showSidebar = false;
    console.log('logOut called');
  }
}
