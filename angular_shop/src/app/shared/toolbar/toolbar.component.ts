import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartButtonComponent } from '../../home/cart-button/cart-button.component';
import { ConfigurationsService } from '../../services/configurations.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, CartButtonComponent, RouterModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() appName: string = '';
  @Input() toolbarColor: string = '#9B9B7A';
  @Output() navigateToHome = new EventEmitter<void>();

  constructor() { }
  onAppNameClick(): void {
    console.log('Toolbar: App name clicked, emitting navigateToHome event.'); // Pentru debugging
    this.navigateToHome.emit();
  }
}
