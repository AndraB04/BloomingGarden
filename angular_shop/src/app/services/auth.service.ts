// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ConfigurationsService } from "./configurations.service"; // Presupunând că aceasta e corectă

// --- EXPORTĂ ACESTE INTERFEȚE ---
export interface User {
  id: string;
  username: string;
  email: string;
  userRole: 'ADMIN' | 'USER';
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
  // Vom folosi ConfigurationsService pentru apiUrl
  // private apiUrl = 'http://localhost:8080/api'; // Eliminăm apiUrl hardcodat

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentTokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public currentToken$ = this.currentTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private appConfig: ConfigurationsService // Injectăm ConfigurationsService
  ) {
    console.log('AuthService initialized. Stored user:', this.currentUserValue);
  }

  // Metodă helper pentru a obține URL-ul API-ului
  private getApiUrl(): string {
    // Asigură-te că metoda getApiUrl() din ConfigurationsService returnează string-ul corect
    // ex: 'http://localhost:8080/api'
    return this.appConfig.getApiUrl();
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
    console.log(`AuthService: Attempting login to ${loginUrl} with email: ${credentials.email}`);

    return this.http.post<any>(loginUrl, credentials).pipe(
      tap(response => {
        console.log('AuthService - RAW HTTP Response from server on login:', JSON.stringify(response, null, 2));
      }),
      map((responseFromServer: any) => {
        console.log('AuthService - map - Processing server response:', JSON.stringify(responseFromServer, null, 2));

        const serverUserData = responseFromServer.data; // JSON-ul tău are user-ul în "data"
        const message = responseFromServer.message;
        const status = responseFromServer.status;

        if (status === 200 && serverUserData && typeof serverUserData === 'object' &&
          serverUserData.id !== undefined &&
          serverUserData.name && typeof serverUserData.name === 'string' && // Serverul trimite 'name'
          serverUserData.email && typeof serverUserData.email === 'string' &&
          serverUserData.userRole && (serverUserData.userRole === 'ADMIN' || serverUserData.userRole === 'USER')) {

          const mappedUser: User = {
            id: String(serverUserData.id),
            username: serverUserData.name, // Mapăm 'name' la 'username'
            email: serverUserData.email,
            userRole: serverUserData.userRole
          };

          const tokenToStore = "PLACEHOLDER_TOKEN_" + new Date().getTime();
          console.warn(
            `AuthService: No real token from server. Using placeholder: ${tokenToStore}. NOT FOR PRODUCTION.`
          );

          const authResponse: AuthResponse = {
            token: tokenToStore,
            user: mappedUser,
            message: message
          };

          console.log('AuthService - map - Successfully mapped response:', JSON.stringify(authResponse, null, 2));
          this.storeAuthData(authResponse.token, authResponse.user);
          return authResponse;
        } else {
          const errorMsg = (responseFromServer.message && status !== 200) ? responseFromServer.message : 'Invalid login response: user data missing or incomplete.';
          console.error('AuthService - map - Error processing server response:', errorMsg, 'Received:', JSON.stringify(responseFromServer, null, 2));
          throw new Error(errorMsg);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(data: RegistrationData): Observable<any> {
    const registerUrl = `${this.getApiUrl()}/auth/register`;
    console.log(`AuthService: Attempting registration to ${registerUrl} with data:`, data);
    return this.http.post<any>(registerUrl, data).pipe(
      tap(response => {
        console.log('AuthService - Registration successful response:', response);
      }),
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
    console.log('AuthService - Stored auth data. User:', user, 'Token:', token);
  }

  logOut(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentTokenSubject.next(null);
    this.currentUserSubject.next(null);
    console.log('AuthService - User logged out.');
    this.router.navigate(['/auth']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('AuthService - HTTP Error:', error);
    let errorMessage = 'An unknown error occurred with the request!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network/Client Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = `Server Error (${error.status}): ${error.error.message}`;
      } else if (error.error && typeof error.error === 'string' && error.error.length < 200) {
        errorMessage = `Server Error (${error.status}): ${error.error}`;
      } else if (error.message) {
        errorMessage = `Request Error (${error.status}): ${error.message}`;
      } else {
        errorMessage = `Server Error (${error.status}). Please try again later.`;
      }
    }
    console.error('AuthService - Parsed error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
