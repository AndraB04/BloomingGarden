import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsletterService } from '../../services/newsletter.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="preferences-container">
      <mat-card>
        <mat-card-content>
          <h2>Email Preferences</h2>
          <p>You can manage your email subscription preferences here.</p>
          
          <div class="email-input-section" *ngIf="!emailFromParams">
            <mat-form-field appearance="outline" style="width: 100%;">
              <mat-label>Enter your email address</mat-label>
              <input matInput type="email" [(ngModel)]="userEmail" placeholder="your.email@example.com">
            </mat-form-field>
          </div>

          <div class="email-display-section" *ngIf="emailFromParams">
            <p><strong>Email:</strong> {{ emailFromParams }}</p>
          </div>
          
          <div class="settings-actions">
            <button mat-raised-button color="warn" (click)="unsubscribe()" 
                    [disabled]="!userEmail && !emailFromParams">
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

    .email-input-section {
      margin-bottom: 24px;
    }

    .email-display-section {
      margin-bottom: 24px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class EmailSettingsComponent implements OnInit {
  userEmail: string = '';
  emailFromParams: string = '';

  constructor(
    private route: ActivatedRoute,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.emailFromParams = params['email'];
        this.unsubscribeEmail(params['email']);
      }
    });
  }

  unsubscribe() {
    const emailToUnsubscribe = this.emailFromParams || this.userEmail;
    if (!emailToUnsubscribe || !emailToUnsubscribe.trim()) {
      this.snackBar.open('Please enter a valid email address', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.unsubscribeEmail(emailToUnsubscribe);
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
