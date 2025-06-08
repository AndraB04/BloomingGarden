import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsletterService } from '../../services/newsletter.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unsubscribe',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="unsubscribe-container">
      <mat-card>
        <mat-card-content>
          <div class="icon-container">
            <mat-icon class="large-icon">email_off</mat-icon>
          </div>
          
          <h2>Unsubscribe from Newsletter</h2>
          <p>Are you sure you want to unsubscribe from our newsletter?</p>
          <p class="email-text">Email: {{ email }}</p>
          
          <div class="action-buttons">
            <button mat-stroked-button (click)="cancel()">
              Cancel
            </button>
            <button mat-raised-button color="warn" (click)="confirmUnsubscribe()">
              Unsubscribe
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unsubscribe-container {
      max-width: 500px;
      margin: 40px auto;
      padding: 0 20px;
      text-align: center;
    }

    mat-card {
      padding: 32px;
    }

    .icon-container {
      margin-bottom: 24px;
    }

    .large-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #e74c3c;
    }

    h2 {
      margin: 0 0 16px;
      color: #2c3e50;
    }

    p {
      color: #666;
      margin-bottom: 16px;
    }

    .email-text {
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 24px;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class UnsubscribeComponent implements OnInit {
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.router.navigate(['/home']);
      this.snackBar.open('No email address provided', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  confirmUnsubscribe() {
    if (!this.email) return;
    
    console.log('Confirming unsubscribe for:', this.email);
    this.newsletterService.unsubscribe(this.email).subscribe({
      next: (response) => {
        console.log('Unsubscribe response:', response);
        this.snackBar.open('Successfully unsubscribed from newsletter', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Newsletter unsubscribe error:', error);
        const message = error?.message || 'Failed to unsubscribe. Please try again.';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancel() {
    this.router.navigate(['/home']);
  }
}
