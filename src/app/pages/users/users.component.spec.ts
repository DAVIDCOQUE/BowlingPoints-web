import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

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
        { provide: NgbModal, useValue: modalServiceSpy }
      ]
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
        fullName: 'Juan',
        fullSurname: 'Pérez',
        document: '123',
        email: 'juan@test.com',
        phone: '123456',
        gender: 'Masculino',
        roleDescription: 'Administrador',
        personId: 1,
        roleId: 1,
        clubId: 1,
        roles: [],
        sub: ''
      }
    ];

    component.filter = 'juan';
    const filtered = component.usuariosFiltrados;
    expect(filtered.length).toBe(1);
  });

  it('should patch form and open modal when editing user', () => {
    const mockUser = {
      userId: 1,
      nickname: 'testUser',
      fullName: 'Juan',
      fullSurname: 'Pérez',
      document: '123',
      email: 'juan@test.com',
      phone: '123456',
      gender: 'Masculino',
      roleDescription: 'Administrador',
      personId: 1,
      roleId: 1,
      clubId: 1,
      roles: [],
      sub: ''
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
});
