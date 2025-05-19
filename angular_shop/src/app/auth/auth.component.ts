// src/app/auth/auth.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service'; // Ensure User is exported if used in response type
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; // Optional: for icons if you add them
// Assuming appConfig.getAppLogo() comes from a service or a global object.
// If it's a service, you'd inject it:
// import { AppConfigService } from './path/to/app-config.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule // Optional
  ],
  // The template you provided would go here if it's not in a separate .html file
  // For brevity, I'm assuming your provided HTML is in auth.component.html
  // If it's inline, replace the templateUrl line with `template: \`YOUR_HTML_HERE\``
  templateUrl: './auth.component.html', // OR use the inline template you had
  styleUrls: ['./auth.component.css'] // Add if you have styles
})
export class AuthComponent implements OnInit {
  viewType: 'login' | 'register' = 'login'; // Default view

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  loginError: string | null = null;
  registerError: string | null = null;
  registerSuccess: string | null = null;

  // Placeholder for appConfig if it's managed within the component
  // If AppConfigService is injected, make it public: public appConfig: AppConfigService
  // For this example, I'll simulate it if needed for the template to compile.
  appConfig = {
    getAppLogo: () => 'path/to/your/logo.png' // Replace with actual logo path or service call
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
    // If AppConfigService is used: private appConfigService: AppConfigService
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
    this.initRegisterForm();
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  initRegisterForm(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], // Example: min 6 chars
      reTypePassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const passwordControl = group.get('password');
    const reTypePasswordControl = group.get('reTypePassword');

    if (!passwordControl || !reTypePasswordControl) {
      return null; // Should not happen if form is well-defined
    }

    // If reTypePassword already has other errors (like 'required'), don't add 'mismatch' yet
    if (reTypePasswordControl.errors && !reTypePasswordControl.errors['mismatch']) {
      return null;
    }

    if (passwordControl.value !== reTypePasswordControl.value) {
      reTypePasswordControl.setErrors({ mismatch: true });
      return { mismatch: true }; // Error for the group
    } else {
      // Clear mismatch error if it was set and passwords now match
      if (reTypePasswordControl.hasError('mismatch')) {
        const { mismatch, ...otherErrors } = reTypePasswordControl.errors || {};
        reTypePasswordControl.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
      return null; // No error for the group
    }
  }

  onViewTypeChange(newType: 'login' | 'register'): void {
    this.viewType = newType;
    // Reset errors and forms
    this.loginError = null;
    this.registerError = null;
    this.registerSuccess = null;
    if (newType === 'login') {
      this.loginForm.reset();
    } else {
      this.registerForm.reset();
    }
  }

  onLogIn(): void {
    this.loginError = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Show errors if not already visible
      return;
    }

    this.authService.logIn(this.loginForm.value).subscribe({
      next: (response: { user: User, token: string }) => { // Define response type based on your AuthService
        console.log('Login successful from AuthComponent', response);
        // AuthService should ideally handle storing the token and user state
        if (response.user && response.user.userRole === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Login failed from AuthComponent', err);
        this.loginError = err.error?.message || err.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  onRegister(): void {
    this.registerError = null;
    this.registerSuccess = null;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Show errors
      return;
    }

    // Exclude reTypePassword from the data sent to the backend
    const { username, email, password } = this.registerForm.value;

    // Assuming authService.register exists and takes this payload
    // You might need to define the 'register' method in your AuthService
    this.authService.register({ username, email, password }).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.registerSuccess = 'Registration successful! You can now log in.';
        this.onViewTypeChange('login'); // Switch to login view
        // Optionally pre-fill the email in the login form
        this.loginForm.patchValue({ email: email });
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.registerError = err.error?.message || err.message || 'Registration failed. Please try again.';
      }
    });
  }

  getErrorMessage(control: AbstractControl | null): string {
    if (!control) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('email')) {
      return 'Not a valid email address.';
    }
    if (control.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `Password must be at least ${requiredLength} characters.`;
    }
    if (control.hasError('mismatch')) {
      return 'Passwords do not match.';
    }
    // Add more custom error checks if needed
    return 'Invalid input.';
  }
}
