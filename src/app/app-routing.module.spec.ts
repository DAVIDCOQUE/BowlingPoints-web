import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { routes } from './app-routing.module'; // necesitas exportarlos del archivo para usarlos aquí

describe('AppRoutingModule', () => {
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AppRoutingModule
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should navigate to "" and redirect to /dashboard', async () => {
    await router.navigate(['']);
    expect(location.path()).toBe('/dashboard');
  });

  it('should navigate to "login"', async () => {
    await router.navigate(['login']);
    expect(location.path()).toBe('/login');
  });

  it('should navigate to unknown route and redirect to /dashboard', async () => {
    await router.navigate(['/unknown-route']);
    expect(location.path()).toBe('/dashboard');
  });
});
