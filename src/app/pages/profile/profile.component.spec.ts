import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';
import { AuthService } from '../../auth/auth.service';
import { RoleApiService } from '../../services/role-api.service';
import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let roleService: jasmine.SpyObj<RoleApiService>;

  const mockRoles: IRole[] = [
    { roleId: 1, name: 'Administrador' },
    { roleId: 2, name: 'Usuario' },
  ];

  const mockUser: IUser = {
    userId: 10,
    personId: 101,
    categories: [],
    clubId: 5,
    nickname: 'testuser',
    document: '12345678',
    photoUrl: '/img/test.jpg',
    fullName: 'Test',
    fullSurname: 'User',
    email: 'test@example.com',
    phone: '5551234567',
    gender: 'Masculino',
    roles: [{ roleId: 1, name: 'Administrador' }],
    createdAt: new Date('2023-10-01T00:00:00Z'),
    updatedAt: new Date('2023-10-02T00:00:00Z'),
    status: true,
    password: 'dummy-password',
    sub: 'sub-id-xyz',
    roleInClub: 'Jugador',
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'fetchUser',
      'updateUserProfile'
    ]);
    const roleServiceSpy = jasmine.createSpyObj('RoleApiService', ['getAll']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: NgbModal, useValue: {} },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: RoleApiService, useValue: roleServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    roleService = TestBed.inject(RoleApiService) as jasmine.SpyObj<RoleApiService>;

    authService.fetchUser.and.returnValue(of(mockUser));
    roleService.getAll.and.returnValue(of(mockRoles));

    Object.defineProperty(authService, 'baseUrl', {
      get: () => 'http://localhost:3000'
    });
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario', () => {
    component.initForm();
    expect(component.userForm).toBeTruthy();
    expect(component.userForm.get('nickname')).toBeTruthy();
  });

  it('debe cargar roles correctamente', () => {
    component.getRoles();
    expect(component.roles.length).toBe(2);
  });

  it('debe cargar el usuario actual y llenar el formulario', () => {
    fixture.detectChanges();
    expect(component.userForm.get('nickname')?.value).toBe('testuser');
    expect(component.idUser).toBe(10);
  });

  it('debe retornar imagen por defecto si no hay photoUrl', () => {
    component.userForm = component['fb'].group({ photoUrl: [''] });
    expect(component.photoSrc).toBe('assets/img/profile.png');
  });

  it('debe retornar imagen completa si es relativa', () => {
    component.userForm = component['fb'].group({ photoUrl: ['/foto.jpg'] });
    expect(component.photoSrc).toContain('/foto.jpg');
  });

  it('getAvatarUrl: debe retornar ruta completa si relativa', () => {
    const result = component.getAvatarUrl({ photoUrl: '/avatar.jpg' } as IUser);
    expect(result).toBe('http://localhost:3000/avatar.jpg');
  });

  it('getAvatarUrl: debe retornar misma ruta si absoluta', () => {
    const result = component.getAvatarUrl({ photoUrl: 'https://cdn/img.jpg' } as IUser);
    expect(result).toBe('https://cdn/img.jpg');
  });

  it('getAvatarUrl: debe retornar imagen por defecto si no hay photoUrl', () => {
    const result = component.getAvatarUrl({} as IUser);
    expect(result).toBe('assets/img/profile.png');
  });

  it('getRoleIdByName: debe retornar ID correcto', () => {
    component.roles = mockRoles;
    expect(component.getRoleIdByName('Usuario')).toBe(2);
  });

  it('getRoleIdByName: debe retornar null si no existe', () => {
    component.roles = mockRoles;
    expect(component.getRoleIdByName('Desconocido')).toBeNull();
  });

  it('getRoleDescription: debe retornar descripción correcta', () => {
    component.roles = mockRoles;
    expect(component.getRoleDescription(2)).toBe('Usuario');
  });

  it('getRolesDescription: debe retornar descripciones', () => {
    component.roles = mockRoles;
    expect(component.getRolesDescription([1, 2])).toBe('Administrador, Usuario');
  });

  it('onImgError: debe reemplazar imagen al fallar', () => {
    const event = { target: { src: '' } } as unknown as Event;
    component.onImgError(event, 'assets/img/fallback.png');
    expect((event.target as HTMLImageElement).src).toBe('assets/img/fallback.png');
  });

  it('onSubmit: no debe enviar si form es inválido', () => {
    fixture.detectChanges();
    component.userForm.patchValue({ nickname: '' });
    component.onSubmit();
    expect(authService.updateUserProfile).not.toHaveBeenCalled();
  });

  it('onSubmit: debe enviar datos válidos y llamar updateUserProfile', () => {
    fixture.detectChanges();

    authService.updateUserProfile.and.returnValue(of(mockUser));

    component.userForm.patchValue({
      nickname: 'testuser',
      document: '123',
      photoUrl: '',
      fullName: 'Test',
      fullSurname: 'User',
      email: 'test@example.com',
      phone: '555',
      gender: 'Masculino',
      roleId: 1,
      password: '',
      confirm: '',
    });

    component.idUser = 10;
    component.roles = mockRoles;

    component.onSubmit();

    expect(authService.updateUserProfile).toHaveBeenCalledWith(
      10,
      jasmine.objectContaining({
        nickname: 'testuser',
        roles: ['Administrador'],
      })
    );
  });


  it('getRoleDescription: debe retornar vacío si no encuentra rol', () => {
    component.roles = mockRoles;
    expect(component.getRoleDescription(999)).toBe('');
  });

  it('getRolesDescription: debe retornar vacío si no hay roles', () => {
    component.roles = mockRoles;
    expect(component.getRolesDescription([])).toBe('');
  });


  it('photoSrc: debe retornar la ruta completa si photoUrl es absoluta', () => {
    component.userForm = component['fb'].group({ photoUrl: ['https://cdn.com/avatar.jpg'] });
    expect(component.photoSrc).toBe('https://cdn.com/avatar.jpg');
  });

  it('loadCurrentUser: no hace nada si res.data es null', () => {
    const warnSpy = spyOn(console, 'warn');
    authService.fetchUser.and.returnValue(of(null));
    component.loadCurrentUser();

    expect(warnSpy).toHaveBeenCalledWith('No se recibió usuario desde fetchUser');
  });

  it('ngOnInit: debe inicializar formulario, roles y usuario', () => {
    const initSpy = spyOn(component, 'initForm');
    const roleSpy = spyOn(component, 'getRoles');
    const loadSpy = spyOn(component, 'loadCurrentUser');

    component.ngOnInit();

    expect(initSpy).toHaveBeenCalled();
    expect(roleSpy).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('getAvatarUrl: debe retornar imagen por defecto si el usuario es null', () => {
    expect(component.getAvatarUrl(null as any)).toBe('assets/img/profile.png');
  });

  it('onSubmit: incluye password si está presente', () => {
    fixture.detectChanges();

    component.userForm.patchValue({
      nickname: 'testuser',
      document: '123',
      photoUrl: '',
      fullName: 'Test',
      fullSurname: 'User',
      email: 'test@example.com',
      phone: '555',
      gender: 'Masculino',
      roleId: 1,
      password: '123456',
      confirm: '123456',
    });

    component.idUser = 10;
    component.roles = mockRoles;

    authService.updateUserProfile.and.returnValue(of(mockUser));

    component.onSubmit();

    expect(authService.updateUserProfile).toHaveBeenCalledWith(
      10,
      jasmine.objectContaining({
        password: '123456',
        roles: ['Administrador'],
      })
    );
  });



  it('onSubmit: debe manejar error del servidor', () => {
    fixture.detectChanges();

    authService.updateUserProfile.and.returnValue(
      throwError(() => new Error('Falló el servidor'))
    );

    component.userForm.patchValue({
      nickname: 'testuser',
      document: '123',
      photoUrl: '',
      fullName: 'Test',
      fullSurname: 'User',
      email: 'test@example.com',
      phone: '555',
      gender: 'Masculino',
      roleId: 1,
      password: '',
      confirm: '',
    });

    component.idUser = 10;
    component.roles = mockRoles;

    component.onSubmit();

    expect(authService.updateUserProfile).toHaveBeenCalled();
  });


});
