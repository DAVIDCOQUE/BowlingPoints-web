import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubsComponent } from './clubs.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ClubApiService } from 'src/app/services/club-api.service';
import { UserApiService } from 'src/app/services/user-api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import Swal from 'sweetalert2';
import { NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';

describe('ClubsComponent', () => {
  let component: ClubsComponent;
  let fixture: ComponentFixture<ClubsComponent>;
  let clubApi: jasmine.SpyObj<ClubApiService>;
  let userApi: jasmine.SpyObj<UserApiService>;
  let auth: jasmine.SpyObj<AuthService>;
  let modalService: jasmine.SpyObj<NgbModal>;

  const mockUser: IUser = {
    userId: 1,
    personId: 1,
    nickname: 'user1',
    password: '123',
    fullName: 'Juan',
    fullSurname: 'Pérez',
    email: 'correo@x.com',
    phone: '123456',
    gender: 'M',
    categories: [],
    roles: [],
    sub: 'uuid-user-1',
    status: true
  };

  const mockClubs: IClubs[] = [
    {
      clubId: 1,
      name: 'Club A',
      city: 'Bogotá',
      description: 'Descripción',
      imageUrl: '',
      status: true,
      foundationDate: new Date(),
      members: [mockUser]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClubsComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['hasRole']) },
        { provide: ClubApiService, useValue: jasmine.createSpyObj('ClubApiService', ['getClubs', 'createClub', 'updateClub', 'deleteClub']) },
        { provide: UserApiService, useValue: jasmine.createSpyObj('UserApiService', ['getActiveUsers']) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ClubsComponent);
    component = fixture.componentInstance;

    clubApi = TestBed.inject(ClubApiService) as jasmine.SpyObj<ClubApiService>;
    userApi = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    auth = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;

    auth.hasRole.and.returnValue(true);

    clubApi.getClubs.and.returnValue(of([]));
    userApi.getActiveUsers.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clubs on init', () => {
    clubApi.getClubs.and.returnValue(of(mockClubs));
    userApi.getActiveUsers.and.returnValue(of([mockUser]));

    component.ngOnInit();

    expect(clubApi.getClubs).toHaveBeenCalled();
    expect(userApi.getActiveUsers).toHaveBeenCalled();
    expect(component.clubes.length).toBe(1);
    expect(component.usuarios.length).toBe(1);
  });

  it('should handle club load error', () => {
    spyOn(Swal, 'fire');

    clubApi.getClubs.and.returnValue(throwError(() => new Error('Error al cargar clubes')));
    userApi.getActiveUsers.and.returnValue(of([]));

    component.getClubes();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudieron cargar los clubes', 'error');
  });

  it('should handle user load error', () => {
    spyOn(Swal, 'fire');

    userApi.getActiveUsers.and.returnValue(throwError(() => new Error('Error al cargar usuarios')));
    clubApi.getClubs.and.returnValue(of([]));

    component.getUsers();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudieron cargar los usuarios', 'error');
  });

  it('should warn if form is invalid', () => {
    spyOn(Swal, 'fire');

    component.ngOnInit();
    component.clubForm.setValue({
      name: '',
      foundationDate: '',
      city: '',
      description: '',
      members: '',
      imageUrl: '',
      status: true
    });

    component.save();

    expect(Swal.fire).toHaveBeenCalledWith('Formulario inválido', 'Revisa los campos requeridos', 'warning');
  });

  it('should call createClub when no id_Club is set', () => {
    spyOn(Swal, 'fire');

    clubApi.createClub.and.returnValue(of({}));
    clubApi.getClubs.and.returnValue(of([]));

    component.ngOnInit();
    component.clubForm.setValue({
      name: 'Club Nuevo',
      foundationDate: '2020-01-01',
      city: 'Bogotá',
      description: 'Desc',
      members: [1],
      imageUrl: '',
      status: true
    });

    component.save();

    expect(clubApi.createClub).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'El club fue creado correctamente', 'success');
  });

  it('should call updateClub when id_Club is set', () => {
    spyOn(Swal, 'fire');

    clubApi.updateClub.and.returnValue(of({}));
    clubApi.getClubs.and.returnValue(of([]));

    component.id_Club = 1;
    component.ngOnInit();
    component.clubForm.setValue({
      name: 'Club Actualizado',
      foundationDate: '2020-01-01',
      city: 'Bogotá',
      description: 'Desc',
      members: [1],
      imageUrl: '',
      status: true
    });

    component.save();

    expect(clubApi.updateClub).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'El club fue actualizado correctamente', 'success');
  });

  it('should warn for duplicated members', () => {
    spyOn(Swal, 'fire');

    component.ngOnInit();
    component.clubForm.setValue({
      name: 'Duplicado',
      foundationDate: '2020-01-01',
      city: 'Bogotá',
      description: 'Desc',
      members: [1, 1],
      imageUrl: '',
      status: true
    });

    component.save();

    expect(Swal.fire).toHaveBeenCalledWith('Atención', 'Hay miembros repetidos en el club.', 'warning');
  });

  it('should delete club if confirmed', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: true,
      dismiss: undefined
    }));
    clubApi.deleteClub.and.returnValue(of({}));
    clubApi.getClubs.and.returnValue(of([]));

    await component.deleteClub(1);

    expect(clubApi.deleteClub).toHaveBeenCalledWith(1);
  });

  it('should close modal', () => {
    component.closeModal();
    expect(modalService.dismissAll).toHaveBeenCalled();
  });

  it('should reset filter and reload clubs', () => {
    clubApi.getClubs.and.returnValue(of(mockClubs));

    component.filter = 'club';
    component.clear();

    expect(component.filter).toBe('');
    expect(clubApi.getClubs).toHaveBeenCalled();
  });

  it('should handle image error', () => {
    const img = document.createElement('img');
    const event = { target: img } as unknown as Event;

    component.onImgError(event, 'default.jpg');

    expect(img.src).toContain('default.jpg');
  });

  it('should filter clubes by name', () => {
    component.clubes = mockClubs;
    component.filter = 'club a';

    const result = component.filteredClubes;

    expect(result.length).toBe(1);
  });

  it('should show specific error if member is already assigned to a club', () => {
    spyOn(Swal, 'fire');

    const errorResponse = {
      error: {
        message: 'Este usuario ya está asignado a este club'
      }
    };

    clubApi.createClub.and.returnValue(throwError(() => errorResponse));
    component.ngOnInit();
    component.clubForm.setValue({
      name: 'Club A',
      foundationDate: '2020-01-01',
      city: 'Bogotá',
      description: 'desc',
      members: [1],
      imageUrl: '',
      status: true
    });

    component.save();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Este miembro ya pertenece a otro club.', 'error');
  });

  it('should show generic error if save fails without known message', () => {
    spyOn(Swal, 'fire');

    const errorResponse = {
      error: {
        message: 'Otro error'
      }
    };

    clubApi.createClub.and.returnValue(throwError(() => errorResponse));
    component.ngOnInit();
    component.clubForm.setValue({
      name: 'Club A',
      foundationDate: '2020-01-01',
      city: 'Bogotá',
      description: 'desc',
      members: [1],
      imageUrl: '',
      status: true
    });

    component.save();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo guardar el club', 'error');
  });


  it('should not delete club if deletion is cancelled', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({
      isConfirmed: false
    }) as any);

    await component.deleteClub(1);

    expect(clubApi.deleteClub).not.toHaveBeenCalled();
  });

  it('should open modal for creating a new club', () => {
    const content = {} as TemplateRef<unknown>;
    component.clubForm = component['fb'].group({}); // evita errores
    component.openModal(content);
    expect(modalService.open).toHaveBeenCalledWith(content);
  });

  it('should open modal and populate form for editing club', () => {
    const content = {} as TemplateRef<unknown>;

    const club: IClubs = {
      clubId: 1,
      name: 'Club Editar',
      city: 'Medellín',
      description: 'desc',
      imageUrl: 'img.jpg',
      status: true,
      foundationDate: new Date(),
      members: [mockUser]
    };

    component.ngOnInit();
    component.openModal(content, club);

    expect(component.id_Club).toBe(1);
    expect(component.clubForm.value.name).toBe('Club Editar');
    expect(modalService.open).toHaveBeenCalledWith(content);
  });

  it('should display "Crear" button if user is admin', () => {
    auth.hasRole.and.returnValue(true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button.btn-success');
    expect(btn?.textContent).toContain('Crear');
  });

  it('should not display "Crear" button if user is not admin', () => {
    auth.hasRole.and.returnValue(false);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button.btn-success');
    expect(btn).toBeNull();
  });




});
