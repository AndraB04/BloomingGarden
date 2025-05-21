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

  logIn(credentials: { email: string, password: string }): Observable<AuthResponse> {
    const loginUrl = `${this.getApiUrl()}/auth/login`;
    console.log(`AuthService: Attempting login to ${loginUrl} for email: ${credentials.email}`);

    return this.http.post<any>(loginUrl, credentials).pipe(
      tap(rawResponse => {
        console.log('[AuthService TAP] Raw server response:', JSON.stringify(rawResponse, null, 2));
      }),
      map((serverResponse: any) => {
        console.log('[AuthService MAP] Processing server response:', JSON.stringify(serverResponse, null, 2));

        const statusInBody = serverResponse.status;
        const messageFromServer = serverResponse.message;
        const userDataFromServer = serverResponse.data;

        if (
          statusInBody === 200 &&
          userDataFromServer &&
          typeof userDataFromServer === 'object' &&
          userDataFromServer.id !== undefined &&
          typeof userDataFromServer.name === 'string' && userDataFromServer.name.trim() !== '' &&
          typeof userDataFromServer.email === 'string' && userDataFromServer.email.trim() !== '' &&
          typeof userDataFromServer.userRole === 'string' &&
          (userDataFromServer.userRole === 'ADMIN' || userDataFromServer.userRole === 'USER' || userDataFromServer.userRole === 'CUSTOMER')
        ) {
          console.log('[AuthService MAP] Server response validation PASSED. Role:', userDataFromServer.userRole);

          const mappedUser: User = {
            id: String(userDataFromServer.id),
            username: userDataFromServer.name,
            email: userDataFromServer.email,
            userRole: userDataFromServer.userRole as 'ADMIN' | 'USER' | 'CUSTOMER'
          };

          const placeholderToken = "PLACEHOLDER_TOKEN_" + Date.now();

          const finalAuthResponse: AuthResponse = {
            token: placeholderToken,
            user: mappedUser,
            message: messageFromServer
          };

          console.log('[AuthService MAP] Successfully created AuthResponse:', JSON.stringify(finalAuthResponse, null, 2));
          this.storeAuthData(finalAuthResponse.token, finalAuthResponse.user);
          return finalAuthResponse;
        } else {
          let validationErrorReason = "Unknown validation failure.";
          if (statusInBody !== 200) validationErrorReason = `Expected status 200 in body, got ${statusInBody}.`;
          else if (!userDataFromServer || typeof userDataFromServer !== 'object') validationErrorReason = "'data' field is missing or not an object.";
          else if (userDataFromServer.id === undefined) validationErrorReason = "'data.id' is missing.";
          else if (!userDataFromServer.name || typeof userDataFromServer.name !== 'string') validationErrorReason = "'data.name' is missing or not a string.";
          else if (!userDataFromServer.email || typeof userDataFromServer.email !== 'string') validationErrorReason = "'data.email' is missing or not a string.";
          else if (!userDataFromServer.userRole || typeof userDataFromServer.userRole !== 'string') validationErrorReason = "'data.userRole' is missing or not a string.";
          else if (!(userDataFromServer.userRole === 'ADMIN' || userDataFromServer.userRole === 'USER' || userDataFromServer.userRole === 'CUSTOMER')) {
            validationErrorReason = `Unrecognized userRole: '${userDataFromServer.userRole}'. Expected ADMIN, USER, or CUSTOMER.`;
          }

          const errorMessage = `Invalid login response structure or data: ${validationErrorReason}`;
          console.error('[AuthService MAP] Validation FAILED:', errorMessage, 'Full server response:', JSON.stringify(serverResponse, null, 2));
          throw new Error(errorMessage);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegistrationData): Observable<any> {
    const registerUrl = `${this.getApiUrl()}/auth/register`;
    return this.http.post<any>(registerUrl, data).pipe(
      tap(response => console.log('[AuthService Register] Response:', response)),
      catchError(this.handleError)
    );
  }

  private storeAuthData(token: string | null, user: User): void {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentTokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.customerService.setLoggedUser(user);
    console.log('[AuthService] Stored auth data. User:', user.email, 'Role:', user.userRole);
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
