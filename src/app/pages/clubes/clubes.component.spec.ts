import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClubesComponent } from './clubes.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/auth.service';
import { of } from 'rxjs';
import { IClubs } from 'src/app/model/clubs.interface';
import { mockUser } from 'src/app/tests/mocks/mock-user';
import Swal from 'sweetalert2';
import { TemplateRef } from '@angular/core';

describe('ClubesComponent', () => {
  let component: ClubesComponent;
  let fixture: ComponentFixture<ClubesComponent>;
  let httpMock: HttpTestingController;

  const modalServiceMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll'),
  };

  const authMock = {
    user$: of({ userId: 1 }),
    fetchUser: () => of({}),
    hasRole: jasmine.createSpy('hasRole').and.returnValue(true),
  };

  const mockClub: IClubs = {
    clubId: 1,
    name: 'Club X',
    description: 'Descripción del Club',
    foundationDate: '2021-01-01',
    city: 'Ciudad',
    status: true,
    imageUrl: '',
    members: [mockUser],
    ranking: 1,
    score: 1000,
    logros: [],
    torneos: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClubesComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // 🔥 Interceptar llamadas de ngOnInit (getClubes + getUsers)
    fixture.detectChanges();

    const reqClubs = httpMock.expectOne(`${component.apiUrl}/clubs/with-members`);
    reqClubs.flush([]); // ✅ array vacío (el componente espera array directo)

    const reqUsers = httpMock.expectOne(`${component.apiUrl}/users`);
    reqUsers.flush({ success: true, message: 'ok', data: [] }); // ✅ objeto con data (como el backend real)

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.clubForm.valid).toBeFalse();
  });

  it('should load clubes from API', () => {
    component.getClubes();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/with-members`);
    expect(req.request.method).toBe('GET');
    req.flush([mockClub]); // ✅ array directo
    expect(component.clubes.length).toBe(1);
  });

  it('should load users from API', () => {
    component.getUsers();
    const req = httpMock.expectOne(`${component.apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: [mockUser] }); // ✅ formato correcto
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

    component.clubForm.patchValue({
      name: 'Nuevo Club',
      foundationDate: '2022-05-05',
      city: 'Bogotá',
      description: 'Club Description',
      members: [1],
      status: true,
    });

    component.save();

    // ✅ Mock del POST
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/create-with-members`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });

    // ✅ 🔥 Mock del GET que se dispara dentro del .subscribe()
    const getClubs = httpMock.expectOne(`${component.apiUrl}/clubs/with-members`);
    getClubs.flush([]); // o [mockClub] si quieres simular data real

    expect(Swal.fire).toHaveBeenCalledWith(
      'Éxito',
      'El club fue creado correctamente',
      'success'
    );
  });

  it('should delete club after confirmation', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    spyOn(component, 'getClubes');
    component.deleteClub(1);
    tick();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    expect(component.getClubes).toHaveBeenCalled();
  }));
});
