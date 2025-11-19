import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecoverPasswordService } from './recover-password.service';
import { environment } from 'src/environments/environment';

describe('RecoverPasswordService', () => {
  let service: RecoverPasswordService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecoverPasswordService]
    });

    service = TestBed.inject(RecoverPasswordService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Asegura que no queden llamadas pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to recover password', () => {
    const identifier = 'test@example.com';
    const mockResponse = { message: 'Correo enviado' };

    service.recoverPassword(identifier).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/recover-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ identifier });

    req.flush(mockResponse);
  });

  it('should send POST request to reset password', () => {
    const token = 'token123';
    const newPassword = 'newPassword123';
    const mockResponse = { message: 'Contraseña actualizada' };

    service.resetPassword(token, newPassword).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token, newPassword });

    req.flush(mockResponse);
  });
});
