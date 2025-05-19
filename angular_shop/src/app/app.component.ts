// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigurationsService } from './services/configurations.service';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    ToolbarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  showSidebar: boolean = false;
  appName: string = '';
  appLogo: string | null = null;
  appOwner: string | null = null;
  loggedInUser: User | null = null; // Folosește interfața User
  isAdmin: boolean = false;
  toolbarColor: string = '#9B9B7A';
  currentYear: number = new Date().getFullYear();
  private authSubscription: Subscription | undefined; // Fă-l private

  constructor(
    public appConfig: ConfigurationsService,
    private authService: AuthService, // INJECTEAZĂ AuthService corectat
    private router: Router
  ) {
    this.appName = this.appConfig.getAppName();
    this.appLogo = this.appConfig.getAppLogo();
    this.appOwner = this.appConfig.getAppOwner();
  }

  ngOnInit(): void {
    // Acum authService.authStateChanged$ va exista și va emite starea utilizatorului
    this.authSubscription = this.authService.authStateChanged$.subscribe((user) => {
      console.log('AppComponent received user from AuthService:', user);
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
    console.log(
      'AppComponent isAdmin updated:', this.isAdmin,
      'based on userRole:', this.loggedInUser?.userRole,
      'User object:', this.loggedInUser
    );
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  goToDashboard(): void {
    this.router.navigate(['/', 'dashboard']);
    this.closeSidebar();
  }

  logOut(): void {
    this.authService.logout(); // Apelează logout pe AuthService
    // Subscripția la authStateChanged$ se va ocupa de actualizarea loggedInUser și isAdmin
    this.router.navigate(['/', 'auth']);
    this.closeSidebar();
  }
}
