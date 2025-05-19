// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ConfigurationsService } from "../services/configurations.service"; // Asigură-te că calea e corectă
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

// Definește o interfață pentru obiectul User
// Ar trebui să reflecte structura utilizatorului returnată de backend-ul tău
export interface User {
  id: string | number;
  username: string;
  email?: string;
  userRole: 'ADMIN' | 'USER' | string; // Fii specific dacă ai roluri predefinite
  // ... alte proprietăți pe care le returnează backend-ul tău despre utilizator
}

// Definește o interfață pentru răspunsul de la login (care ar trebui să includă token și user)
export interface AuthResponse {
  token: string;
  user: User; // Sau orice nume are proprietatea pentru user în răspunsul tău
  // ... alte proprietăți din răspunsul de login
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public authStateChanged$: Observable<User | null>; // Pentru compatibilitate cu AppComponent

  private readonly TOKEN_KEY = 'authToken'; // Cheie pentru localStorage

  constructor(
    private appConfig: ConfigurationsService,
    private httpClient: HttpClient
  ) {
    // La inițializare, încercăm să încărcăm utilizatorul pe baza token-ului stocat
    const storedUser = this.getUserFromToken(localStorage.getItem(this.TOKEN_KEY));
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.authStateChanged$ = this.currentUser$; // AppComponent va folosi asta

    if (storedUser) {
      console.log('AuthService: User loaded from stored token:', storedUser);
    }
  }

  // Helper pentru a obține valoarea curentă a utilizatorului (dacă e nevoie sincron)
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  logIn(loginData: any): Observable<AuthResponse> { // Răspunsul ar trebui să fie AuthResponse
    return this.httpClient.post<AuthResponse>(`${this.appConfig.getApiUrl()}/auth/login`, loginData)
      .pipe(
        tap(response => {
          if (response && response.token && response.user) {
            localStorage.setItem(this.TOKEN_KEY, response.token);
            this.currentUserSubject.next(response.user); // Actualizează starea utilizatorului
            console.log('AuthService: User logged in:', response.user);
          } else {
            // Aruncă o eroare dacă răspunsul nu e ce ne așteptăm
            console.error('AuthService: Invalid login response structure', response);
            this.currentUserSubject.next(null); // Asigură-te că e null dacă login eșuează
            throw new Error('Invalid login response from server.');
          }
        }),
        catchError(this.handleError)
      );
  }

  register(registerData: any): Observable<any> { // Consideră și aici un răspuns specific
    return this.httpClient.post(`${this.appConfig.getApiUrl()}/auth/register`, registerData)
      .pipe(
        // Poți adăuga un tap aici dacă vrei să faci auto-login după register
        catchError(this.handleError)
      );
  }

  logout(): void { // Nu mai trebuie să returneze Observable dacă doar curăță local
    // Ideal, ai face și un apel la backend pentru a invalida sesiunea/token-ul server-side
    // this.httpClient.post(`${this.appConfig.getApiUrl()}/auth/logout`, {}).subscribe();

    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null); // Emite null pentru a semnala logout
    console.log('AuthService: User logged out');
  }

  // Metodă simplistă de a "decoda" un token JWT pentru user info.
  // ÎNTR-O APLICAȚIE REALĂ: Nu te baza pe decodarea client-side a JWT pentru date critice de securitate.
  // Ideal, backend-ul ar trebui să returneze datele userului la login,
  // sau ai un endpoint /me care returnează userul pe baza token-ului.
  // Această funcție este un placeholder.
  private getUserFromToken(token: string | null): User | null {
    if (!token) {
      return null;
    }
    try {
      // Decodare simplistă a părții de payload a unui JWT
      // ATENȚIE: Aceasta NU verifică semnătura token-ului!
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      const decodedPayload = JSON.parse(atob(payloadBase64));

      // Asigură-te că `decodedPayload` conține proprietățile necesare, inclusiv `userRole`
      // Ajustează maparea dacă structura din token e diferită
      const user: User = {
        id: decodedPayload.sub || decodedPayload.id, // 'sub' este adesea ID-ul utilizatorului în JWT
        username: decodedPayload.username || decodedPayload.name,
        email: decodedPayload.email,
        userRole: decodedPayload.userRole || decodedPayload.role, // Backend-ul trebuie să includă asta în token
        // ... alte câmpuri mapate din token
      };

      if (!user.userRole) {
        console.warn("AuthService: userRole not found in token payload. User:", user);
        // Poți decide să returnezi null sau un user cu rol default aici
      }
      return user;

    } catch (error) {
      console.error('AuthService: Error decoding token', error);
      localStorage.removeItem(this.TOKEN_KEY); // Curăță token invalid
      return null;
    }
  }

  private handleError(error: HttpErrorResponse) {
    console.error('AuthService HTTP Error:', error);
    // Poți personaliza mesajul de eroare
    return throwError(() => new Error(error.error?.message || error.message || 'Something bad happened; please try again later.'));
  }
}
