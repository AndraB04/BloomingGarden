import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Acum importul este simplu, din același folder

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Injectăm serviciul de autentificare pentru a avea acces la utilizatorul logat și la token.
  constructor(private authService: AuthService) {}

  // Aceasta este metoda principală care se va executa pentru fiecare request HTTP.
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // Luăm utilizatorul curent din serviciul de autentificare.
    const currentUser = this.authService.currentUserValue;

    // Verificăm dacă un utilizator este logat și dacă are un token.
    if (currentUser && currentUser.token
    ) {
      // Dacă da, creăm o copie (o clonă) a request-ului original.
      // Adăugăm la această copie header-ul 'Authorization'.
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });

      // Trimitem mai departe request-ul MODIFICAT (cu token).
      return next.handle(clonedRequest);
    }

    // Dacă nu există niciun utilizator logat (sau nu are token),
    // trimitem mai departe request-ul ORIGINAL, nemodificat.
    return next.handle(request);
  }
}