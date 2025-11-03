import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';

import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isGuest', 'decodeToken']);

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        MatMenuModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule // ← ESTE era el que faltaba
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize values correctly in ngOnInit', () => {
    mockAuthService.isGuest.and.returnValue(true);
    mockAuthService.decodeToken.and.returnValue({
      email: 'test@example.com',
      sub: '123456',
      roles: ['ENTRENADOR'],
      permissions: ['GESTION_USUARIOS'],
      iat: 1692123456,
      exp: 1695123456
    });

    component.ngOnInit();

    expect(component.isGuest).toBeTrue();
    expect(component.userEmail).toBe('test@example.com');
    expect(component.userDocument).toBe('123456');
    expect(component.userRole).toBe('ENTRENADOR');
  });

  it('should emit menuToggle event when toggleSidebar is called', () => {
    spyOn(component.menuToggle, 'emit');
    component.toggleSidebar();
    expect(component.menuToggle.emit).toHaveBeenCalled();
  });

  it('should show SweetAlert and navigate to login on confirm logout', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    spyOn(localStorage, 'clear');

    await component.logout();

    expect(Swal.fire).toHaveBeenCalled();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not navigate or clear storage if logout is cancelled', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    spyOn(localStorage, 'clear');

    await component.logout();

    expect(Swal.fire).toHaveBeenCalled();
    expect(localStorage.clear).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
