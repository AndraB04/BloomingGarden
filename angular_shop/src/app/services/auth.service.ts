import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfigurationsService } from "./configurations.service";
import { CustomerService } from "./customer.service";

export interface User {
  id: string;
  username: string;
  email: string;
  userRole: 'ADMIN' | 'USER' | 'CUSTOMER';
  token?: string;
}

export interface AuthResponse {
  token: string | null;
  user: User;
  message?: string;

}

export interface RegistrationData {
  username: string;
  email: string;
  password?: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentTokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public currentToken$ = this.currentTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private appConfig: ConfigurationsService,
    private customerService: CustomerService
) {
    console.log('AuthService Initialized. Stored User:', this.currentUserValue);
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.customerService.setLoggedUser(storedUser);
    }
  }

  private getApiUrl(): string {
    return this.appConfig.getApiUrl(); // Asigură-te că această metodă există și returnează URL-ul corect
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get currentTokenValue(): string | null {
    return this.currentTokenSubject.value;
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Replace the existing logIn method in src/app/services/auth.service.ts

  logIn(credentials: { email: string, password: string }): Observable<AuthResponse> {
    const loginUrl = `${this.getApiUrl()}/auth/login`;
    console.log(`AuthService: Attempting login to ${loginUrl} for email: ${credentials.email}`);

    return this.http.post<any>(loginUrl, credentials).pipe(
      map((serverResponse: any) => {
        console.log('[AuthService MAP] Processing server response:', JSON.stringify(serverResponse, null, 2));

        // Handle both possible response structures
        let userData, realToken;

        if (serverResponse.data) {
          // Structure: { data: { user: {...}, token: "..." } }
          userData = serverResponse.data.user;
          realToken = serverResponse.data.token;
        } else {
          // Structure: { user: {...}, token: "..." }
          userData = serverResponse.user;
          realToken = serverResponse.token;
        }

        // Validate response data
        if (!userData || !realToken) {
          throw new Error('Invalid server response structure');
        }

        console.log('[AuthService MAP] Real JWT Token found:', realToken);

        // Create the User object
        const mappedUser: User = {
          id: String(userData.id || userData.userId),
          username: userData.name || userData.username,
          email: userData.email,
          userRole: userData.userRole || userData.role || 'USER',
          token: realToken
        };

        // Create the final response
        const finalAuthResponse: AuthResponse = {
          token: realToken,
          user: mappedUser,
          message: serverResponse.message || 'Login successful'
        };

        // Store auth data and notify services
        this.storeAuthData(finalAuthResponse.token, finalAuthResponse.user);
        return finalAuthResponse;
      }),
      catchError(this.handleError)
    );
  }
  register(data: RegistrationData): Observable<any> {
    const registerUrl = `${this.getApiUrl()}/auth/register`;
    return this.http.post<any>(registerUrl, data).pipe(
      tap(response => {
        console.log('[AuthService Register] Response:', response);
        // After successful registration, subscribe to newsletter
        if (response && response.user && response.user.email) {
          this.subscribeToNewsletter(response.user.email, response.user.name || '');
        }
      }),
      catchError(this.handleError)
    );
  }

  private subscribeToNewsletter(email: string, name: string): void {
    const newsletterUrl = `${this.getApiUrl()}/newsletter/subscribe`;
    this.http.post(newsletterUrl, {
      email,
      name,
      isCustomer: true
    }).subscribe({
      next: () => console.log('Successfully subscribed new customer to newsletter'),
      error: err => console.error('Failed to subscribe customer to newsletter:', err)
    });
  }

  private storeAuthData(token: string | null, user: User): void {
    if (token) {
      // Your user object now contains the token, so this is the most important line
      localStorage.setItem('currentUser', JSON.stringify(user));

      // It's also good practice to store the token separately
      localStorage.setItem('authToken', token);

    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }

    // Update the BehaviorSubjects
    this.currentUserSubject.next(user);
    this.currentTokenSubject.next(token);
    this.customerService.setLoggedUser(user);
    console.log('[AuthService] Stored REAL auth data. User:', user.email, 'Role:', user.userRole);
  }
  logOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentTokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.customerService.setLoggedUser(null);
    console.log('[AuthService] User logged out.');
    this.router.navigate(['/auth']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred with the request!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network/Client Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = `Server Error (${error.status}): ${error.error.message}`;
      } else if (error.error && typeof error.error === 'string' && error.error.length < 200) {
        errorMessage = `Server Error (${error.status}): ${error.error}`;
      } else if (error.message && !error.error) {
        errorMessage = error.message;
      }
      else {
        errorMessage = `Server Error (${error.status}). Please try again later.`;
      }
    }
    console.error('[AuthService handleError] Parsed error message:', errorMessage, 'Original Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
