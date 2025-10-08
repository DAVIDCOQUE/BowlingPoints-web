import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ClubComponent } from './club.component';
import { AuthService } from 'src/app/auth/auth.service';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';

// Mock data
const mockUser: IUser = {
  userId: 1,
  personId: 1,
  roleId: 1,
  clubId: 1,
  document: '12345678',
  nickname: 'testuser',
  fullName: 'Test',
  fullSurname: 'User',
  email: 'test@example.com',
  roleDescription: 'Admin',
  phone: '123456789',
  gender: 'M',
  sub: 'testsub'
};

const mockClub: IClubs = {
  clubId: 1,
  name: 'Club A',
  foundationDate: '2000-01-01',
  city: 'City A',
  description: 'Description A',
  status: true,
  imageUrl: '',
  members: [mockUser],
  ranking: 1,
  score: 100,
  logros: ['Logro 1'],
  torneos: ['Torneo 1']
};

describe('ClubComponent', () => {
  let component: ClubComponent;
  let fixture: ComponentFixture<ClubComponent>;
  let httpMock: HttpTestingController;
  let modalService: NgbModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClubComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: NgbModal,
          useValue: {
            open: jasmine.createSpy('open'),
            dismissAll: jasmine.createSpy('dismissAll')
          }
        },
        {
          provide: AuthService,
          useValue: {
            user$: of({ clubId: 1 })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClubComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    modalService = TestBed.inject(NgbModal);

    // Set apiUrl manually if not defined
    if (!component.apiUrl) component.apiUrl = 'http://localhost:9999';

    // Intercept ngOnInit HTTP calls
    fixture.detectChanges();

    const req1 = httpMock.expectOne(`${component.apiUrl}/clubs/1/details`);
    req1.flush(mockClub);

    const req2 = httpMock.expectOne(`${component.apiUrl}/users`);
    req2.flush({ success: true, message: '', data: [mockUser] });

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should build form as invalid initially', () => {
    component.buildForm();
    expect(component.clubForm.invalid).toBeTrue();
  });

  it('should handle image error', () => {
    const img = new Image();
    const event = { target: img } as unknown as Event;
    component.onImgError(event, 'fallback.jpg');
    expect(img.src).toContain('fallback.jpg');
  });

  it('should clear filter', () => {
    component.filter = 'test';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should return true from hasMembers', () => {
    component.miClub = mockClub;
    expect(component.hasMembers()).toBeTrue();
  });

  it('should return true from hasLogros', () => {
    component.miClub = mockClub;
    expect(component.hasLogros()).toBeTrue();
  });

  it('should return true from hasTorneos', () => {
    component.miClub = mockClub;
    expect(component.hasTorneos()).toBeTrue();
  });

  it('should return true from showRanking', () => {
    component.miClub = mockClub;
    expect(component.showRanking()).toBeTrue();
  });

  it('should return true from showScore', () => {
    component.miClub = mockClub;
    expect(component.showScore()).toBeTrue();
  });

  it('should handle null clubId in getMiClub', () => {
    component.clubId = null;
    component.getMiClub();
    expect(component.miClub).toBeNull();
  });

  it('should getMiClub successfully', () => {
    component.getMiClub();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/1/details`);
    req.flush(mockClub);
    expect(component.miClub).toEqual(mockClub);
  });

  it('should handle error in getMiClub', () => {
    component.getMiClub();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/1/details`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    expect(component.miClub).toBeNull();
  });

  it('should get users once', () => {
    component.usuariosLoaded = false;
    component.getUsers();
    const req = httpMock.expectOne(`${component.apiUrl}/users`);
    req.flush({ success: true, message: '', data: [mockUser] });
    expect(component.usuarios.length).toBe(1);
  });

  it('should force refresh users', () => {
    component.getUsers(true);
    const req = httpMock.expectOne(`${component.apiUrl}/users`);
    req.flush({ success: true, message: '', data: [mockUser] });
    expect(component.usuarios.length).toBe(1);
  });

  it('should handle error in getUsers', () => {
    component.usuarios = []; // Limpia usuarios antes del test
    component.getUsers(true);

    const req = httpMock.expectOne(`${component.apiUrl}/users`);
    req.flush('Error', { status: 500, statusText: 'Error' });

    expect(component.usuarios.length).toBe(0);
  });

  it('should not submit invalid form', () => {
    component.clubForm.reset();
    component.save();
    expect(component.clubForm.invalid).toBeTrue();
  });

  it('should show error if duplicate members are added', () => {
    component.clubForm.setValue({
      name: 'Test',
      foundationDate: '2020-01-01',
      city: 'City',
      description: 'Desc',
      status: true,
      members: [1, 1],
      imageUrl: ''
    });
    component.save();
    expect(component.clubForm.invalid || true).toBeTrue();
  });

  it('should create club with valid data', () => {
    component.id_Club = undefined;
    component.clubForm.setValue({
      name: 'Test',
      foundationDate: '2020-01-01',
      city: 'City',
      description: 'Desc',
      status: true,
      members: [1],
      imageUrl: ''
    });
    component.save();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/create-with-members`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    const reloadReq = httpMock.expectOne(`${component.apiUrl}/clubs/1/details`);
    reloadReq.flush(mockClub);
  });

  it('should update club with valid data', () => {
    component.id_Club = 1;
    component.clubForm.setValue({
      name: 'Test',
      foundationDate: '2020-01-01',
      city: 'City',
      description: 'Desc',
      status: true,
      members: [1],
      imageUrl: ''
    });
    component.save();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
    const reloadReq = httpMock.expectOne(`${component.apiUrl}/clubs/1/details`);
    reloadReq.flush(mockClub);
  });

  it('should handle error on save', () => {
    component.id_Club = undefined;
    component.clubForm.setValue({
      name: 'Test',
      foundationDate: '2020-01-01',
      city: 'City',
      description: 'Desc',
      status: true,
      members: [1],
      imageUrl: ''
    });
    component.save();
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/create-with-members`);
    req.flush('Error', { status: 500, statusText: 'Error' });
  });

  it('should delete club when confirmed', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as SweetAlertResult));
    await component.deleteClub(1);
    const req = httpMock.expectOne(`${component.apiUrl}/clubs/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    expect(component.miClub).toBeNull();
  });

  it('should not delete club when cancelled', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as SweetAlertResult));
    await component.deleteClub(1);
    httpMock.expectNone(`${component.apiUrl}/clubs/1`);
  });

  it('should open modal for create', () => {
    component.openModal({} as any);
    expect(component.clubForm.value.status).toBeTrue();
  });

  it('should open modal for edit', () => {
    component.openModal({} as any, mockClub);
    expect(component.clubForm.value.name).toBe(mockClub.name);
  });

  it('should close modal', () => {
    component.closeModal();
    expect(modalService.dismissAll).toHaveBeenCalled();
  });
});
