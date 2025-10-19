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
}

function fillValidForm(c: UsersComponent, roleId = 2, password = 'secret') {
  c.roles = [
    { roleId: 1, description: 'Admin' },
    { roleId: 2, description: 'Jugador' },
  ] as any;

  c.userForm.setValue({
    nickname: 'tester',
    photoUrl: '/img/t.png',
    document: '123',
    email: 't@x.com',
    fullName: 'Test',
    fullSurname: 'User',
    phone: '555',
    gender: 'Masculino',
    roleId,
    password,
  });
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

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
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on ngOnInit', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.controls['nickname']).toBeDefined();
  });

  it('should mark form as touched if invalid on submit', () => {
    spyOn(Swal, 'fire');
    component.userForm.patchValue({ nickname: '' }); // required
    component.saveForm();
    expect(Swal.fire).not.toHaveBeenCalled();
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
        roles: [] as IRole[],
        fullName: 'Juan',
        fullSurname: 'Pérez',
        document: '123',
        email: 'juan@test.com',
        phone: '123456',
        gender: 'Masculino',
        personId: 1,
        clubId: 1,
        sub: '',
      },
    ];

    component.filter = 'juan';
    const filtered = component.usuariosFiltrados;
    expect(filtered.length).toBe(1);
  });

  it('should patch form and open modal when editing user', () => {
    const mockUser = {
      userId: 1,
      personId: 1,
      nickname: 'testUser',
      password: 'dummy',
      roles: [] as IRole[],
      fullName: 'Juan',
      fullSurname: 'Pérez',
      document: '123',
      email: 'juan@test.com',
      phone: '123456',
      gender: 'Masculino',
      clubId: 1,
      sub: '1',
    };

    component.roles = [{ roleId: 1, description: 'Administrador' }];
    component.editUser(mockUser);
    expect(component.userForm.value.nickname).toBe('testUser');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should clear the search filter', () => {
    component.filter = 'admin';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should return role description by ID', () => {
    component.roles = [{ roleId: 1, description: 'Admin' }];
    const desc = component.getRoleDescriptionById(1);
    expect(desc).toBe('Admin');
  });

  it('should return role ID by description', () => {
    component.roles = [{ roleId: 5, description: 'Usuario' }];
    const roleId = component.getRoleIdByDescription('Usuario');
    expect(roleId).toBe(5);
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

  it('getRoles() debe asignar this.roles cuando la API responde (happy path)', () => {
    const api = TestBed.inject(UserApiService) as unknown as UserApiServiceMock;
    const mockRoles: IRole[] = [
      { roleId: 1, description: 'Admin' },
      { roleId: 2, description: 'Jugador' },
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

    const snapshot: IRole[] = [{ roleId: 99, description: 'Keep' } as IRole];
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
});
