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

  @Input() open: boolean = false;
  @Input() appLogo: string | null = null;
  @Input() appOwner: string | null = null;
  @Input() loggedInUser: any = null; // Consider a more specific type
  @Input() isAdmin: boolean = false;

  constructor() { }
}
