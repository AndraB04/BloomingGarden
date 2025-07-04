import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

import { ConfigurationsService } from './services/configurations.service';
import { AuthService, User } from './services/auth.service';
import { NewsletterService } from './services/newsletter.service';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { ToolbarComponent } from './shared/toolbar/toolbar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
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
  toolbarColor: string = '';

  loggedInUser: User | null = null;
  isAdmin: boolean = false;
  currentYear: number = new Date().getFullYear();

  private authSubscription: Subscription | undefined;

  constructor(
    public appConfig: ConfigurationsService,
    private authService: AuthService,
    private router: Router,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {
    this.appName = this.appConfig.getAppName();
    this.appLogo = this.appConfig.getAppLogo();
    this.appOwner = this.appConfig.getAppOwner();

    // Register SVG icons
    this.matIconRegistry.addSvgIcon(
      'instagram-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/instagram.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'facebook-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/facebook.svg')
    );
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      this.loggedInUser = user;
      this.updateIsAdminStatus();
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

  goToProducts(): void{
    this.router.navigate(['/products']);
  }

  onNavigateToHomeRequested(): void { // <<--- NOUA METODĂ
    console.log('AppComponent: Navigating to home page requested from toolbar.');
    this.router.navigate(['/home']);
    this.closeSidebar(); // Opcional, dacă sidebar-ul ar putea fi deschis
  }

  logOut(): void {
    this.authService.logOut();
    this.closeSidebar();
  }

  navigateTo(path: string): void {
    if (path) {
      this.router.navigate([path]);
      this.closeSidebar(); // Dacă este apelat din sidebar, închide-l
    }
  }
  onSubscribeNewsletter(formValue?: { email: string }): void {
    if (formValue && formValue.email) {
      console.log('Newsletter subscription email:', formValue.email);
      this.newsletterService.subscribe(formValue.email).subscribe({
        next: () => {
          this.snackBar.open('Successfully subscribed to newsletter!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Newsletter subscription error:', error);
          const message = error?.message || 'Failed to subscribe. Please try again.';
          this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      console.error('Newsletter form submitted without a valid email.');
      this.snackBar.open('Please enter a valid email address', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onNavigateToRequested(route: string): void {
    console.log('Navigating to:', route); // Pentru debug
    this.router.navigate([`/${route}`]);
    this.closeSidebar(); // Închide sidebar-ul după navigare
  }
}
