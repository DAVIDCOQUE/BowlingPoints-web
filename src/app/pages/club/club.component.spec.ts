import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import Swal from 'sweetalert2';
import { of, Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import { ClubComponent } from './club.component';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { IRole } from 'src/app/model/role.interface';
import { ActivatedRoute } from '@angular/router';

/** Helper para crear clubes válidos */
const createMockClub = (members: IUser[] = []): IClubs => ({
  clubId: 1,
  name: 'Mock Club',
  foundationDate: new Date('2020-01-01'),
  city: 'Ciudad Test',
  description: 'Descripción de prueba',
  imageUrl: '',
  status: true,
  members,
});

describe('ClubComponent', () => {
  let component: ClubComponent;
  let fixture: ComponentFixture<ClubComponent>;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userSubject: Subject<any>;

  const apiUrl = environment.apiUrl;

  const mockUsers: IUser[] = [
    {
      userId: 1,
      personId: 1,
      nickname: 'Player1',
      password: 'dummy',
      roles: [] as IRole[],
      document: '123',
      fullName: 'Jugador Uno',
      fullSurname: 'Apellido',
      email: 'uno@test.com',
      phone: '9999999',
      gender: 'M',
      clubId: 1,
      sub: '1',
    },
    {
      userId: 2,
      personId: 2,
      nickname: 'Player2',
      password: 'dummy',
      roles: [] as IRole[],
      document: '456',
      fullName: 'Jugador Dos',
      fullSurname: 'Apellido',
      email: 'dos@test.com',
      phone: '8888888',
      gender: 'F',
      clubId: 1,
      sub: '2',
    },
  ];

  const mockActivatedRoute: any = {
    snapshot: {
      paramMap: {
        get: (key: string) => null,
      },
    },
  };

  beforeEach(async () => {
    userSubject = new Subject();
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      user$: userSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      declarations: [ClubComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load club data when user has clubId', () => {
    fixture.detectChanges();
    userSubject.next({ clubId: 1 });

    const reqClub = httpMock.expectOne(`${apiUrl}/clubs/1/details`);
    expect(reqClub.request.method).toBe('GET');
    reqClub.flush(createMockClub(mockUsers));

    expect(component.miClub).toBeTruthy();
    expect(component.miClub?.name).toBe('Mock Club');
    expect(component.miClub?.members?.length).toBe(2);
  });

  it('should show alert if user has no club', () => {
    spyOn(Swal, 'fire');
    fixture.detectChanges();
    userSubject.next({ clubId: null });

    // Cierra cualquier llamada HTTP inesperada
    const pending = httpMock.match(() => true);
    pending.forEach((req) => req.flush({}));

    expect(component.miClub).toBeNull();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Sin Club',
      'No tienes un club asociado',
      'info'
    );
  });

  it('should unsubscribe on destroy', () => {
    component['userSub'] = new Subscription();
    const unsubscribeSpy = spyOn(component['userSub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should set miClub to null if no clubId in getMiClub', () => {
    component.clubId = null;
    component.getMiClub();
    expect(component.miClub).toBeNull();
  });

  it('should load miClub successfully', () => {
    component.clubId = 1;
    component.getMiClub();

    const req = httpMock.expectOne(`${apiUrl}/clubs/1/details`);
    req.flush(createMockClub());
    expect(component.miClub?.name).toBe('Mock Club');
  });

  it('should handle error in getMiClub', () => {
    spyOn(Swal, 'fire');
    component.clubId = 1;
    component.getMiClub();

    const req = httpMock.expectOne(`${apiUrl}/clubs/1/details`);
    req.flush({}, { status: 500, statusText: 'Server Error' });

    expect(component.miClub).toBeNull();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los datos de tu club',
      'error'
    );
  });

  it('should replace image src on error', () => {
    const event = { target: { src: '' } } as unknown as Event;
    component.onImgError(event, 'fallback.png');
    expect((event.target as HTMLImageElement).src).toContain('fallback.png');
  });

  it('should return true from hasMembers when club has members', () => {
    component.miClub = createMockClub([{ userId: 1 } as IUser]);
    expect(component.hasMembers()).toBeTrue();
  });

  it('should return false from hasMembers when no members', () => {
    component.miClub = createMockClub([]);
    expect(component.hasMembers()).toBeFalse();
  });

  it('should return false from hasMembers when miClub is null', () => {
    component.miClub = null;
    expect(component.hasMembers()).toBeFalse();
  });
});
