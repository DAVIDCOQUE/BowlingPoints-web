import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
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
import { IUser } from 'src/app/model/user.interface';
import { FormControl } from '@angular/forms';

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

    //  Valores por defecto sin errores de tipado
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
    expect(component.getRoleNameById(99)).toBe('');
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
    component.userForm.patchValue({ email: '' });
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

  it('should handle error when loading users', () => {
    const error = new Error('Falló la carga');
    spyOn(console, 'error');
    userApiSpy.getUsers.and.returnValue(throwError(() => error));
    component.getUsers();
    expect(console.error).toHaveBeenCalledWith('Error al cargar usuarios:', error);
  });

  it('should handle error when loading roles', () => {
    const error = new Error('Error de roles');
    spyOn(console, 'error');
    roleApiSpy.getAll.and.returnValue(throwError(() => error));
    component.getRoles();
    expect(console.error).toHaveBeenCalledWith('Error al cargar roles:', error);
  });

  it('should handle error when loading categories', () => {
    const error = new Error('Error de categorías');
    spyOn(console, 'error');
    categoryApiSpy.getActiveCategories.and.returnValue(throwError(() => error));
    component.getCategories();
    expect(console.error).toHaveBeenCalledWith('Error al cargar categorías:', error);
  });

  it('should reset form and idUser on closeModal', () => {
    component.initForm();
    component.idUser = 99;
    component.userForm.patchValue({ fullName: 'Prueba' });

    component.closeModal();

    expect(component.idUser).toBeNull();
    expect(component.userForm.get('fullName')?.value).toBe('');
  });

  it('should open modal without resetting form in edit mode', () => {
    component.initForm();
    component.idUser = 1;
    component.userForm.patchValue({ fullName: 'Editado' });

    component.openModal('contenido');
    expect(modalSpy.open).toHaveBeenCalledWith('contenido');
    expect(component.userForm.get('fullName')?.value).toBe('Editado');
  });

  it('debe retornar null si la fecha es pasada o igual a hoy', () => {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 1);

    const controlToday = new FormControl(today.toISOString().slice(0, 10));
    const controlPast = new FormControl(pastDate.toISOString().slice(0, 10));

    const resultToday = (component as any).futureDateValidator(controlToday);
    const resultPast = (component as any).futureDateValidator(controlPast);

    expect(resultToday).toBeNull();
    expect(resultPast).toBeNull();
  });

  it('should handle error when loading users', () => {
    const consoleSpy = spyOn(console, 'error');
    userApiSpy.getUsers.and.returnValue(throwError(() => new Error('Error en getUsers')));
    component.getUsers();
    expect(consoleSpy).toHaveBeenCalledWith('Error al cargar usuarios:', jasmine.any(Error));
  });

  it('should handle error when loading roles', () => {
    const consoleSpy = spyOn(console, 'error');
    roleApiSpy.getAll.and.returnValue(throwError(() => new Error('Error en getAll')));
    component.getRoles();
    expect(consoleSpy).toHaveBeenCalledWith('Error al cargar roles:', jasmine.any(Error));
  });

  it('should handle error when loading categories', () => {
    const consoleSpy = spyOn(console, 'error');
    categoryApiSpy.getActiveCategories.and.returnValue(throwError(() => new Error('Error en categorías')));
    component.getCategories();
    expect(consoleSpy).toHaveBeenCalledWith('Error al cargar categorías:', jasmine.any(Error));
  });


  it('should invalidate future birthDate', () => {
    const control = { value: new Date(Date.now() + 24 * 60 * 60 * 1000) } as AbstractControl;
    const result = (component as any).futureDateValidator(control);
    expect(result).toEqual({ futureDate: true });
  });

  it('should accept past birthDate', () => {
    const control = { value: new Date('2000-01-01') } as AbstractControl;
    const result = (component as any).futureDateValidator(control);
    expect(result).toBeNull();
  });

  it('toDateInput should return null for invalid date', () => {
    const result = (component as any).toDateInput('invalid');
    expect(result).toBeNull();
  });

  it('futureDateValidator: should return error for future date', () => {
    const control = { value: new Date(Date.now() + 86400000) } as AbstractControl;
    const result = component['futureDateValidator'](control);
    expect(result).toEqual({ futureDate: true });
  });

  it('futureDateValidator: should return null for valid date', () => {
    const control = { value: new Date(Date.now() - 86400000) } as AbstractControl;
    const result = component['futureDateValidator'](control);
    expect(result).toBeNull();
  });

  it('should apply required validators in creation mode', () => {
    component.initForm();

    const passwordCtrl = component.userForm.get('password')!;
    const confirmCtrl = component.userForm.get('confirm')!;

    component['setPasswordValidatorsForMode'](false); // creación

    const passwordErrors = passwordCtrl.validator?.({ value: '' } as AbstractControl);
    const confirmErrors = confirmCtrl.validator?.({ value: '' } as AbstractControl);

    expect(passwordErrors?.['required']).toBeTrue();
    expect(confirmErrors?.['required']).toBeTrue();
  });

  it('should return null if password or confirm control is missing', () => {
    const fakeGroup = {
      get: (name: string) => null
    } as unknown as AbstractControl;

    const result = component['passwordsMatchValidator'](fakeGroup);
    expect(result).toBeNull();
  });

  it('should return null if password and confirm are empty', () => {
    component.initForm();
    const group = component.userForm;

    group.get('password')?.setValue('');
    group.get('confirm')?.setValue('');

    const result = component['passwordsMatchValidator'](group);
    expect(result).toBeNull();
  });

  it('should return error if passwords do not match', () => {
    component.initForm();
    const group = component.userForm;

    group.get('password')?.setValue('abc123');
    group.get('confirm')?.setValue('xyz456');

    const result = component['passwordsMatchValidator'](group);
    expect(result).toEqual({ passwordsMismatch: true });
  });


  it('should return null if passwords match', () => {
    component.initForm();
    const group = component.userForm;

    group.get('password')?.setValue('abc123');
    group.get('confirm')?.setValue('abc123');

    const result = component['passwordsMatchValidator'](group);
    expect(result).toBeNull();
  });

  it('should update value and validity when validators are set', () => {
    component.initForm();
    const passwordCtrl = component.userForm.get('password')!;
    const confirmCtrl = component.userForm.get('confirm')!;

    spyOn(passwordCtrl, 'updateValueAndValidity');
    spyOn(confirmCtrl, 'updateValueAndValidity');
    spyOn(component.userForm, 'updateValueAndValidity');

    component['setPasswordValidatorsForMode'](false);

    expect(passwordCtrl.updateValueAndValidity).toHaveBeenCalled();
    expect(confirmCtrl.updateValueAndValidity).toHaveBeenCalled();
    expect(component.userForm.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should apply only minLength validator in edit mode', () => {
    component.initForm();

    const passwordCtrl = component.userForm.get('password')!;
    const confirmCtrl = component.userForm.get('confirm')!;

    component['setPasswordValidatorsForMode'](true); // modo edición

    // Valor que viola minlength pero NO activa 'required'
    passwordCtrl.setValue('a');
    confirmCtrl.setValue(''); // confirm no tiene validadores en modo edición

    passwordCtrl.updateValueAndValidity();
    confirmCtrl.updateValueAndValidity();

    const passwordErrors = passwordCtrl.errors;
    const confirmErrors = confirmCtrl.errors;

    //  Validación esperada
    expect(passwordErrors?.['required']).toBeUndefined(); // no requerido
    expect(passwordErrors?.['minlength']).toBeTruthy();   // sí viola minlength
    expect(confirmErrors).toBeNull();                     // sin validadores = null
  });

  it('futureDateValidator: should return null for today', () => {
    const today = new Date();
    const control = { value: today.toISOString().slice(0, 10) } as AbstractControl;

    const result = component['futureDateValidator'](control);
    expect(result).toBeNull();
  });

  it('futureDateValidator: should return null for past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1); // ayer
    const control = { value: past.toISOString().slice(0, 10) } as AbstractControl;

    const result = component['futureDateValidator'](control);
    expect(result).toBeNull();
  });


  it('futureDateValidator: should return null for empty or falsy values', () => {
    const nullControl = { value: null } as AbstractControl;
    const emptyControl = { value: '' } as AbstractControl;
    const undefinedControl = { value: undefined } as AbstractControl;

    expect(component['futureDateValidator'](nullControl)).toBeNull();
    expect(component['futureDateValidator'](emptyControl)).toBeNull();
    expect(component['futureDateValidator'](undefinedControl)).toBeNull();
  });

  it('should patch form and open modal in editUser()', () => {
    component.initForm();
    spyOn(component as any, 'setPasswordValidatorsForMode').and.callThrough();
    spyOn(component, 'openModal');

    const user = {
      ...mockUser,
      photoUrl: 'http://some.url/photo.jpg',
      categories: [{ categoryId: 5, name: 'Cat A' }],
      roles: [{ roleId: 3, name: 'Admin' }],
      birthDate: new Date('2000-01-01')
    };

    component.editUser(user);

    const form = component.userForm;
    const expectedDate = component['toDateInput'](user.birthDate); // 🛠 ajuste de timezone

    expect(form.get('document')?.value).toBe(user.document);
    expect(form.get('photoUrl')?.value).toBe(user.photoUrl);
    expect(form.get('email')?.value).toBe(user.email);
    expect(form.get('fullName')?.value).toBe(user.fullName);
    expect(form.get('fullSurname')?.value).toBe(user.fullSurname);
    expect(form.get('phone')?.value).toBe(user.phone);
    expect(form.get('gender')?.value).toBe(user.gender);
    expect(form.get('birthDate')?.value).toBe(expectedDate); // 👈 aquí corregido
    expect(form.get('categories')?.value).toEqual([5]);
    expect(form.get('roles')?.value).toEqual([3]);
    expect(form.get('status')?.value).toBe(user.status);
    expect(form.get('password')?.value).toBe('');
    expect(form.get('confirm')?.value).toBe('');

    expect(component['setPasswordValidatorsForMode']).toHaveBeenCalledWith(true);
    expect(component.openModal).toHaveBeenCalledWith(component.modalUserRef);
  });


  it('should reset form and apply validators when opening modal for new user', () => {
    component.initForm();
    spyOn(component as any, 'setPasswordValidatorsForMode').and.callThrough();

    const form = component.userForm;
    form.patchValue({ fullName: 'Antiguo' });
    component.idUser = null;

    component.openModal('mockContent');

    expect(form.get('fullName')?.value).toBe('');
    expect(component['setPasswordValidatorsForMode']).toHaveBeenCalledWith(false);
    expect(modalSpy.open).toHaveBeenCalledWith('mockContent');
  });


  it('should return true from passwordMismatchVisible when mismatch and touched', () => {
    component.initForm();

    const form = component.userForm;
    form.get('password')?.setValue('abc123');
    form.get('confirm')?.setValue('xyz456');

    form.get('password')?.markAsTouched();
    form.get('confirm')?.markAsTouched();

    // Forzamos validación
    form.updateValueAndValidity();

    expect(component.passwordMismatchVisible).toBeTrue();
  });

  it('toDateInput should return null for null or undefined', () => {
    expect((component as any).toDateInput(null)).toBeNull();
    expect((component as any).toDateInput(undefined)).toBeNull();
  });

  it('should correctly parse status from string and handle null birthDate', () => {
    component.initForm();

    component.userForm.patchValue({
      document: '456',
      fullName: 'Ana',
      fullSurname: 'Gómez',
      email: 'ana@test.com',
      birthDate: '', // ← esto debe provocar que birthDate sea null
      gender: 'Femenino',
      phone: '321321',
      photoUrl: '',
      status: 'true', // ← como string
      roles: [1],
      categories: [1],
      password: 'clave123',
      confirm: 'clave123'
    });

    const spyCreate = userApiSpy.createUser.and.returnValue(of({}));
    userApiSpy.getUsers.and.returnValue(of([]));

    component.saveForm();

    expect(spyCreate).toHaveBeenCalledWith(jasmine.objectContaining({
      status: true,             // ← statusValue convertido desde string
      birthDate: null,          // ← nacimiento vacío tratado como null
      roles: [{ roleId: 1 }],
      categories: [{ categoryId: 1 }]
    }));
  });


  it('should filter users based on search term', () => {
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
      },
      {
        ...mockUser,
        fullName: 'Maria',
        fullSurname: 'Garcia',
        email: 'maria@test.com',
        phone: '5678',
        status: false,
        roles: [{ roleId: 2, name: 'User' }],
        categories: [{ categoryId: 2, name: 'Cat B' }]
      }
    ];

    component.filter = 'Carlos';
    let result = component.usuariosFiltrados;
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Carlos');

    component.filter = 'Admin';
    result = component.usuariosFiltrados;
    expect(result.length).toBe(1);

    component.filter = 'cat b';
    result = component.usuariosFiltrados;
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('Maria');

    component.filter = 'inexistente';
    result = component.usuariosFiltrados;
    expect(result.length).toBe(0);
  });


});
