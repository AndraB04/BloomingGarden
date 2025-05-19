// src/app/auth/auth.guard.ts (sau redenumește-l în admin-auth.guard.ts)
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, User } from '../services/auth.service'; // Importă AuthService și User

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate { // Sau AdminAuthGuard dacă preferi
  public constructor(
    private router: Router,
    private authService: AuthService // Injectează AuthService, NU CustomerService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const currentUser: User | null = this.authService.currentUserValue; // Folosește valoarea din AuthService

    console.log('[AuthGuard] Checking activation. Current User:', JSON.stringify(currentUser, null, 2)); // Log pentru debugging

    if (currentUser) {
      // Utilizatorul este logat
      if (currentUser.userRole === 'ADMIN') {
        console.log('[AuthGuard] Access GRANTED to ADMIN for route:', state.url);
        return true; // Permite accesul
      } else {
        // Utilizatorul este logat, dar NU este ADMIN
        console.log(`[AuthGuard] Access DENIED. User role is '${currentUser.userRole}', not ADMIN. Redirecting to /home. Attempted URL: ${state.url}`);
        return this.router.createUrlTree(['/home']); // Redirecționează la o pagină sigură
      }
    } else {
      // Niciun utilizator logat
      console.log(`[AuthGuard] Access DENIED. No user logged in. Redirecting to /auth. Attempted URL: ${state.url}`);
      // Salvează URL-ul la care încerca să ajungă pentru a reveni după login
      return this.router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url } });
    }
  }
}
