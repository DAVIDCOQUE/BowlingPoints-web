import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClubsComponent } from './clubs.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/auth.service';
import { ClubApiService } from 'src/app/services/club-api.service';
import { UserApiService } from 'src/app/services/user-api.service';
import { of } from 'rxjs';
import { IClubs } from 'src/app/model/clubs.interface';
import { mockUser } from 'src/app/tests/mocks/mock-user';
import Swal from 'sweetalert2';
import { TemplateRef } from '@angular/core';

describe('ClubsComponent', () => {
  let component: ClubsComponent;
  let fixture: ComponentFixture<ClubsComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let clubService: jasmine.SpyObj<ClubApiService>;
  let userService: jasmine.SpyObj<UserApiService>;

  const modalServiceMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll'),
  };

  const mockClub: IClubs = {
    clubId: 1,
    name: 'Club X',
    description: 'Descripción del Club',
    foundationDate: new Date('2020-01-01'),
    city: 'Ciudad',
    status: true,
    imageUrl: '',
    members: [mockUser]
  };

  beforeEach(async () => {
    // Crear spies para los servicios
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['fetchUser', 'hasRole'], { user$: of({ userId: 1 }) });
    const clubServiceSpy = jasmine.createSpyObj('ClubApiService', ['getClubs', 'createClub', 'updateClub', 'deleteClub'], { baseUrl: 'http://test-api' });
    const userServiceSpy = jasmine.createSpyObj('UserApiService', ['getUsers']);

    await TestBed.configureTestingModule({
      declarations: [ClubsComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ClubApiService, useValue: clubServiceSpy },
        { provide: UserApiService, useValue: userServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    clubService = TestBed.inject(ClubApiService) as jasmine.SpyObj<ClubApiService>;
    userService = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;

    // Configurar respuestas por defecto para los spies
    authService.hasRole.and.returnValue(true);
    clubService.getClubs.and.returnValue(of([]));
    userService.getUsers.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.clubForm.valid).toBeFalse();
  });

  it('should load clubes from API', () => {
    clubService.getClubs.and.returnValue(of([mockClub]));
    component.getClubes();
    expect(clubService.getClubs).toHaveBeenCalled();
    expect(component.clubes.length).toBe(1);
  });

  it('should load users from API', () => {
    userService.getUsers.and.returnValue(of([mockUser]));
    component.getUsers();
    expect(userService.getUsers).toHaveBeenCalled();
    expect(component.usuarios.length).toBe(1);
  });

  it('should open modal and patch form for edit', () => {
    component.openModal({} as TemplateRef<any>, mockClub);
    expect(component.clubForm.value.name).toBe('Club X');
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('should open modal and reset form for new club', () => {
    component.openModal({} as TemplateRef<any>);
    expect(component.id_Club).toBeUndefined();
    expect(modalServiceMock.open).toHaveBeenCalled();
  });

  it('should close modal', () => {
    component.closeModal();
    expect(modalServiceMock.dismissAll).toHaveBeenCalled();
  });

  it('should clear filter and reload', () => {
    spyOn(component, 'getClubes');
    component.filter = 'abc';
    component.clear();
    expect(component.filter).toBe('');
    expect(component.getClubes).toHaveBeenCalled();
  });

  it('should prevent duplicate members', () => {
    spyOn(Swal, 'fire');
    component.clubForm.patchValue({
      name: 'Test',
      foundationDate: '2020-01-01',
      city: 'City',
      description: 'Description',
      members: [1, 1],
      status: true,
    });
    component.save();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Atención',
      'Hay miembros repetidos en el club.',
      'warning'
    );
  });

  it('should submit and create club', () => {
    spyOn(Swal, 'fire');
    clubService.createClub.and.returnValue(of({ success: true }));

    component.clubForm.patchValue({
      name: 'Nuevo Club',
      foundationDate: '2022-05-05',
      city: 'Bogotá',
      description: 'Club Description',
      members: [1],
      status: true,
    });

    component.save();

    expect(clubService.createClub).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Éxito',
      'El club fue creado correctamente',
      'success'
    );
  });

  it('should delete club after confirmation', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    spyOn(component, 'getClubes');
    clubService.deleteClub.and.returnValue(of({}));
    component.deleteClub(1);
    tick();
    expect(clubService.deleteClub).toHaveBeenCalledWith(1);
    expect(component.getClubes).toHaveBeenCalled();
  }));
});
