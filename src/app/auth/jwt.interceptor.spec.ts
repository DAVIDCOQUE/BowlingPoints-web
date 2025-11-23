import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { JwtUtilsService } from '../auth/jwt-utils.service';
import { NavigationUtil } from '../utils/navigation.util';

describe('JwtInterceptor (simplificado)', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let jwtUtils: jasmine.SpyObj<JwtUtilsService>;

  beforeEach(() => {
    const jwtUtilsSpy = jasmine.createSpyObj('JwtUtilsService', ['decode']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: JwtUtilsService, useValue: jwtUtilsSpy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
      ]
    });

    jwtUtils = TestBed.inject(JwtUtilsService) as jasmine.SpyObj<JwtUtilsService>;
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('debe permitir la petición sin token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('debe agregar header Authorization si el token es válido', () => {
    const token = 'valid-token';
    const futureExp = Math.floor(Date.now() / 1000) + 1000;

    spyOn(localStorage, 'getItem').and.returnValue(token);
    jwtUtils.decode.and.returnValue({ exp: futureExp });

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('debe agregar Authorization si el token no tiene exp', () => {
    const token = 'no-exp-token';

    spyOn(localStorage, 'getItem').and.returnValue(token);
    jwtUtils.decode.and.returnValue({}); // sin campo exp

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('debe redirigir si el token es inválido', (done) => {
    const invalidToken = 'invalid-token';

    // Simula token en localStorage
    spyOn(localStorage, 'getItem').and.returnValue(invalidToken);

    // Simula error al decodificar
    jwtUtils.decode.and.throwError(new Error('Decoding error'));

    const removeSpy = spyOn(localStorage, 'removeItem');
    const redirectSpy = spyOn(NavigationUtil, 'redirectToLogin');

    httpClient.get('/api/test').subscribe({
      error: (err) => {
        expect(err.message).toBe('Token inválido');
        expect(removeSpy).toHaveBeenCalledWith('jwt_token');
        expect(redirectSpy).toHaveBeenCalled();
        done();
      }
    });

    httpMock.expectNone('/api/test');
  });

  it('debe redirigir si el token está expirado', (done) => {
    const expiredToken = 'expired-token';
    const pastExp = Math.floor(Date.now() / 1000) - 1000; // expirado

    spyOn(localStorage, 'getItem').and.returnValue(expiredToken);
    jwtUtils.decode.and.returnValue({ exp: pastExp });

    const removeSpy = spyOn(localStorage, 'removeItem');
    const redirectSpy = spyOn(NavigationUtil, 'redirectToLogin');

    httpClient.get('/api/test').subscribe({
      error: (err) => {
        expect(err.message).toBe('Token expirado');
        expect(removeSpy).toHaveBeenCalledWith('jwt_token');
        expect(redirectSpy).toHaveBeenCalled();
        done();
      }
    });

    httpMock.expectNone('/api/test');
  });



});
