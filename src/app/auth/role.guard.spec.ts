import { RoleGuard } from './role.guard';
import { AuthService } from './auth.service';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSnapshot: ActivatedRouteSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'getRoles']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    guard = new RoleGuard(authServiceSpy, routerSpy);

    // Creamos el snapshot y le seteamos la propiedad `data` manualmente
    routeSnapshot = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], {
      data: { roles: ['ADMIN', 'ENTRENADOR'] }
    });
  });

  it('should redirect to /login if user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(false);

    const result = guard.canActivate(routeSnapshot);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to /unauthorized if user lacks required roles', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getRoles.and.returnValue(['JUGADOR']);

    const result = guard.canActivate(routeSnapshot);

    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });

  it('should allow access if user has a required role', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);
    authServiceSpy.getRoles.and.returnValue(['ENTRENADOR']);

    const result = guard.canActivate(routeSnapshot);

    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
