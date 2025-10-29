import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentSummaryComponent } from './tournament-summary.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

describe('TournamentSummaryComponent', () => {
  let component: TournamentSummaryComponent;
  let fixture: ComponentFixture<TournamentSummaryComponent>;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;

  const dummyResumen = {
    tournamentName: 'Torneo Nacional',
    organizer: 'Liga Nacional',
    startDate: '2025-01-01',
    endDate: '2025-01-05',
    categories: ['Juvenil', 'Elite'],
    modalities: ['Individual', 'Parejas']
  };

  beforeEach(async () => {
    const locationMock = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TournamentSummaryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: Location, useValue: locationMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentSummaryComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;

    fixture.detectChanges(); // ejecuta ngOnInit()
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya requests pendientes
  });

  it('debería crearse correctamente', () => {
    // 🔄 Flush de la request de ngOnInit()
    httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`)
      .flush({ success: true, data: dummyResumen });

    expect(component).toBeTruthy();
  });

  it('debería obtener el resumen del torneo', () => {
    const req = httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`);
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, data: dummyResumen });

    expect(component.resumenTorneo).toEqual(dummyResumen);
  });

  it('debería manejar errores al cargar resumen del torneo', () => {
    const consoleSpy = spyOn(console, 'error');
    const req = httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`);

    req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.resumenTorneo).toBeNull();
  });

  it('debería volver atrás al llamar goBack()', () => {
    // Flush para evitar request abierta
    httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`)
      .flush({ success: true, data: dummyResumen });

    component.goBack();

    expect(locationSpy.back).toHaveBeenCalled();
  });
});
