import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IUser } from '../model/user.interface';
import { environment } from 'src/environments/environment';

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
    roles: [{ roleId: 1, description: 'ADMIN' }],
    status: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    sub: 'abc123',
    password: 'dummy-password',
  };

  function respondUsersMe(user: any = mockUser, ok: boolean = true) {
    const pend = httpMock.match(`${environment.apiUrl}/users/me`);
    pend.forEach((r) => {
      if (ok) r.flush({ data: user });
      else r.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener y guardar el token', () => {
    localStorage.setItem('jwt_token', 'mock-token');
    expect(service.getToken()).toBe('mock-token');
  });

  it('debería devolver false si no hay token', () => {
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('debería devolver true si hay token', () => {
    localStorage.setItem('jwt_token', 'token');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('debería guardar datos de autenticación y actualizar el usuario', () => {
    service.setAuthData('mock-token');
    respondUsersMe(mockUser);
    expect(localStorage.getItem('jwt_token')).toBe('mock-token');
    expect(service.user).toEqual(mockUser);
  });

  it('debería limpiar storage y usuario al cerrar sesión', () => {
    service.setAuthData('mock-token');
    respondUsersMe(mockUser);
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.user).toBeNull();
  });

  it('debería decodificar correctamente el token', () => {
    const payload = btoa(JSON.stringify(mockUser));
    const token = `header.${payload}.signature`;
    localStorage.setItem('jwt_token', token);
    const decoded = service.decodeToken();
    expect(decoded?.email).toBe('john@example.com');
  });

  it('debería obtener el nombre del usuario desde el token', () => {
    const payload = btoa(
      JSON.stringify({ ...mockUser, sub: mockUser.fullName })
    );
    localStorage.setItem('jwt_token', `header.${payload}.signature`);
    expect(service.getUsername()).toBe(mockUser.fullName);
  });

  it('debería obtener los roles desde el token', () => {
    const payload = btoa(
      JSON.stringify({ ...mockUser, roles: ['ADMIN'] } as any)
    );
    localStorage.setItem('jwt_token', `header.${payload}.signature`);
    expect(service.getRoles()).toEqual(['ADMIN']);
  });

  it('debería devolver INVITADO si no hay roles', () => {
    const userWithoutRoles = { ...mockUser, roles: undefined };
    const payload = btoa(JSON.stringify(userWithoutRoles));
    localStorage.setItem('jwt_token', `header.${payload}.signature`);
    expect(service.getRoles()).toEqual(['INVITADO']);
  });

  it('debería ejecutar fetchUser() y actualizar el estado', () => {
    const token = 'valid.jwt.token';
    localStorage.setItem('jwt_token', token);

    service.fetchUser().subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(service.user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({ data: mockUser });
  });

  it('debería devolver null si no hay token en fetchUser()', () => {
    service.fetchUser().subscribe((user) => {
      expect(user).toBeNull();
    });
  });

  // ✅ Pruebas para hasRole()

  it('debería devolver true si el usuario tiene el rol requerido', () => {
    const payload = btoa(
      JSON.stringify({ ...mockUser, roles: ['Administrador'] } as any)
    );
    localStorage.setItem('jwt_token', `header.${payload}.signature`);
    expect(service.hasRole('Administrador')).toBeTrue();
  });

  it('debería devolver false si el usuario no tiene el rol requerido', () => {
    const payload = btoa(
      JSON.stringify({ ...mockUser, roles: ['Usuario'] } as any)
    );
    localStorage.setItem('jwt_token', `header.${payload}.signature`);
    expect(service.hasRole('Administrador')).toBeFalse();
  });

  it('debería devolver false si roleDescription está vacío', () => {
    const payload = btoa(JSON.stringify({ ...mockUser, roles: [] } as any));
    localStorage.setItem('jwt_token', `header.${payload}.signature`);
    expect(service.hasRole('Administrador')).toBeFalse();
  });

  it('debería devolver false si no hay usuario cargado', () => {
    expect(service.hasRole('Administrador')).toBeFalse();
  });
});
