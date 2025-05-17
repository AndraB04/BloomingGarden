import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartButtonComponent } from '../../home/cart-button/cart-button.component';
import { ConfigurationsService } from '../../services/configurations.service'; // You might still inject this if needed for other things in the toolbar

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, CartButtonComponent],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() appName: string = '';
  @Input() toolbarColor: string = '#9B9B7A';

  constructor() { }
}
