import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf, NgSwitch, NgSwitchCase} from "@angular/common";
import {AuthService} from "../services/auth.service";
import {CustomerService} from "../services/customer.service";
import {Router} from "@angular/router";
import {ConfigurationsService} from "../services/configurations.service";
import {BehaviorSubject, Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    NgIf
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit, OnDestroy {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  registerForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    reTypePassword: new FormControl('', [Validators.required]),
  });

  viewType: string = 'login';
  private loggedInUserSubject = new BehaviorSubject<any | null>(null);
  loggedInUser$ = this.loggedInUserSubject.asObservable();
  private loginSubscription: Subscription | undefined;

  constructor(
    public appConfig: ConfigurationsService,
    private authService: AuthService,
    private customer: CustomerService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loggedInUserSubject.next(this.customer.getLoggedUser());
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  onViewTypeChange(viewType: string): void {
    this.viewType = viewType;
  }

  onLogIn(): void {
    this.loginSubscription = this.authService.logIn(this.loginForm.value).subscribe(
      (response: any) => {
        if (response.message != 'Bad credentials!') {
          console.log('Login with success!');
          console.log(response.data);
          this.customer.setLoggedUser(response.data);
          this.loggedInUserSubject.next(response.data);
          this.resetLoginForm();
          this.router.navigate(['/', 'home']);
        } else {
          alert(response.message);
        }
      },
      (err) => {
        console.log('Login with failed!');
        alert('Invalid credentials!');
        console.log(err);
      }
    );
  }

  onRegister(): void {
    if (
      this.registerForm.value.password != this.registerForm.value.reTypePassword
    ) {
      alert('Passwords do not match');
    } else {
      this.authService.register(this.registerForm.value).subscribe(
        (response: any) => {
          console.log('Register with success!');
          this.viewType = 'login';
          this.resetRegisterForm();
          console.log(response);
        },
        (err) => {
          console.log('Register with failed!');
          console.log(err);
        }
      );
    }
  }

  logout(): void {
    this.authService.logout().subscribe( // Assuming you have a logout method in your AuthService
      (response: any) => {
        console.log('Logout successful:', response);
        this.customer.setLoggedUser(null); // Clear logged-in user in CustomerService
        this.loggedInUserSubject.next(null); // Emit null for logged-out state
        this.router.navigate(['/', 'auth']); // Redirect to the auth page
      },
      (error) => {
        console.error('Logout failed:', error);
        // Handle logout error if needed
      }
    );
  }

  getLoggedUser(): Observable<any | null> {
    return this.loggedInUser$;
  }

  onAuthStateChanged(): Observable<any | null> {
    return this.loggedInUser$;
  }

  getErrorMessage(formControl: any) {
    if (formControl.hasError('required')) {
      return 'You must enter a value';
    }
    return formControl.hasError('email') ? 'Not a valid email' : '';
  }

  private resetLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  private resetRegisterForm() {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      reTypePassword: new FormControl('', [Validators.required]),
    });
  }
}
