import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsletterService } from '../../services/newsletter.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-newsletter-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
    <div class="newsletter-manager">
      <mat-card class="newsletter-form">
        <mat-card-header>
          <mat-card-title>Send Newsletter</mat-card-title>
          <mat-card-subtitle>Compose and send newsletter to all subscribers</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="newsletterForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Subject</mat-label>
              <input matInput formControlName="subject" placeholder="Newsletter subject">
              <mat-error *ngIf="newsletterForm.get('subject')?.hasError('required')">
                Subject is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="10" placeholder="Newsletter content"></textarea>
              <mat-error *ngIf="newsletterForm.get('content')?.hasError('required')">
                Content is required
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="newsletterForm.invalid || sending">
              <mat-icon>send</mat-icon>
              Send Newsletter
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="subscribers-list">
        <mat-card-header>
          <mat-card-title>Subscribers</mat-card-title>
          <mat-card-subtitle>Total subscribers: {{ subscribers.length }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="subscriber" *ngFor="let email of subscribers">
            <mat-icon>mail</mat-icon>
            <span>{{ email }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .newsletter-manager {
      padding: 24px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }

    .newsletter-form form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .subscribers-list {
      height: fit-content;
    }

    .subscriber {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-bottom: 1px solid #eee;
    }

    .subscriber:last-child {
      border-bottom: none;
    }

    .subscriber mat-icon {
      color: #6c757d;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class NewsletterManagerComponent implements OnInit {
  newsletterForm: FormGroup;
  subscribers: string[] = [];
  sending = false;

  constructor(
    private fb: FormBuilder,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {
    this.newsletterForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSubscribers();
  }

  loadSubscribers() {
    this.newsletterService.getSubscribers().subscribe({
      next: (response: any) => {
        this.subscribers = response.data || [];
      },
      error: (error) => {
        this.snackBar.open('Failed to load subscribers', 'Close', {
          duration: 3000
        });
      }
    });
  }

  onSubmit() {
    if (this.newsletterForm.valid) {
      this.sending = true;
      const { subject, content } = this.newsletterForm.value;
      
      this.newsletterService.sendNewsletter(subject, content).subscribe({
        next: () => {
          this.snackBar.open('Newsletter sent successfully!', 'Close', {
            duration: 3000
          });
          this.newsletterForm.reset();
          this.sending = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to send newsletter. Please try again.', 'Close', {
            duration: 3000
          });
          this.sending = false;
        }
      });
    }
  }
}
