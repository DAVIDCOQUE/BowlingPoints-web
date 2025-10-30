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

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userApiSpy: jasmine.SpyObj<UserApiService>;
  let categoryApiSpy: jasmine.SpyObj<CategoryApiService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;
  let authSpy: jasmine.SpyObj<AuthService>;

  const mockUser = {
    userId: 1,
    nickname: 'tester',
    password: 'secret',
    categories: [{ categoryId: 1, name: 'Cat A' }],
    roles: [{ roleId: 1, name: 'Admin' }],
    personId: 1,
    document: '123',
    fullName: 'Test',
    fullSurname: 'User',
    email: 't@x.com',
    phone: '555',
    gender: 'Masculino',
    status: true,
    sub: 'subtoken',
    birthDate: new Date('1990-01-01')
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: UserApiService,
          useValue: jasmine.createSpyObj('UserApiService', [
            'getUsers', 'createUser', 'updateUser', 'deleteUser', 'getRoles'
          ])
        },
        {
          provide: CategoryApiService,
          useValue: jasmine.createSpyObj('CategoryApiService', ['getCategories'])
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
    modalSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    userApiSpy.getUsers.and.returnValue(of([]));
    userApiSpy.getRoles.and.returnValue(of([]));
    categoryApiSpy.getCategories.and.returnValue(of([]));
  });

  // ---------- BASICS ----------
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

  // ---------- LOADERS ----------
  it('should load users', () => {
    userApiSpy.getUsers.and.returnValue(of([mockUser]));
    component.getUsers();
    expect(component.usuarios.length).toBe(1);
  });

  it('should load roles and categories', () => {
    userApiSpy.getRoles.and.returnValue(of([{ roleId: 1, name: 'Admin' }]));
    categoryApiSpy.getCategories.and.returnValue(of([{ categoryId: 1, name: 'Cat A' }]));
    component.getRoles();
    component.getCategories();
    expect(component.roles[0].name).toBe('Admin');
    expect(component.categories[0].name).toBe('Cat A');
  });

  // ---------- FORM ----------
  it('should init form correctly', () => {
    component.initForm();
    expect(component.userForm.get('email')).toBeTruthy();
  });

  it('should patch values on editUser()', () => {
    component.initForm();
    spyOn(component, 'openModal');
    component.editUser(mockUser as any);
    expect(component.userForm.get('email')?.value).toBe('t@x.com');
    expect(component.openModal).toHaveBeenCalled();
  });

  // ---------- CREATE SUCCESS ----------
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

  // ---------- CREATE ERROR ----------
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

  // ---------- UPDATE ERROR ----------
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

  // ---------- DELETE ----------
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

  // ---------- MODAL ----------
  it('should open and close modal', () => {
    component.initForm();
    component.openModal('content');
    expect(modalSpy.open).toHaveBeenCalled();
    component.closeModal();
    expect(modalSpy.dismissAll).toHaveBeenCalled();
  });

  // ---------- UTILS ----------
  it('should clear filter', () => {
    component.filter = 'abc';
    component.clear();
    expect(component.filter).toBe('');
  });
});
