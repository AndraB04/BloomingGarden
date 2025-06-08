import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsletterService } from '../../services/newsletter.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-newsletter-subscription',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="newsletter-container">
      <h3>Subscribe to Our Newsletter</h3>
      <p>Stay updated with our latest products and offers!</p>
      
      <form [formGroup]="subscriptionForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="Enter your email">
          <mat-error *ngIf="subscriptionForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="subscriptionForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Name (Optional)</mat-label>
          <input matInput formControlName="name" placeholder="Enter your name">
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" [disabled]="subscriptionForm.invalid">
          Subscribe
        </button>
      </form>
    </div>
  `,
  styles: [`
    .newsletter-container {
      max-width: 400px;
      margin: 20px auto;
      padding: 20px;
      text-align: center;
      background: #f8f9fa;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    h3 {
      color: #2c3e50;
      margin-bottom: 8px;
    }

    p {
      color: #6c757d;
      margin-bottom: 24px;
    }

    button {
      margin-top: 16px;
    }
  `]
})
export class NewsletterSubscriptionComponent {
  subscriptionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {
    this.subscriptionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['']
    });
  }

  onSubmit() {
    if (this.subscriptionForm.valid) {
      const { email, name } = this.subscriptionForm.value;

      // Disable form while submitting
      this.subscriptionForm.disable();

      this.newsletterService.subscribe(email, name).subscribe({
        next: (response) => {
          this.snackBar.open('Successfully subscribed to newsletter!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.subscriptionForm.reset();
          this.subscriptionForm.enable();
        },
        error: (error) => {
          console.error('Newsletter subscription error:', error);
          const message = error?.message || 'Failed to subscribe. Please try again.';
          this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.subscriptionForm.enable();
        }
      });
    } else {
      // If form is invalid, show error messages for all fields
      Object.keys(this.subscriptionForm.controls).forEach(key => {
        const control = this.subscriptionForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
