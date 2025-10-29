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
    // Crear spies para los servicios
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'fetchUser',
      'updateUserProfile',
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
    roleService = TestBed.inject(
      RoleApiService
    ) as jasmine.SpyObj<RoleApiService>;

    // Configurar respuestas por defecto para los spies
    authService.fetchUser.and.returnValue(of(mockUser));
    roleService.getAll.and.returnValue(of(mockRoles));
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(authService.fetchUser).toHaveBeenCalled();
    expect(roleService.getAll).toHaveBeenCalled();
  });

  it('debe inicializar el formulario', () => {
    fixture.detectChanges();

    expect(component.userForm).toBeTruthy();
    expect(component.userForm.get('nickname')).toBeTruthy();
  });

  it('debe cargar roles correctamente', () => {
    fixture.detectChanges();

    expect(component.roles.length).toBe(2);
    expect(component.roles[0].name).toBe('Administrador');
  });

  it('debe cargar el usuario actual y llenar el formulario', () => {
    fixture.detectChanges();

    expect(component.userForm.get('nickname')?.value).toBe('testuser');
    expect(component.idUser).toBe(10);
  });

  it('debe retornar la imagen por defecto si no hay photoUrl', () => {
    component.userForm = component['fb'].group({
      photoUrl: [''],
    });

    const result = component.photoSrc;
    expect(result).toBe('assets/img/profile.png');
  });

  it('debe retornar rolId dado el nombre', () => {
    component.roles = mockRoles;
    const roleId = component.getRoleIdByName('Usuario');
    expect(roleId).toBe(2);
  });

  it('debe retornar la ruta completa si hay photoUrl', () => {
    component.userForm = component['fb'].group({
      photoUrl: ['/avatar.jpg'],
    });

    const result = component.photoSrc;
    expect(result).toContain('/avatar.jpg');
  });

  it('no debe enviar formulario si es inválido', () => {
    fixture.detectChanges();

    component.userForm.patchValue({ nickname: '' }); // dejar un campo inválido
    component.onSubmit();

    expect(authService.updateUserProfile).not.toHaveBeenCalled();
  });

  it('debe enviar PUT con datos válidos', () => {
    fixture.detectChanges();

    // Configurar mock para updateUserProfile
    authService.updateUserProfile.and.returnValue(of(mockUser));

    // Forzar valores válidos
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

    component.onSubmit();

    expect(authService.updateUserProfile).toHaveBeenCalledWith(
      mockUser.userId,
      jasmine.objectContaining({
        nickname: 'testuser',
        document: '123',
        photoUrl: '',
        fullName: 'Test',
        fullSurname: 'User',
        email: 'test@example.com',
        phone: '555',
        gender: 'Masculino',
        roles: ['Administrador'],
      })
    );
  });
});
