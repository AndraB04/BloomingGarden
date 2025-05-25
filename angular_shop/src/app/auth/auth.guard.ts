import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  public constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const currentUser: User | null = this.authService.currentUserValue;

    console.log('[AuthGuard] Checking activation. Current User:', JSON.stringify(currentUser, null, 2));

    if (currentUser) {
      if (currentUser.userRole === 'ADMIN') {
        console.log('[AuthGuard] Access GRANTED to ADMIN for route:', state.url);
        return true;
      } else {
        console.log(`[AuthGuard] Access DENIED. User role is '${currentUser.userRole}', not ADMIN. Redirecting to /home. Attempted URL: ${state.url}`);
        return this.router.createUrlTree(['/home']);
      }
    } else {
      console.log(`[AuthGuard] Access DENIED. No user logged in. Redirecting to /auth. Attempted URL: ${state.url}`);
      return this.router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url } });
    }
  }
}
