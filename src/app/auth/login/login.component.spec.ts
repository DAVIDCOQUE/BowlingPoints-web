import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoginComponent (refactor)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'setAuthData', 'logout']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark all fields as touched if form is invalid', () => {
    component.submit();
    expect(component.username?.touched).toBeTrue();
    expect(component.password?.touched).toBeTrue();
  });

  it('should call AuthService.login and navigate on success', fakeAsync(() => {
    component.form.setValue({ username: '123456', password: 'secret' });
    mockAuthService.login.and.returnValue(of('fake-token'));

    component.submit();
    tick();

    expect(mockAuthService.login).toHaveBeenCalledWith('123456', 'secret');
    expect(mockAuthService.setAuthData).toHaveBeenCalledWith('fake-token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should set error message on login failure', fakeAsync(() => {
    component.form.setValue({ username: '123456', password: 'wrongpass' });
    mockAuthService.login.and.returnValue(throwError(() => new Error('Unauthorized')));

    component.submit();
    tick();

    expect(component.error).toBe('Usuario o contraseña incorrectos');
  }));

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });

  it('should logout and navigate as guest', () => {
    component.loginAsGuest();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
