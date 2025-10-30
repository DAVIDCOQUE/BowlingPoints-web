import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from 'src/app/auth/auth.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            // Mock básico del servicio de autenticación
            isAuthenticated: () => true
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya llamadas pendientes
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getDashboard and populate data', () => {
    const mockResponse = {
      success: true,
      message: 'OK',
      data: {
        inProgressTournaments: [{ name: 'Torneo 1' }],
        scheduledOrPostponedTournaments: [{ name: 'Torneo 2' }],
        topPlayers: [{ nickname: 'Player 1' }],
        ambits: [{ name: 'Nacional' }]
      }
    };

    component.getDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);

    expect(component.inProgressTournaments.length).toBe(1);
    expect(component.scheduledOrPostponedTournaments.length).toBe(1);
    expect(component.topPlayers.length).toBe(1);
    expect(component.ambits.length).toBe(1);
  });

  it('should handle error and show Swal on failed request', () => {
    const swalSpy = spyOn(Swal, 'fire');

    component.getDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/dashboard`);
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Error' });

    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los datos del dashboard',
      'error'
    );
  });

  it('should return modalities string correctly', () => {
    const result = component.getModalitiesString({
      modalities: [{ name: 'Modalidad A' }, { name: 'Modalidad B' }]
    } as any);

    expect(result).toBe('Modalidad A, Modalidad B');
  });

  it('should return categories string correctly', () => {
    const result = component.getCategoriesString({
      categories: [{ name: 'Juvenil' }, { name: 'Senior' }]
    } as any);

    expect(result).toBe('Juvenil, Senior');
  });

  it('should handle image error and set default path', () => {
    const fakeEvent = {
      target: {
        src: '',
      } as HTMLImageElement
    };

    component.onImgError(fakeEvent as any, 'default.jpg');

    expect((fakeEvent.target as HTMLImageElement).src).toBe('default.jpg');
  });
});
