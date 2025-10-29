import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IUser } from '../model/user.interface';
import { ICategory } from '../model/category.interface';
import { IRole } from '../model/role.interface';
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
    categories: [] as ICategory[],
    roles: [{ roleId: 1, name: 'ADMIN' } as IRole],
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

    localStorage.clear();
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería exponer environment.apiUrl en baseUrl', () => {
    expect(service.baseUrl).toBe(environment.apiUrl);
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

  it('inicializa user / user$ desde localStorage cuando existe "user"', () => {
    const saved: IUser = { ...mockUser };
    localStorage.setItem('user', JSON.stringify(saved));

    // Creamos un TestBed nuevo para forzar un nuevo AuthService
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    const fresh = TestBed.inject(AuthService);

    expect(fresh.user).toEqual(saved);

    let emitted!: IUser;
    fresh.user$.subscribe((v) => {
      emitted = v as IUser;
    });

    expect(emitted).toEqual(saved);
  });

  it('user$ emite cambios cuando el subject interno hace next', (done) => {
    const nuevo = { ...mockUser, userId: 999 };
    (service as any).userSubject.next(nuevo);

    service.user$.subscribe((val) => {
      expect(val).toEqual(nuevo);
      done();
    });
  });

  it('setAuthData(): si fetchUser falla, hace console.error y no setea user', () => {
    const logSpy = spyOn(console, 'error');

    // Dispara setAuthData → internamente llama a fetchUser()
    service.setAuthData('token-err');

    // Forzamos error en /users/me
    const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    // Se mantiene el token, pero NO se setea user, y se loguea el error
    expect(localStorage.getItem('jwt_token')).toBe('token-err');
    expect(service.user).toBeNull();
    expect(logSpy).toHaveBeenCalledWith(
      'Error al obtener usuario tras login:',
      jasmine.anything()
    );
  });

  it('login(): hace POST a /auth/login y retorna el token mapeado', () => {
    let emitted: string | undefined;

    service.login('john', 'secret').subscribe((t) => (emitted = t));

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    // Ojo: en el servicio es { userName: username, password }
    expect(req.request.body).toEqual({ userName: 'john', password: 'secret' });

    req.flush({ token: 'abc123' });

    expect(emitted).toBe('abc123');
  });

  it('logout(): elimina jwt_token y user del storage y emite null', (done) => {
    // Sembramos datos para comprobar que realmente los borra
    localStorage.setItem('jwt_token', 'tkn');
    localStorage.setItem('user', JSON.stringify({ foo: 'bar' }));

    // Observamos la emisión a null
    service.user$.subscribe((val) => {
      if (val === null) {
        expect(localStorage.getItem('jwt_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        done();
      }
    });

    service.logout();
  });

  it('getToken(): devuelve el token almacenado', () => {
    localStorage.setItem('jwt_token', 'stored-token');
    expect(service.getToken()).toBe('stored-token');
  });

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
