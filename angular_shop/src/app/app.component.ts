// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ConfigurationsService } from './services/configurations.service';
import { AuthService, User } from './services/auth.service';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
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
  toolbarColor: string = ''; // Inițializează cu o valoare default sau preia din config

  loggedInUser: User | null = null;
  isAdmin: boolean = false;
  currentYear: number = new Date().getFullYear();

  private authSubscription: Subscription | undefined;

  constructor(
    public appConfig: ConfigurationsService, // Public dacă e folosit direct în template
    private authService: AuthService,
    private router: Router
  ) {
    this.appName = this.appConfig.getAppName();
    this.appLogo = this.appConfig.getAppLogo();
    this.appOwner = this.appConfig.getAppOwner();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      console.log('AppComponent - User state changed:', user);
      this.loggedInUser = user;
      this.updateIsAdminStatus(); // Actualizează isAdmin pe baza noului user

      // Închide sidebar-ul dacă utilizatorul se deloghează
      if (!user) {
        this.showSidebar = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateIsAdminStatus(): void {
    this.isAdmin = !!this.loggedInUser && this.loggedInUser.userRole === 'ADMIN';
    console.log(`AppComponent - isAdmin: ${this.isAdmin}, Role: ${this.loggedInUser?.userRole}`);
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  goToDashboard(): void {
    if (this.isAdmin) {
      this.router.navigate(['/dashboard']);
    }
    this.closeSidebar();
  }

  logOut(): void {
    this.authService.logOut();
  }
}
