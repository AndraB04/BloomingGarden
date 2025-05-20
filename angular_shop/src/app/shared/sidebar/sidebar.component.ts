import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
// MatCardModule nu mai este strict necesar pentru meniu, dar îl lăsăm dacă e folosit de `mat-drawer` implicit.
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
  @Output() logOut = new EventEmitter<void>(); // Va gestiona atât login (dacă user e null) cât și logout
  @Output() navigateTo = new EventEmitter<string>(); // NOU: Pentru link-uri generice

  @Input() open: boolean = false;
  // Asigură-te că această cale este corectă pentru logo-ul tău
  @Input() appLogo: string | null = 'assets/images/default-logo.svg'; // Exemplu: 'assets/logo-ec.png'
  @Input() appOwner: string | null = 'Blooming Garden';
  @Input() loggedInUser: any = null;
  @Input() isAdmin: boolean = false;

  constructor() { }

  handleNavigation(routeKey: string): void {
    this.navigateTo.emit(routeKey);
    this.closeSidebar.emit();
  }

  handleDashboardClick(): void {
    this.goToDashboard.emit();
    this.closeSidebar.emit();
  }

  handleLogOutClick(): void {
    this.logOut.emit();
    this.closeSidebar.emit();
  }
}
