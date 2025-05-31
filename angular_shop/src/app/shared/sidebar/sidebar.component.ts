// src/app/sidebar/sidebar.component.ts
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatSidenavModule, MatButtonModule, MatIconModule, MatCardModule, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() goToDashboard = new EventEmitter<void>();
  @Output() logOut = new EventEmitter<void>();
  @Output() navigateTo = new EventEmitter<string>(); // Acesta este EventEmitter-ul principal pentru navigare

  @Input() open: boolean = false;
  @Input() appLogo: string | null = 'assets/images/default-logo.svg';
  @Input() appOwner: string | null = 'Blooming Garden';
  @Input() loggedInUser: any = null;
  @Input() isAdmin: boolean = false;

  constructor() { }

  // Această metodă gestionează toate navigările din sidebar
  handleNavigation(routeKey: string): void {
    this.navigateTo.emit(routeKey); // Emite 'home', 'products', etc.
    this.closeSidebar.emit();
  }

  handleDashboardClick(): void {
    this.goToDashboard.emit(); // Asta e bine să rămână separat dacă logica e diferită de un simplu navigate
    this.closeSidebar.emit();
  }

  handleLogOutClick(): void {
    this.logOut.emit();
    this.closeSidebar.emit();
  }
}
