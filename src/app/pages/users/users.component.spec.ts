import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError, defer } from 'rxjs';
import Swal from 'sweetalert2';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UsersComponent } from './users.component';
import { UserApiService } from 'src/app/services/user-api.service';
import { CategoryApiService } from 'src/app/services/category-api.service';
import { AuthService } from 'src/app/auth/auth.service';
import { RoleApiService } from 'src/app/services/role-api.service';

// ✅ Importa las interfaces necesarias
import { IUser } from 'src/app/model/user.interface';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  let userApiSpy: jasmine.SpyObj<UserApiService>;
  let categoryApiSpy: jasmine.SpyObj<CategoryApiService>;
  let roleApiSpy: jasmine.SpyObj<RoleApiService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const mockUser: IUser = {
    userId: 1,
    nickname: 'tester',
    password: 'secret',
    personId: 1,
    document: '123',
    fullName: 'Test',
    fullSurname: 'User',
    email: 't@x.com',
    phone: '555',
    gender: 'Masculino',
    status: true,
    birthDate: new Date('1990-01-01'),
    photoUrl: '',
    categories: [],
    roles: [],
    sub: 'subtoken'
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: UserApiService,
          useValue: jasmine.createSpyObj('UserApiService', [
            'getUsers', 'createUser', 'updateUser', 'deleteUser'
          ])
        },
        {
          provide: CategoryApiService,
          useValue: jasmine.createSpyObj('CategoryApiService', ['getActiveCategories'])
        },
        {
          provide: RoleApiService,
          useValue: jasmine.createSpyObj('RoleApiService', ['getAll'])
        },
        {
          provide: NgbModal,
          useValue: jasmine.createSpyObj('NgbModal', ['open', 'dismissAll'])
        },
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj('AuthService', [], { baseUrl: 'http://localhost:3000' })
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;

    userApiSpy = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    categoryApiSpy = TestBed.inject(CategoryApiService) as jasmine.SpyObj<CategoryApiService>;
    roleApiSpy = TestBed.inject(RoleApiService) as jasmine.SpyObj<RoleApiService>;
    modalSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // ✅ Valores por defecto sin errores de tipado
    userApiSpy.getUsers.and.returnValue(of([]));
    roleApiSpy.getAll.and.returnValue(of([{ roleId: 1, name: 'Admin' }]));
    categoryApiSpy.getActiveCategories.and.returnValue(
      of({ success: true, message: '', data: [] })
    );
  });

  // ----------- BASICS -----------
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call data loaders on init', () => {
    spyOn(component, 'getUsers');
    spyOn(component, 'getRoles');
    spyOn(component, 'getCategories');

    component.ngOnInit();

    expect(component.getUsers).toHaveBeenCalled();
    expect(component.getRoles).toHaveBeenCalled();
    expect(component.getCategories).toHaveBeenCalled();
  });

  // ----------- LOADERS -----------
  it('should load users', () => {
    userApiSpy.getUsers.and.returnValue(of([mockUser]));
    component.getUsers();
    expect(component.usuarios.length).toBe(1);
  });

  it('should load roles and categories', () => {
    roleApiSpy.getAll.and.returnValue(of([{ roleId: 1, name: 'Admin' }]));
    categoryApiSpy.getActiveCategories.and.returnValue(
      of({ success: true, message: '', data: [{ categoryId: 1, name: 'Cat A' }] })
    );

    component.getRoles();
    component.getCategories();

    expect(component.roles[0].name).toBe('Admin');
    expect(component.categories[0].name).toBe('Cat A');
  });

  // ----------- FORM -----------
  it('should init form correctly', () => {
    component.initForm();
    expect(component.userForm.get('email')).toBeTruthy();
  });

  it('should patch values on editUser()', () => {
    component.initForm();
    spyOn(component as any, 'openModal');
    component.editUser(mockUser);
    expect(component.userForm.get('email')?.value).toBe('t@x.com');
    expect(component['openModal']).toHaveBeenCalled();
  });

  // ----------- CREATE USER SUCCESS -----------
  it('should create user successfully', fakeAsync(() => {
    spyOn(Swal, 'fire');
    component.initForm();
    component.userForm.patchValue({
      document: '123',
      fullName: 'Juan',
      fullSurname: 'Perez',
      email: 'jp@mail.com',
      birthDate: '1990-01-01',
      gender: 'Masculino',
      phone: '123456',
      photoUrl: '',
      status: true,
      roles: [1],
      categories: [1],
      password: '123',
      confirm: '123'
    });

    userApiSpy.createUser.and.returnValue(of({}));
    userApiSpy.getUsers.and.returnValue(of([]));

    component.saveForm();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Usuario creado exitosamente', 'success');
  }));

  // ----------- CREATE USER ERROR -----------
  it('should handle create user error', fakeAsync(() => {
    spyOn(Swal, 'fire');
    component.initForm();
    component.userForm.patchValue({
      document: '123',
      fullName: 'Juan',
      fullSurname: 'Perez',
      email: 'bad@mail.com',
      birthDate: '1990-01-01',
      gender: 'Masculino',
      phone: '123456',
      photoUrl: '',
      status: true,
      password: '123',
      confirm: '123',
      roles: [1],
      categories: [1]
    });

    userApiSpy.createUser.and.returnValue(
      defer(() => throwError(() => ({ error: { message: 'Error al crear usuario' } })))
    );

    component.saveForm();
    tick(10);
    fixture.detectChanges();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Error al crear usuario', 'error');
  }));

  // ----------- UPDATE USER ERROR -----------
  it('should handle update user error', fakeAsync(() => {
    spyOn(Swal, 'fire');
    component.initForm();
    component.idUser = 1;
    component.userForm.patchValue({
      document: '123',
      fullName: 'Juan',
      fullSurname: 'Perez',
      email: 'jp@mail.com',
      birthDate: '1990-01-01',
      gender: 'Masculino',
      phone: '123456',
      photoUrl: '',
      status: true,
      roles: [1],
      categories: [1]
    });

    userApiSpy.updateUser.and.returnValue(
      defer(() => throwError(() => ({ error: { message: 'Error al actualizar usuario' } })))
    );

    component.saveForm();
    tick(10);
    fixture.detectChanges();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Error al actualizar usuario', 'error');
  }));

  // ----------- DELETE USER -----------
  it('should delete user successfully', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    userApiSpy.deleteUser.and.returnValue(of({}));
    userApiSpy.getUsers.and.returnValue(of([]));
    component.deleteUser(1);
    tick();
    expect(userApiSpy.deleteUser).toHaveBeenCalledWith(1);
  }));

  it('should handle delete user error', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    userApiSpy.deleteUser.and.returnValue(
      defer(() => throwError(() => ({ error: { message: 'No se pudo eliminar el usuario' } })))
    );
    component.deleteUser(1);
    tick();
    flush();
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo eliminar el usuario', 'error');
  }));

  // ----------- MODAL -----------
  it('should open and close modal', () => {
    component.initForm();
    component.openModal('modalContent');
    expect(modalSpy.open).toHaveBeenCalled();
    component.closeModal();
    expect(modalSpy.dismissAll).toHaveBeenCalled();
  });

  // ----------- UTILITIES -----------
  it('should clear filter', () => {
    component.filter = 'abc';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should return comma-separated role names from user', () => {
    const userWithRoles = {
      ...mockUser,
      roles: [
        { roleId: 1, name: 'Admin' },
        { roleId: 2, name: 'User' }
      ]
    };
    expect(component.getRoleNames(userWithRoles)).toBe('Admin, User');
  });

  it('should replace broken image with default path', () => {
    const img = document.createElement('img');
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img });

    component.onImgError(event, 'assets/default.jpg');
    expect(img.src).toContain('assets/default.jpg');
  });


  it('should return role name by ID', () => {
    component.roles = [{ roleId: 5, name: 'Editor' }];
    expect(component.getRoleNameById(5)).toBe('Editor');
    expect(component.getRoleNameById(99)).toBe(''); // rol inexistente
  });

  it('should filter users by full name, email, and status', () => {
    component.usuarios = [
      {
        ...mockUser,
        fullName: 'Carlos',
        fullSurname: 'Lopez',
        email: 'carlos@test.com',
        phone: '1234',
        status: true,
        roles: [{ roleId: 1, name: 'Admin' }],
        categories: [{ categoryId: 1, name: 'Cat A' }]
      }
    ];

    component.filter = 'Carlos';
    expect(component.usuariosFiltrados.length).toBe(1);

    component.filter = 'admin';
    expect(component.usuariosFiltrados.length).toBe(1);

    component.filter = 'inexistente';
    expect(component.usuariosFiltrados.length).toBe(0);
  });

  it('should not save form if it is invalid', () => {
    component.initForm();
    component.userForm.patchValue({ email: '' }); // obligatorio pero vacío
    spyOn(component.userForm, 'markAllAsTouched');
    component.saveForm();
    expect(component.userForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should reset form when opening modal for new user', () => {
    component.initForm();
    component.idUser = null;
    component.userForm.patchValue({ fullName: 'Prueba' });

    component.openModal('modalContent');
    expect(component.userForm.get('fullName')?.value).toBe('');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel(true)).toBe('Activo');
    expect(component.getStatusLabel(false)).toBe('Inactivo');
  });


  it('should show password mismatch error when touched and values differ', () => {
    component.initForm();
    const form = component.userForm;
    form.get('password')?.setValue('123');
    form.get('confirm')?.setValue('456');
    form.get('password')?.markAsTouched();
    expect(component.passwordMismatchVisible).toBeTrue();
  });

});
