import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecoverPasswordService } from 'src/app/services/recover-password.service';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import Swal from 'sweetalert2';
import { Component } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Dummy Component para la ruta de navegación post-reset
@Component({ template: '' })
class DummyComponent {}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let recoverPasswordService: jasmine.SpyObj<RecoverPasswordService>;
  let router: Router;

  beforeEach(async () => {
    recoverPasswordService = jasmine.createSpyObj('RecoverPasswordService', ['resetPassword']);

    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent, DummyComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: DummyComponent }
        ])
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => 'mock-token' // 👈 Simula token en URL
              }
            }
          }
        },
        { provide: RecoverPasswordService, useValue: recoverPasswordService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read token from query params on init', () => {
    expect(component.token).toBe('mock-token');
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage if token is missing', () => {
    const route = TestBed.inject(ActivatedRoute);
    // Simular route sin token
    spyOn(route.snapshot.queryParamMap, 'get').and.returnValue(null);
    component.ngOnInit();
    expect(component.errorMessage).toBe('Token inválido o faltante.');
  });

  it('should invalidate form if passwords do not match', () => {
    component.form.setValue({
      newPassword: '12345678',
      confirmPassword: '87654321'
    });
    expect(component.form.valid).toBeFalse();
    expect(component.form.errors).toEqual({ mismatch: true });
  });

  it('should call resetPassword and navigate on success', fakeAsync(() => {
    const swalSpy = spyOn(Swal, 'fire');
    spyOn(router, 'navigate');
    recoverPasswordService.resetPassword.and.returnValue(of({ message: 'Todo bien' }));

    component.form.setValue({
      newPassword: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();
    tick(); // simula el async

    expect(recoverPasswordService.resetPassword).toHaveBeenCalledWith('mock-token', 'password123');
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: 'Contraseña actualizada',
      text: 'Todo bien'
    }));

    tick(3000); // esperar navegación post-alerta
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should show error Swal on reset failure', fakeAsync(() => {
    const swalSpy = spyOn(Swal, 'fire');
    recoverPasswordService.resetPassword.and.returnValue(throwError(() => ({
      error: { message: 'Token expirado' }
    })));

    component.form.setValue({
      newPassword: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();
    tick();

    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error',
      text: 'Token expirado'
    }));

    expect(component.loading).toBeFalse();
  }));

  it('should not submit if form is invalid', () => {
    component.form.setValue({
      newPassword: '',
      confirmPassword: ''
    });

    component.onSubmit();

    expect(recoverPasswordService.resetPassword).not.toHaveBeenCalled();
  });

  it('should not submit if token is missing', () => {
    component.token = '';
    component.form.setValue({
      newPassword: 'validpassword',
      confirmPassword: 'validpassword'
    });

    component.onSubmit();

    expect(recoverPasswordService.resetPassword).not.toHaveBeenCalled();
  });
});
