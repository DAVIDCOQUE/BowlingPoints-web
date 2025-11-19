import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RecoverPasswordComponent } from './recover-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RecoverPasswordService } from 'src/app/services/recover-password.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

// Creamos un mock del servicio
class MockRecoverPasswordService {
  recoverPassword(identifier: string) {
    return of({ message: 'Correo enviado correctamente' });
  }
}

describe('RecoverPasswordComponent', () => {
  let component: RecoverPasswordComponent;
  let fixture: ComponentFixture<RecoverPasswordComponent>;
  let mockService: RecoverPasswordService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecoverPasswordComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: RecoverPasswordService, useClass: MockRecoverPasswordService }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverPasswordComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(RecoverPasswordService);
    fixture.detectChanges();
  });

  it('should create the component ✔️', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially 🤔', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should validate identifier field correctly', () => {
    const identifier = component.form.get('identifier');
    identifier?.setValue('');
    expect(identifier?.valid).toBeFalse();

    identifier?.setValue('invalidEmail');
    expect(identifier?.valid).toBeFalse();

    identifier?.setValue('test@example.com');
    expect(identifier?.valid).toBeTrue();

    identifier?.setValue('123456');
    expect(identifier?.valid).toBeTrue();
  });

  it('should not call recoverPassword service if form is invalid ❌', () => {
    spyOn(mockService, 'recoverPassword');
    component.onSubmit();
    expect(mockService.recoverPassword).not.toHaveBeenCalled();
  });

  it('should call recoverPassword service if form is valid ✅', () => {
    spyOn(mockService, 'recoverPassword').and.returnValue(of({ message: 'ok' }));
    component.form.get('identifier')?.setValue('test@example.com');
    component.onSubmit();
    expect(mockService.recoverPassword).toHaveBeenCalledWith('test@example.com');
  });

  it('should show success Swal when recoverPassword succeeds 🎉', fakeAsync(() => {
    const swalSpy = spyOn(Swal, 'fire');
    component.form.get('identifier')?.setValue('test@example.com');
    component.onSubmit();
    tick(); // Simula tiempo para el subscribe
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: 'Revisa tu correo',
      text: 'Correo enviado correctamente',
      confirmButtonText: 'Aceptar',
    }));
  }));

  it('should show error Swal when recoverPassword fails 💥', fakeAsync(() => {
    spyOn(mockService, 'recoverPassword').and.returnValue(throwError(() => new Error('Error')));
    const swalSpy = spyOn(Swal, 'fire');
    component.form.get('identifier')?.setValue('test@example.com');
    component.onSubmit();
    tick();
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error inesperado',
      text: 'Ocurrió un error al enviar el correo. Intenta más tarde.',
    }));
  }));
});
