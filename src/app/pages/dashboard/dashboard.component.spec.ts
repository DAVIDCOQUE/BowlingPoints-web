import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  const mockDashboardData = {
    inProgressTournaments: [
      { id: 1, name: 'Torneo A', modalities: [{ name: 'Individual' }], categories: [{ name: 'Juvenil' }] }
    ],
    scheduledOrPostponedTournaments: [
      { id: 2, name: 'Torneo B', modalities: [{ name: 'Parejas' }], categories: [{ name: 'Senior' }] }
    ],
    topPlayers: [
      { userId: 1, name: 'Jugador 1', average: 220 }
    ],
    ambits: [
      { ambitId: 1, name: 'Nacional', status: true }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: { baseUrl: 'http://localhost:3000' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(Swal, 'fire'); // para evitar que realmente abra el modal
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ------------------------------
  // BASICS
  // ------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDashboard on init', fakeAsync(() => {
    spyOn(component, 'getDashboard');
    component.ngOnInit();
    expect(component.getDashboard).toHaveBeenCalled();
  }));

  // ------------------------------
  // API SUCCESS
  // ------------------------------

  it('should load dashboard data on success', fakeAsync(() => {
    component.getDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, message: 'OK', data: mockDashboardData });
    tick();

    expect(component.inProgressTournaments.length).toBe(1);
    expect(component.scheduledOrPostponedTournaments.length).toBe(1);
    expect(component.topPlayers.length).toBe(1);
    expect(component.ambits.length).toBe(1);
  }));

  // ------------------------------
  // API ERROR
  // ------------------------------

  it('should handle dashboard API error', fakeAsync(() => {
    component.getDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
    req.error(new ProgressEvent('Network error'));

    tick();

    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los datos del dashboard',
      'error'
    );
  }));

  // ------------------------------
  // UTILS
  // ------------------------------

  it('getModalitiesString returns modalities list as string', () => {
    const mockTournament = {
      modalities: [{ name: 'A' }, { name: 'B' }]
    } as any;

    const result = component.getModalitiesString(mockTournament);
    expect(result).toBe('A, B');
  });

  it('getModalitiesString returns "-" when no modalities', () => {
    const mockTournament = { modalities: null } as any;
    const result = component.getModalitiesString(mockTournament);
    expect(result).toBe('-');
  });

  it('getCategoriesString returns categories list as string', () => {
    const mockTournament = {
      categories: [{ name: 'X' }, { name: 'Y' }]
    } as any;

    const result = component.getCategoriesString(mockTournament);
    expect(result).toBe('X, Y');
  });

  it('getCategoriesString returns "-" when no categories', () => {
    const mockTournament = { categories: null } as any;
    const result = component.getCategoriesString(mockTournament);
    expect(result).toBe('-');
  });

  // ------------------------------
  // onImgError
  // ------------------------------

  it('onImgError replaces broken image with default path', () => {
    const event = {
      target: { src: '' }
    } as any as Event;

    const defaultPath = 'assets/default.png';

    component.onImgError(event, defaultPath);
    expect((event.target as HTMLImageElement).src).toBe(defaultPath);
  });

  it('getModalitiesString returns "-" when tournament is null', () => {
    const result = component.getModalitiesString(null as any);
    expect(result).toBe('-');
  });

  it('getCategoriesString returns "-" when tournament is null', () => {
    const result = component.getCategoriesString(null as any);
    expect(result).toBe('-');
  });


  it('should handle undefined properties in dashboard response gracefully', fakeAsync(() => {
    component.getDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard`);
    req.flush({ success: true, message: 'OK', data: {} });

    tick();

    expect(component.inProgressTournaments).toEqual([]);
    expect(component.scheduledOrPostponedTournaments).toEqual([]);
    expect(component.topPlayers).toEqual([]);
    expect(component.ambits).toEqual([]);
  }));




});
