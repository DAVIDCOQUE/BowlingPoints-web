import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubComponent } from './club.component';
import Swal from 'sweetalert2';
import { IClubs } from 'src/app/model/clubs.interface';
import { IUser } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError, Subscription } from 'rxjs';
import { ClubApiService } from 'src/app/services/club-api.service';

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
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let clubApiServiceMock: jasmine.SpyObj<ClubApiService>;
  let userSubject: Subject<any>;

  const fakeApiUrl = 'http://localhost:9999';
  const routeSnapshotWithId = {
    snapshot: {
      paramMap: {
        get: (key: string) => '1',
      },
    },
  };

  const routeSnapshotWithoutId = {
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

    clubApiServiceMock = jasmine.createSpyObj('ClubApiService', ['getClubById'], {
      apiUrl: fakeApiUrl,
    });

    await TestBed.configureTestingModule({
      declarations: [ClubComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ClubApiService, useValue: clubApiServiceMock },
        { provide: ActivatedRoute, useValue: routeSnapshotWithoutId }, // Default: no param in route
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    userSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should load club by route param (Caso B)', () => {
      const clubData = createMockClub();

      // Re-configurar el test con ActivatedRoute que sí tiene ID
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [ClubComponent],
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: ClubApiService, useValue: clubApiServiceMock },
          { provide: ActivatedRoute, useValue: routeSnapshotWithId },
        ],
      }).compileComponents();

      const fixtureWithId = TestBed.createComponent(ClubComponent);
      const componentWithId = fixtureWithId.componentInstance;

      clubApiServiceMock.getClubById.and.returnValue(of(clubData));

      fixtureWithId.detectChanges();

      expect(clubApiServiceMock.getClubById).toHaveBeenCalledWith(1);
      expect(componentWithId.miClub).toEqual(clubData);
    });

    it('should load club from authenticated user (Caso A)', () => {
      const clubData = createMockClub();
      clubApiServiceMock.getClubById.and.returnValue(of(clubData));

      fixture.detectChanges();
      userSubject.next({ clubId: 1 });

      expect(clubApiServiceMock.getClubById).toHaveBeenCalledWith(1);
      expect(component.miClub).toEqual(clubData);
    });

    it('should show Swal when user has no clubId', () => {
      spyOn(Swal, 'fire');

      fixture.detectChanges();
      userSubject.next({ clubId: null });

      expect(component.miClub).toBeNull();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Sin Club',
        'No tienes un club asociado',
        'info'
      );
    });
  });

  describe('getMiClub()', () => {
    it('should set miClub to null if no clubId', () => {
      component.clubId = null;
      component.getMiClub();
      expect(component.miClub).toBeNull();
    });

    it('should load miClub successfully', () => {
      const clubData = createMockClub();
      component.clubId = 1;

      clubApiServiceMock.getClubById.and.returnValue(of(clubData));
      component.getMiClub();

      expect(clubApiServiceMock.getClubById).toHaveBeenCalledWith(1);
      expect(component.miClub).toEqual(clubData);
    });

    it('should handle error and show Swal', () => {
      spyOn(Swal, 'fire');
      component.clubId = 1;

      clubApiServiceMock.getClubById.and.returnValue(
        throwError(() => new Error('API Error'))
      );

      component.getMiClub();

      expect(component.miClub).toBeNull();
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'No se pudieron cargar los datos de tu club',
        'error'
      );
    });
  });

  describe('Helpers', () => {
    it('should replace image src on error', () => {
      const mockEvent = {
        target: { src: '' },
      } as unknown as Event;

      component.onImgError(mockEvent, 'fallback.png');
      expect((mockEvent.target as HTMLImageElement).src).toContain('fallback.png');
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

    it('should return the correct apiUrl', () => {
      expect(component.apiUrl).toBe(fakeApiUrl);
    });
  });

  describe('ngOnDestroy()', () => {
    it('should unsubscribe from user$', () => {
      component['userSub'] = new Subscription();
      const unsubSpy = spyOn(component['userSub'], 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubSpy).toHaveBeenCalled();
    });
  });
});
