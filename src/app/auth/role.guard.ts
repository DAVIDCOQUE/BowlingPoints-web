import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRoles = this.auth.getRoles();
    const hasRole = expectedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      console.warn('Usuario sin rol suficiente. Redirigiendo a /unauthorized');
      this.router.navigate(['/unauthorized']); // ← AQUI LA CORRECCIÓN
      return false;
    }

    return true;
  }
}
