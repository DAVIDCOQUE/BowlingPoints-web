import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IUser } from '../model/user.interface';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: IUser = {
    userId: 1,
    personId: 10,
    clubId: 3,
    document: '12345678',
    photoUrl: '',
    nickname: 'jdoe',
    fullName: 'John Doe',
    fullSurname: 'Doe',
    email: 'john@example.com',
    phone: '123456789',
    gender: 'M',
    categories: [],
    roles: [{ roleId: 1, name: 'ADMIN' }],
    status: true,
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-02T00:00:00.000Z'),
    sub: 'abc123',
    password: 'secret',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    localStorage.clear();
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería exponer environment.apiUrl en baseUrl', () => {
    expect(service.baseUrl).toBe(environment.apiUrl);
  });

  it('debería retornar token desde localStorage', () => {
    localStorage.setItem('jwt_token', 'abc');
    expect(service.getToken()).toBe('abc');
  });

  it('debería retornar null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('debería indicar si está logueado', () => {
    localStorage.setItem('jwt_token', 'token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('debería indicar si NO está logueado', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('debería decodificar token y extraer email', () => {
    const tokenPayload = btoa(JSON.stringify({ email: 'test@mail.com' }));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.getEmail()).toBe('test@mail.com');
  });

  it('debería devolver null si token no tiene email', () => {
    const tokenPayload = btoa(JSON.stringify({}));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.getEmail()).toBeNull();
  });

  it('debería devolver null si token no existe', () => {
    expect(service.getEmail()).toBeNull();
  });

  it('debería obtener el username desde sub', () => {
    const tokenPayload = btoa(JSON.stringify({ sub: 'user123' }));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.getUsername()).toBe('user123');
  });

  it('debería devolver roles desde token', () => {
    const tokenPayload = btoa(JSON.stringify({ roles: ['ADMIN'] }));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.getRoles()).toEqual(['ADMIN']);
  });

  it('debería devolver ["INVITADO"] si no hay roles', () => {
    const tokenPayload = btoa(JSON.stringify({}));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.getRoles()).toEqual(['INVITADO']);
  });

  it('debería validar rol con hasRole()', () => {
    spyOn(console, 'log');
    const tokenPayload = btoa(JSON.stringify({ roles: ['Admin'] }));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.hasRole('Admin')).toBeTrue();
  });

  it('debería devolver false si no tiene el rol', () => {
    const tokenPayload = btoa(JSON.stringify({ roles: ['User'] }));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.hasRole('Admin')).toBeFalse();
  });

  it('debería detectar si el usuario es invitado', () => {
    const tokenPayload = btoa(JSON.stringify({ roles: ['INVITADO'] }));
    localStorage.setItem('jwt_token', `header.${tokenPayload}.sig`);
    expect(service.isGuest()).toBeTrue();
  });

  it('debería hacer login y devolver el token', () => {
    let receivedToken = '';

    service.login('user', 'pass').subscribe((token) => {
      receivedToken = token;
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc123' });

    expect(receivedToken).toBe('abc123');
  });

  it('debería guardar token y obtener usuario', () => {
    service.setAuthData('abc123');

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({ data: mockUser });

    const storedUser = JSON.parse(localStorage.getItem('user')!);
    expect(storedUser.email).toBe('john@example.com');
    expect(service.user?.userId).toBe(1);
  });

  it('debería manejar error al cargar usuario en setAuthData()', () => {
    const spy = spyOn(console, 'error');
    service.setAuthData('bad-token');

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    req.flush('Error', { status: 500, statusText: 'Error' });

    expect(spy).toHaveBeenCalledWith(
      'Error al obtener usuario tras login:',
      jasmine.anything()
    );
    expect(service.user).toBeNull();
  });

  it('debería obtener usuario con fetchUser()', () => {
    localStorage.setItem('jwt_token', 'abc');

    service.fetchUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(service.user?.email).toBe('john@example.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    req.flush({ data: mockUser });
  });

  it('debería no llamar API si no hay token en fetchUser()', () => {
    service.fetchUser().subscribe((user) => {
      expect(user).toBeNull();
    });

    httpMock.expectNone(`${environment.apiUrl}/users/me`);
  });

  it('debería actualizar perfil del usuario', () => {
    const payload = { fullName: 'Jane Doe' };
    const updated = { ...mockUser, fullName: 'Jane Doe' };

    service.updateUserProfile(1, payload).subscribe((user) => {
      expect(user.fullName).toBe('Jane Doe');
      expect(service.user?.fullName).toBe('Jane Doe');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ data: updated });
  });


  it('debería cargar usuario desde localStorage al inicializar', () => {
    const userFromStorage = {
      ...mockUser,
      createdAt: mockUser.createdAt?.toISOString(),
      updatedAt: mockUser.updatedAt?.toISOString(),
    };

    localStorage.setItem('user', JSON.stringify(userFromStorage));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const fresh = TestBed.inject(AuthService);

    const storedUser = fresh.user!;
    expect(storedUser.email).toBe(mockUser.email);
    expect(storedUser.createdAt instanceof Date).toBeFalse(); // es string aún
    expect(typeof storedUser.createdAt).toBe('string');
  });

  it('user$ debería emitir cambios', (done) => {
    const nuevo = { ...mockUser, userId: 999 };
    (service as any).userSubject.next(nuevo);

    service.user$.subscribe((user) => {
      expect(user?.userId).toBe(999);
      done();
    });
  });
});
