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
import { AuthService, User } from './services/auth.service'; // Asigură-te că User și AuthService sunt importate corect

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // CommonModule este necesar pentru directive ca *ngIf, *ngFor
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
  loggedInUser: User | null = null;
  isAdmin: boolean = false;
  toolbarColor: string = '#9B9B7A'; // Sau preia din configurations
  currentYear: number = new Date().getFullYear();
  private authSubscription: Subscription | undefined;

  constructor(
    public appConfig: ConfigurationsService, // Presupunând că este folosit în template
    private authService: AuthService,
    private router: Router
  ) {
    this.appName = this.appConfig.getAppName();
    this.appLogo = this.appConfig.getAppLogo();
    this.appOwner = this.appConfig.getAppOwner();
    // this.toolbarColor = this.appConfig.getToolbarColor(); // Dacă ai o astfel de metodă
  }

  ngOnInit(): void {
    // --- MODIFICAREA CHEIE AICI ---
    // Schimbă authStateChanged$ în currentUser$
    this.authSubscription = this.authService.currentUser$.subscribe((user: User | null) => {
      console.log('AppComponent - currentUser$ emitted:', user);
      this.loggedInUser = user;
      this.updateIsAdmin(); // Actualizează starea de admin
      // Dacă utilizatorul este null (delogat), sidebar-ul ar trebui probabil ascuns
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

  updateIsAdmin(): void {
    this.isAdmin = !!this.loggedInUser && this.loggedInUser.userRole === 'ADMIN'; // Verificare mai sigură
    console.log(
      'AppComponent - isAdmin updated:', this.isAdmin,
      'based on userRole:', this.loggedInUser?.userRole
    );
  }

  toggleSidebar(): void {
    // Poate vrei să permiți deschiderea sidebar-ului doar dacă utilizatorul e logat
    if (this.loggedInUser) {
      this.showSidebar = !this.showSidebar;
    } else {
      this.showSidebar = false; // Asigură-te că e închis dacă nu e nimeni logat
    }
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }

  goToDashboard(): void {
    if (this.isAdmin) { // Permite doar dacă e admin
      this.router.navigate(['/dashboard']); // Calea corectă pentru dashboard
    }
    this.closeSidebar();
  }

  logOut(): void {
    this.authService.logOut(); // Metoda logOut din AuthService se ocupă de ștergerea datelor și redirect
    // this.router.navigate(['/auth']); // Nu mai e necesar aici, AuthService.logOut() o face
    this.closeSidebar(); // Asigură-te că sidebar-ul se închide la logout
    // loggedInUser și isAdmin vor fi actualizate automat prin subscripția la currentUser$
  }
}
