import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from '../../model/user.interface';
import { IRole } from '../../model/role.interface';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let httpMock: HttpTestingController;

  const mockRoles: IRole[] = [
    { roleId: 1, description: 'Administrador' },
    { roleId: 2, description: 'Usuario' }
  ];

  const mockUser: IUser = {
    userId: 10,
    personId: 101,            // ✔️ requerido
    roleId: 1,                // ✔️ requerido
    clubId: 5,                // ✔️ requerido
    nickname: 'testuser',
    document: '12345678',
    photoUrl: '/img/test.jpg',
    fullName: 'Test',
    fullSurname: 'User',
    email: 'test@example.com',
    phone: '5551234567',
    gender: 'Masculino',
    roleDescription: 'Administrador',
    roles: ['Administrador'],
    createdAt: '',
    updatedAt: '',
    status: true,
    sub: 'sub-id-xyz',
    roleInClub: 'Jugador',
    joinjoinedAt: '2023-10-01T00:00:00Z',
    averageScore: 210,
    bestGame: '278'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [{ provide: NgbModal, useValue: {} }]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    const rolesReq = httpMock.expectOne(`${component.apiUrl}/roles`);
    rolesReq.flush({ success: true, message: '', data: mockRoles });

    const userReq = httpMock.expectOne(`${component.apiUrl}/users/me`);
    userReq.flush({ success: true, data: mockUser });

    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario', () => {
    fixture.detectChanges();

    const rolesReq = httpMock.expectOne(`${component.apiUrl}/roles`);
    rolesReq.flush({ success: true, message: '', data: mockRoles });

    const userReq = httpMock.expectOne(`${component.apiUrl}/users/me`);
    userReq.flush({ success: true, data: mockUser });

    expect(component.userForm).toBeTruthy();
    expect(component.userForm.get('nickname')).toBeTruthy();
  });

  it('debe cargar roles correctamente', () => {
    fixture.detectChanges();

    const rolesReq = httpMock.expectOne(`${component.apiUrl}/roles`);
    rolesReq.flush({ success: true, message: '', data: mockRoles });

    const userReq = httpMock.expectOne(`${component.apiUrl}/users/me`);
    userReq.flush({ success: true, data: mockUser });

    expect(component.roles.length).toBe(2);
    expect(component.roles[0].description).toBe('Administrador');
  });

  it('debe cargar el usuario actual y llenar el formulario', () => {
    fixture.detectChanges();

    // Cargar roles primero
    const rolesReq = httpMock.expectOne(`${component.apiUrl}/roles`);
    rolesReq.flush({ success: true, message: '', data: mockRoles });

    // Cargar usuario actual
    const userReq = httpMock.expectOne(`${component.apiUrl}/users/me`);
    userReq.flush({ success: true, data: mockUser });

    expect(component.userForm.get('nickname')?.value).toBe('testuser');
    expect(component.idUser).toBe(10);
  });

  it('debe retornar la imagen por defecto si no hay photoUrl', () => {
    component.userForm = component['fb'].group({
      photoUrl: ['']
    });

    const result = component.photoSrc;
    expect(result).toBe('assets/img/perfil.png');
  });

  it('debe retornar rolId dado la descripción', () => {
    component.roles = mockRoles;
    const roleId = component.getRoleIdByDescription('Usuario');
    expect(roleId).toBe(2);
  });

  it('debe retornar la imagen por defecto si no hay photoUrl', () => {
    component.userForm = component['fb'].group({
      photoUrl: [''] // aquí le dices que no hay imagen
    });

    const result = component.photoSrc;
    expect(result).toBe('assets/img/perfil.png');
  });

  it('debe retornar la ruta completa si hay photoUrl', () => {
    component.userForm = component['fb'].group({
      photoUrl: ['/avatar.jpg']
    });

    const result = component.photoSrc;
    expect(result).toContain('/avatar.jpg');
  });

  it('no debe enviar formulario si es inválido', () => {
    fixture.detectChanges();

    const rolesReq = httpMock.expectOne(`${component.apiUrl}/roles`);
    rolesReq.flush({ success: true, message: '', data: mockRoles });

    const userReq = httpMock.expectOne(`${component.apiUrl}/users/me`);
    userReq.flush({ success: true, data: mockUser });

    component.userForm.patchValue({ nickname: '' }); // dejar un campo inválido
    component.onSubmit();

    const putReqs = httpMock.match(`${component.apiUrl}/users/${mockUser.userId}`);
    expect(putReqs.length).toBe(0); // No se debe hacer PUT
  });

  it('debe enviar PUT con datos válidos', () => {
    fixture.detectChanges();

    // Interceptar roles
    const rolesReq = httpMock.expectOne(`${component.apiUrl}/roles`);
    rolesReq.flush({ success: true, message: '', data: mockRoles });

    // Interceptar usuario actual
    const userReq = httpMock.expectOne(`${component.apiUrl}/users/me`);
    userReq.flush({ success: true, data: mockUser });

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
      confirm: ''
    });

    component.onSubmit();

    const putReq = httpMock.expectOne(`${component.apiUrl}/users/${mockUser.userId}`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({});
  });
});
