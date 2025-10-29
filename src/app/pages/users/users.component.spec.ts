import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { IRole } from 'src/app/model/role.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserApiService } from 'src/app/services/user-api.service';
import { Validators } from '@angular/forms';
import { IUser } from 'src/app/model/user.interface';
import { HttpTestingController } from '@angular/common/http/testing';
import { FormGroup, FormControl } from '@angular/forms';

// Mock mínimo para AuthService
class AuthServiceMock {
  baseUrl = 'https://api.bowlingpoints.test';
}

class UserApiServiceMock {
  // Usamos un spy para poder cambiar el retorno en cada test
  getUsers = jasmine.createSpy('getUsers').and.returnValue(of([]));
  getRoles = jasmine.createSpy('getRoles').and.returnValue(of([]));
  createUser = jasmine
    .createSpy('createUser')
    .and.returnValue(of({ ok: true }));
  updateUser = jasmine
    .createSpy('updateUser')
    .and.returnValue(of({ ok: true }));
  deleteUser = jasmine
    .createSpy('deleteUser')
    .and.returnValue(of({ ok: true }));
}

function fillValidForm(c: UsersComponent, roleId = 2, password = 'secret') {
  c.roles = [
    { roleId: 1, name: 'Admin' },
    { roleId: 2, name: 'Jugador' },
  ] as any;

  c.userForm.patchValue({
    document: '123',
    fullName: 'Test',
    fullSurname: 'User',
    email: 't@x.com',
    phone: '555',
    gender: 'Masculino',
    photoUrl: '/img/t.png',
    categories: [],
    roles: [roleId],
    status: true,
    password,
    confirm: password,
  });
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: UserApiService, useClass: UserApiServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debe retornar la URL base desde el AuthService', () => {
    const mockUrl = 'http://localhost:8080/api';
    (component as any).authService = { baseUrl: mockUrl };
    expect(component.apiUrl).toBe(mockUrl);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on ngOnInit', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.controls['nickname']).toBeDefined();
  });

  it('debe ejecutar los métodos de carga en ngOnInit', () => {
    const spyInit = spyOn(component, 'initForm');
    const spyUsers = spyOn(component, 'getUsers');
    const spyRoles = spyOn(component, 'getRoles');
    const spyCategories = spyOn(component, 'getCategories');

    component.ngOnInit();

    expect(spyInit).toHaveBeenCalled();
    expect(spyUsers).toHaveBeenCalled();
    expect(spyRoles).toHaveBeenCalled();
    expect(spyCategories).toHaveBeenCalled();
  });

  it('should mark form as touched if invalid on submit', () => {
    spyOn(Swal, 'fire');
    component.userForm.patchValue({ nickname: '' }); // required
    component.saveForm();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('debe inicializar correctamente el formulario con sus validadores', () => {
    component.initForm();

    const form = component.userForm;

    // Validamos que el formulario se haya creado
    expect(form).toBeTruthy();
    expect(form.contains('email')).toBeTrue();
    expect(form.contains('password')).toBeTrue();

    // Validamos que algunos campos tengan validadores
    expect(form.get('email')?.hasValidator(Validators.required)).toBeTrue();
    expect(form.get('email')?.hasValidator(Validators.email)).toBeTrue();
  });

  it('should open modal and reset form for new user', () => {
    component.idUser = null;
    component.userForm.patchValue({ nickname: 'TestUser' });
    component.openModal('fake-template');
    expect(component.userForm.value.nickname).toBeNull();
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should close modal and reset form on closeModal', () => {
    component.userForm.patchValue({ nickname: 'TestUser' });
    component.closeModal();
    expect(component.userForm.value.nickname).toBeNull();
    expect(component.idUser).toBeNull();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should filter users by term', () => {
    component.usuarios = [
      {
        userId: 1,
        nickname: 'testUser',
        password: 'dummy',
        roles: [{ roleId: 1, name: 'Admin' }] as any,
        categories: [],
        fullName: 'Juan',
        fullSurname: 'Pérez',
        document: '123',
        email: 'juan@test.com',
        phone: '123456',
        gender: 'Masculino',
        personId: 1,
        clubId: 1,
        club2: { clubId: 1, name: 'Club Uno' },
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        lastLoginAt: new Date(),
        sub: 'sub01',
      } as IUser,
    ];

    component.filter = 'juan';
    const filtered = component.usuariosFiltrados;
    expect(filtered.length).toBe(1);
  });

  it('debe cargar los datos del usuario seleccionado al editar', () => {
    const mockUser = {
      userId: 10,
      document: '123',
      fullName: 'Juan',
      fullSurname: 'Pérez',
      email: 'juan@test.com',
      phone: '123456',
      gender: 'Masculino',
      status: true,
      birthDate: new Date('1990-01-01'),
      photoUrl: 'foto.png',
      roles: [{ roleId: 1 }] as any,
      categories: [{ categoryId: 2 }] as any,
    };

    component.userForm.patchValue = jasmine.createSpy('patchValue');
    component.editUser(mockUser as any);

    expect(component.idUser).toBe(10);
    expect(component.userForm.patchValue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        fullName: 'Juan',
        email: 'juan@test.com',
        gender: 'Masculino',
      })
    );
  });

  it('should patch form and open modal when editing user', () => {
    const mockUser = {
      userId: 1,
      nickname: 'testUser',
      password: 'dummy',
      roles: [{ roleId: 1, name: 'Admin' }],
      fullName: 'Juan',
      fullSurname: 'Pérez',
      document: '123',
      email: 'juan@test.com',
      phone: '123456',
      gender: 'Masculino',
      personId: 1,
      clubId: 1,
      sub: '1',
      categories: [],
      lastLoginAt: new Date(),
      status: true,
    } as any;

    component.roles = [{ roleId: 1, name: 'Admin' } as any];
    component.editUser(mockUser);
    expect(component.userForm.value.nickname).toBe('testUser');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should clear the search filter', () => {
    component.filter = 'admin';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('debe devolver todos los usuarios si el filtro está vacío o solo espacios', () => {
    component.usuarios = [
      { userId: 1, fullName: 'Juan Pérez' } as any,
      { userId: 2, fullName: 'Ana Gómez' } as any,
    ];

    component.filter = ''; // vacío
    expect(component.usuariosFiltrados.length).toBe(2);

    component.filter = '   '; // espacios
    expect(component.usuariosFiltrados.length).toBe(2);
  });

  it('debe filtrar usuarios por nombre o apellido', () => {
    component.usuarios = [
      { userId: 1, fullName: 'Juan Pérez', fullSurname: 'Pérez' } as any,
      { userId: 2, fullName: 'Ana Gómez', fullSurname: 'Gómez' } as any,
    ];

    component.filter = 'juan';
    const result = component.usuariosFiltrados;

    expect(result.length).toBe(1);
    expect(result[0].fullName).toContain('Juan');
  });

  it('should fallback to default image on error', () => {
    const targetMock = { src: 'original' };
    const fakeEvent = { target: targetMock } as unknown as Event;
    const defaultPath = 'assets/default.png';

    component.onImgError(fakeEvent, defaultPath);

    expect(targetMock.src).toBe(defaultPath);
  });

  it('apiUrl debe devolver AuthService.baseUrl', () => {
    const svc = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    // cambiamos el valor para comprobar que el getter usa el servicio
    svc.baseUrl = 'https://api.mocked.example';
    expect(component.apiUrl).toBe('https://api.mocked.example');
  });

  it('debe cargar usuarios correctamente desde la API', () => {
    const mockUsuarios = [{ userId: 1, fullName: 'Juan Pérez' }];

    fixture.detectChanges(); // dispara ngOnInit
    const req = httpMock.expectOne(`${component.apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsuarios); // simula respuesta exitosa

    expect(component.usuarios.length).toBe(1);
    expect(component.usuarios[0].fullName).toBe('Juan Pérez');
  });

  it('debe manejar error al cargar usuarios', () => {
    const consoleSpy = spyOn(console, 'error');
    fixture.detectChanges();

    const req = httpMock.expectOne(`${component.apiUrl}/users`);
    req.error(new ErrorEvent('Network error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar usuarios:',
      jasmine.any(ErrorEvent)
    );
  });

  it('getUsers() debe asignar this.usuarios cuando la API responde (happy path)', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;
    const mock = [
      { userId: 1, nickname: 'alpha' } as any,
      { userId: 2, nickname: 'beta' } as any,
    ];

    api.getUsers.and.returnValue(of(mock));

    component.usuarios = []; // estado inicial
    component.getUsers(); // act

    expect(api.getUsers).toHaveBeenCalled();
    expect(component.usuarios).toEqual(mock); // assert
  });

  it('getUsers() debe manejar error: loguea con console.error y NO cambia this.usuarios', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;

    // Forzamos error desde la API
    api.getUsers.and.returnValue(throwError(() => new Error('boom')));
    const logSpy = spyOn(console, 'error');

    const snapshot = [{ userId: 99, nickname: 'keep' } as any];
    component.usuarios = [...snapshot]; // estado previo para verificar que no cambie

    component.getUsers(); // act

    expect(api.getUsers).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Error al cargar usuarios:',
      jasmine.any(Error)
    );
    expect(component.usuarios).toEqual(snapshot); // no debe sobreescribir en error
  });

  it('debe manejar error al cargar roles', () => {
    const consoleSpy = spyOn(console, 'error');
    component.getRoles();

    const req = httpMock.expectOne(`${component.apiUrl}/roles`);
    req.error(new ErrorEvent('Network error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar roles:',
      jasmine.any(ErrorEvent)
    );
  });

  it('getRoles() debe asignar this.roles cuando la API responde (happy path)', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;
    const mockRoles: IRole[] = [
      { roleId: 1, name: 'Admin' },
      { roleId: 2, name: 'Jugador' },
    ] as IRole[];

    api.getRoles.and.returnValue(of(mockRoles));

    component.roles = []; // estado inicial
    component.getRoles(); // act

    expect(api.getRoles).toHaveBeenCalled();
    expect(component.roles).toEqual(mockRoles); // assert
  });

  it('getRoles() debe manejar error: loguea con console.error y NO cambia this.roles', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;
    api.getRoles.and.returnValue(throwError(() => new Error('boom')));

    const logSpy = spyOn(console, 'error');

    const snapshot: IRole[] = [{ roleId: 99, name: 'Keep' } as IRole];
    component.roles = [...snapshot]; // estado previo para verificar que no cambie

    component.getRoles(); // act

    expect(api.getRoles).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Error al cargar roles:',
      jasmine.any(Error)
    );
    expect(component.roles).toEqual(snapshot); // no debe sobreescribir en error
  });

  it('usuariosFiltrados: retorna todos si el filtro está vacío o solo espacios', () => {
    component.usuarios = [
      {
        userId: 1,
        nickname: 'alpha',
        fullName: 'Ana',
        fullSurname: 'García',
        email: 'a@x.com',
        phone: '111',
        roles: [],
      } as any,
      {
        userId: 2,
        nickname: 'beta',
        fullName: 'Bruno',
        fullSurname: 'López',
        email: 'b@x.com',
        phone: '222',
        roles: [],
      } as any,
    ];

    component.filter = ''; // vacío
    expect(component.usuariosFiltrados.length).toBe(2);

    component.filter = '   '; // solo espacios → se hace trim() y sigue vacío
    expect(component.usuariosFiltrados.length).toBe(2);
  });

  it('usuariosFiltrados: filtra por nickname/email/phone ignorando mayúsculas', () => {
    component.usuarios = [
      {
        userId: 1,
        nickname: 'TestUser',
        fullName: 'Juan',
        fullSurname: 'Pérez',
        email: 'test@example.com',
        phone: '5551234567',
        roles: [],
      } as any,
      {
        userId: 2,
        nickname: 'otro',
        fullName: 'Maria',
        fullSurname: 'Lopez',
        email: 'maria@site.com',
        phone: '999',
        roles: [],
      } as any,
    ];

    component.filter = 'TESTUSER'; // debería hacer match por nickname
    expect(component.usuariosFiltrados.map((u) => u.userId)).toEqual([1]);

    component.filter = 'example.com'; // debería hacer match por email
    expect(component.usuariosFiltrados.map((u) => u.userId)).toEqual([1]);

    component.filter = '999'; // debería hacer match por phone
    expect(component.usuariosFiltrados.map((u) => u.userId)).toEqual([2]);
  });

  it('usuariosFiltrados: filtra por roles.description usando some() (case-insensitive y trim)', () => {
    component.usuarios = [
      {
        userId: 1,
        nickname: 'uno',
        fullName: 'Carlos',
        fullSurname: 'Ramos',
        email: 'c@a.com',
        phone: '111',
        roles: [{ roleId: 1, description: 'Administrador' }] as any[],
      } as any,
      {
        userId: 2,
        nickname: 'dos',
        fullName: 'Pedro',
        fullSurname: 'Gomez',
        email: 'p@a.com',
        phone: '222',
        roles: [{ roleId: 2, description: 'Jugador' }] as any[],
      } as any,
    ];

    component.filter = '   ADMIN   '; // con espacios y mayúsculas
    expect(component.usuariosFiltrados.map((u) => u.userId)).toEqual([1]);

    component.filter = 'jugador';
    expect(component.usuariosFiltrados.map((u) => u.userId)).toEqual([2]);
  });

  it('saveForm(): si el formulario es inválido, marca touched y retorna', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;

    // Forzamos inválido: nickname vacío (ajusta si tu form tiene otras reglas)
    component.userForm.patchValue({ nickname: '' });

    const markSpy = spyOn(
      component.userForm,
      'markAllAsTouched'
    ).and.callThrough();

    component.saveForm();

    expect(markSpy).toHaveBeenCalled();
    expect(api.createUser).not.toHaveBeenCalled();
    expect(api.updateUser).not.toHaveBeenCalled();
  });

  it('saveForm(): crea usuario cuando no hay idUser e incluye password en el payload', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;

    component.idUser = null; // create
    fillValidForm(component, /*roleId*/ 2, /*password*/ 'abc123');

    component.saveForm();

    expect(api.createUser).toHaveBeenCalledTimes(1);
    const sent = api.createUser.calls.mostRecent().args[0] as any;

    // role armado con descripción desde roles[]
    expect(sent.roles[0]).toEqual({ roleId: 2, description: 'Jugador' });
    // password debe existir en creación
    expect(sent.password).toBe('abc123');
    expect(sent.nickname).toBe('tester');
  });

  it('saveForm(): edita usuario y NO envía password si está vacío', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;

    component.idUser = 10; // edit
    fillValidForm(component, /*roleId*/ 1, /*password*/ ''); // password vacío

    component.saveForm();

    expect(api.updateUser).toHaveBeenCalledTimes(1);
    const [id, payload] = api.updateUser.calls.mostRecent().args as [
      number,
      any
    ];

    expect(id).toBe(10);
    expect(payload.roles[0]).toEqual({ roleId: 1, description: 'Admin' });
    // password NO debería existir en el payload
    expect('password' in payload).toBeFalse();
  });

  it('saveForm(): edita usuario y envía password cuando viene en el formulario', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;

    component.idUser = 20; // edit
    fillValidForm(component, /*roleId*/ 2, /*password*/ 'newPass');

    component.saveForm();

    expect(api.updateUser).toHaveBeenCalledTimes(1);
    const [id, payload] = api.updateUser.calls.mostRecent().args as [
      number,
      any
    ];

    expect(id).toBe(20);
    expect(payload.password).toBe('newPass'); // presente en edición si se proporcionó
  });

  it('debe cargar categorías correctamente desde la API', () => {
    const mockCategorias = [{ categoryId: 1, name: 'Senior' }];
    component.getCategories();

    const req = httpMock.expectOne(`${component.apiUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategorias);

    expect(component.categories.length).toBe(1);
    expect(component.categories[0].name).toBe('Senior');
  });

  it('debe manejar error al cargar categorías', () => {
    const consoleSpy = spyOn(console, 'error');
    component.getCategories();

    const req = httpMock.expectOne(`${component.apiUrl}/categories`);
    req.error(new ErrorEvent('Network error'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar categorías:',
      jasmine.any(ErrorEvent)
    );
  });

  it('debe marcar el formulario como touched y salir si es inválido', () => {
    component.userForm.markAllAsTouched = jasmine.createSpy('markAllAsTouched');
    spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(true);

    component.saveForm();

    expect(component.userForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.loading).toBeFalsy();
  });

  it('debe preparar payload correctamente cuando el formulario es válido (modo creación)', () => {
    spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(false);

    component.userForm.getRawValue = jasmine
      .createSpy('getRawValue')
      .and.returnValue({
        photoUrl: 'test.png',
        document: '123',
        email: 'juan@test.com',
        fullName: 'Juan',
        fullSurname: 'Pérez',
        phone: '123456',
        gender: 'Masculino',
        birthDate: new Date('1990-01-01'),
        status: true,
        categories: [1],
        roles: [2],
      });

    component.idUser = null;
    component.loading = false;

    component.saveForm();

    expect(component.loading).toBeTrue();
    expect(component.userForm.getRawValue).toHaveBeenCalled();
  });

  describe('UsersComponent - saveForm() con llamadas al API', () => {
    beforeEach(() => {
      (component as any)['userApi'] = jasmine.createSpyObj('userApi', [
        'updateUser',
        'createUser',
      ]);
      spyOn(Swal, 'fire');
      spyOn(component, 'getUsers');
      spyOn(component, 'closeModal');
    });

    it('debe actualizar usuario correctamente cuando isEdit = true', () => {
      spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(
        false
      );
      component.userForm.getRawValue = jasmine
        .createSpy()
        .and.returnValue({ password: '1234' });
      component.idUser = 99;

      const mockRequest = of({}); // simulamos observable exitoso
      ((component as any)['userApi'].updateUser as jasmine.Spy).and.returnValue(
        mockRequest
      );

      component.saveForm();

      expect(component['userApi'].updateUser).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Éxito',
        'Usuario actualizado correctamente',
        'success'
      );
      expect(component.getUsers).toHaveBeenCalled();
      expect(component.closeModal).toHaveBeenCalled();
      expect(component.loading).toBeFalse(); // finalize()
    });

    it('debe manejar el error al crear usuario correctamente', () => {
      spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(
        false
      );
      component.userForm.getRawValue = jasmine
        .createSpy()
        .and.returnValue({ password: '1234' });
      component.idUser = null;

      const mockError = { error: { message: 'Fallo en servidor' } };
      const mockRequest = throwError(() => mockError);
      ((component as any)['userApi'].createUser as jasmine.Spy).and.returnValue(
        mockRequest
      );

      component.saveForm();

      expect(component['userApi'].createUser).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'Fallo en servidor',
        'error'
      );
      expect(component.loading).toBeFalse(); // finalize()
    });
  });

  it('debe manejar el caso cuando status viene como string', () => {
    spyOnProperty(component.userForm, 'invalid', 'get').and.returnValue(true);

    component.userForm.getRawValue = jasmine
      .createSpy('getRawValue')
      .and.returnValue({
        status: 'true',
        photoUrl: '',
        categories: [],
        roles: [],
      });

    component.idUser = 5; // modo edición

    component.saveForm();

    expect(component.loading).toBeTrue();
    expect(component.userForm.getRawValue).toHaveBeenCalled();
  });

  it('debe eliminar el usuario cuando se confirma la alerta', async () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true }) as any
    );
    const getUsersSpy = spyOn(component, 'getUsers');

    await component.deleteUser(10);

    expect(api.deleteUser).toHaveBeenCalledWith(10);
    expect(getUsersSpy).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Eliminado',
      'El usuario ha sido eliminado',
      'success'
    );
  });

  it('no debe eliminar si el usuario cancela la alerta', async () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: false }) as any
    );

    await component.deleteUser(10);

    expect(api.deleteUser).not.toHaveBeenCalled();
  });

  describe('openModal y closeModal', () => {
    it('debe resetear el formulario y abrir el modal si no hay idUser', () => {
      component.idUser = null;
      const modalSpy = spyOn(component['modalService'], 'open');
      const resetSpy = spyOn(component.userForm, 'reset');

      component.openModal('fake-template');

      expect(resetSpy).toHaveBeenCalled();
      expect(modalSpy).toHaveBeenCalledWith('fake-template');
    });

    it('no debe resetear el formulario si ya hay idUser', () => {
      component.idUser = 10;
      const resetSpy = spyOn(component.userForm, 'reset');
      const modalSpy = spyOn(component['modalService'], 'open');

      component.openModal('fake-template');

      expect(resetSpy).not.toHaveBeenCalled();
      expect(modalSpy).toHaveBeenCalled();
    });

    it('debe cerrar el modal y limpiar el formulario', () => {
      const dismissSpy = spyOn(component['modalService'], 'dismissAll');
      const resetSpy = spyOn(component.userForm, 'reset');

      component.closeModal();

      expect(dismissSpy).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
      expect(component.idUser).toBeNull();
    });

    describe('setPasswordValidatorsForMode', () => {
      it('debe asignar solo minLength si está en modo edición', () => {
        // Simular formulario
        const passwordCtrl = component.userForm.get('password')!;
        const confirmCtrl = component.userForm.get('confirm')!;

        // Ejecutar modo edición
        component['setPasswordValidatorsForMode'](true);

        // Validamos que tenga solo minLength
        const passErrors = passwordCtrl.validator?.({} as any);
        const confErrors = confirmCtrl.validator?.({} as any);

        expect(passErrors).toBeNull(); // minLength(3) no falla con objeto vacío
        expect(confErrors).toBeNull(); // sin validators
      });

      it('debe asignar required y minLength si está en modo creación', () => {
        const passwordCtrl = component.userForm.get('password')!;
        const confirmCtrl = component.userForm.get('confirm')!;

        // Ejecutar modo creación
        component['setPasswordValidatorsForMode'](false);

        // Validamos que haya validadores requeridos
        passwordCtrl.setValue('');
        confirmCtrl.setValue('');

        expect(passwordCtrl.errors?.['required']).toBeTruthy();
        expect(confirmCtrl.errors?.['required']).toBeTruthy();
      });
    });

    describe('passwordsMatchValidator', () => {
      let formGroup: FormGroup;

      beforeEach(() => {
        formGroup = component['formBuilder'].group({
          password: [''],
          confirm: [''],
        });
      });

      it('debe retornar null si ambas contraseñas están vacías', () => {
        formGroup.patchValue({ password: '', confirm: '' });
        const result = component['passwordsMatchValidator'](formGroup);
        expect(result).toBeNull();
      });

      it('debe retornar null si las contraseñas coinciden', () => {
        formGroup.patchValue({ password: 'abc123', confirm: 'abc123' });
        const result = component['passwordsMatchValidator'](formGroup);
        expect(result).toBeNull();
      });

      it('debe retornar error si las contraseñas no coinciden', () => {
        formGroup.patchValue({ password: 'abc123', confirm: 'xyz' });
        const result = component['passwordsMatchValidator'](formGroup);
        expect(result).toEqual({ passwordsMismatch: true });
      });
    });

    it('debe retornar true si hay error y los campos fueron tocados', () => {
      component.userForm.setErrors({ passwordsMismatch: true });
      component.userForm.get('password')?.markAsTouched();
      expect(component.passwordMismatchVisible).toBeTrue();
    });
  });
  // ------------------------------------------------------
  // 🧩 Tests unitarios de métodos utilitarios del componente
  // ------------------------------------------------------

  describe('Métodos utilitarios del UsersComponent', () => {
    describe('getStatusLabel()', () => {
      it('debe retornar "Activo" si el valor es true', () => {
        expect(component.getStatusLabel(true)).toBe('Activo');
      });

      it('debe retornar "Inactivo" si el valor es false', () => {
        expect(component.getStatusLabel(false)).toBe('Inactivo');
      });
    });

    describe('passwordMismatchVisible', () => {
      it('debe retornar false cuando no hay error de passwordsMismatch', () => {
        component.userForm.setErrors(null);
        expect(component.passwordMismatchVisible).toBeFalse();
      });

      it('debe retornar true cuando hay error passwordsMismatch y los campos fueron tocados', () => {
        component.userForm.setErrors({ passwordsMismatch: true });
        component.userForm.get('password')?.markAsTouched();
        expect(component.passwordMismatchVisible).toBeTrue();
      });

      it('debe retornar false cuando no hay campos tocados', () => {
        component.userForm.setErrors({ passwordsMismatch: true });
        component.userForm.get('password')?.markAsUntouched();
        component.userForm.get('confirm')?.markAsUntouched();
        expect(component.passwordMismatchVisible).toBeFalse();
      });
    });

    describe('getRoleNameById()', () => {
      it('debe retornar el nombre del rol si existe', () => {
        component.roles = [
          { roleId: 1, name: 'Admin' } as any,
          { roleId: 2, name: 'Jugador' } as any,
        ];
        expect(component.getRoleNameById(2)).toBe('Jugador');
      });

      it('debe retornar cadena vacía si el rol no existe', () => {
        component.roles = [{ roleId: 1, name: 'Admin' } as any];
        expect(component.getRoleNameById(99)).toBe('');
      });
    });

    describe('getRoleNames()', () => {
      it('debe retornar los nombres concatenados de los roles', () => {
        const mockUser = {
          roles: [{ name: 'Admin' }, { name: 'Entrenador' }],
        } as any;
        const result = component.getRoleNames(mockUser);
        expect(result).toBe('Admin, Entrenador');
      });

      it('debe retornar una cadena vacía si el usuario no tiene roles', () => {
        const mockUser = { roles: [] } as any;
        const result = component.getRoleNames(mockUser);
        expect(result).toBe('');
      });

      it('debe retornar cadena vacía si roles es null o undefined', () => {
        const mockUser = { roles: null } as any;
        const result = component.getRoleNames(mockUser);
        expect(result).toBe('');
      });
    });
  });
});
