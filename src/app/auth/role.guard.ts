import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];

    if (this.auth.isLoggedIn() && expectedRoles.some(role => this.auth.hasRole(role))) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
