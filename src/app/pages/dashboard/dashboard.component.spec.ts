import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  const mockDashboardData = {
    activeTournaments: [
      {
        tournamentId: 1,
        name: 'Torneo 1',
        modalities: [{ name: 'Modalidad 1' }],
        categories: [{ name: 'Categoría 1' }]
      }
    ],
    topClubs: [{ clubId: 1, name: 'Club 1' }],
    topPlayers: [{ userId: 1, fullName: 'Jugador 1' }],
    ambits: [{ ambitId: 1, name: 'Ámbito 1' }]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {} // mock mínimo si no se usa en estos tests
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar datos del dashboard correctamente', () => {
    fixture.detectChanges(); // ejecuta ngOnInit

    const req = httpMock.expectOne(`${component.apiUrl}/api/dashboard`);
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, message: '', data: mockDashboardData });

    expect(component.dashboard).toEqual(mockDashboardData);
    expect(component.tournaments.length).toBe(1);
    expect(component.clubs.length).toBe(1);
    expect(component.players.length).toBe(1);
    expect(component.ambits.length).toBe(1);
  });

  it('debe manejar error al cargar datos del dashboard', () => {
    spyOn(Swal, 'fire');

    fixture.detectChanges(); // ejecuta ngOnInit

    const req = httpMock.expectOne(`${component.apiUrl}/api/dashboard`);
    req.error(new ErrorEvent('Error de red'));

    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los datos del dashboard',
      'error'
    );
  });

  it('debe retornar las modalidades como string', () => {
    const torneoMock = {
      modalities: [{ name: 'M1' }, { name: 'M2' }]
    } as any;

    const result = component.getModalitiesString(torneoMock);
    expect(result).toBe('M1, M2');
  });

  it('debe retornar "-" si no hay modalidades', () => {
    const torneoMock = {} as any;
    const result = component.getModalitiesString(torneoMock);
    expect(result).toBe('-');
  });

  it('debe retornar las categorías como string', () => {
    const torneoMock = {
      categories: [{ name: 'C1' }, { name: 'C2' }]
    } as any;

    const result = component.getCategoriesString(torneoMock);
    expect(result).toBe('C1, C2');
  });

  it('debe retornar "-" si no hay categorías', () => {
    const torneoMock = {} as any;
    const result = component.getCategoriesString(torneoMock);
    expect(result).toBe('-');
  });

  it('debe manejar error en imagen y reemplazar src', () => {
    const mockEvent = {
      target: {
        src: ''
      }
    } as unknown as Event;

    component.onImgError(mockEvent, 'ruta/por/defecto.png');

    expect((mockEvent.target as HTMLImageElement).src).toBe('ruta/por/defecto.png');
  });
});
