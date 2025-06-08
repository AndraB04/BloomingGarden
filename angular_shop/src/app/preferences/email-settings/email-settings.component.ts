import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsletterService } from '../../services/newsletter.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="preferences-container">
      <mat-card>
        <mat-card-content>
          <h2>Email Preferences</h2>
          <p>You can manage your email subscription preferences here.</p>
          
          <div class="settings-actions">
            <button mat-raised-button color="warn" (click)="unsubscribe()">
              Unsubscribe from Newsletter
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .preferences-container {
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    }

    mat-card {
      padding: 24px;
    }

    h2 {
      margin: 0 0 16px;
      color: #2c3e50;
    }

    p {
      color: #666;
      margin-bottom: 24px;
    }

    .settings-actions {
      margin-top: 24px;
    }
  `]
})
export class EmailSettingsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.unsubscribeEmail(params['email']);
      }
    });
  }

  unsubscribe() {
    // Show confirmation dialog or directly unsubscribe if email is in URL params
    if (this.route.snapshot.queryParams['email']) {
      this.unsubscribeEmail(this.route.snapshot.queryParams['email']);
    }
  }

  private unsubscribeEmail(email: string) {
    this.newsletterService.unsubscribe(email).subscribe({
      next: () => {
        this.snackBar.open('Successfully unsubscribed from newsletter', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
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
}
