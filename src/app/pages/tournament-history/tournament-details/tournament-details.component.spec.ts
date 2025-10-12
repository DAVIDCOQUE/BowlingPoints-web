import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentDetailsComponent } from './tournament-details.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('TournamentDetailsComponent', () => {
  let component: TournamentDetailsComponent;
  let fixture: ComponentFixture<TournamentDetailsComponent>;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentDetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'tournamentId') return '1';
                  if (key === 'modalityId') return '2';
                  return null;
                }
              }
            }
          }
        },
        {
          provide: Location,
          useValue: jasmine.createSpyObj('Location', ['back'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones sin responder
  });

  it('should create the component', () => {
    fixture.detectChanges();

    // Responde peticiones generadas por ngOnInit
    const resumenReq = httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`);
    resumenReq.flush({ success: true, data: { tournamentId: 1, tournamentName: 'Torneo Test' } });

    const detalleReq = httpMock.expectOne(`${environment.apiUrl}/results/table?tournamentId=1&modalityId=2`);
    detalleReq.flush({ success: true, data: [] });

    expect(component).toBeTruthy();
  });

  it('should call goBack()', () => {
    fixture.detectChanges();

    // Mock ngOnInit requests
    httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`)
      .flush({ success: true, data: { tournamentId: 1, tournamentName: 'Test' } });

    httpMock.expectOne(`${environment.apiUrl}/results/table?tournamentId=1&modalityId=2`)
      .flush({ success: true, data: [] });

    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should call getResumenTorneo() and set resumenTorneo', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`);
    const mockResumen = {
      success: true,
      data: {
        tournamentId: 1,
        tournamentName: 'Torneo Test'
      }
    };
    req.flush(mockResumen);

    // Segunda llamada generada por ngOnInit
    httpMock.expectOne(`${environment.apiUrl}/results/table?tournamentId=1&modalityId=2`)
      .flush({ success: true, data: [] });

    expect(component.resumenTorneo).toEqual(mockResumen.data);
  });

  it('should call getDetalleTorneo() and set players and maxJuegos', () => {
    fixture.detectChanges();

    // Primera petición de ngOnInit (resumen)
    httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`)
      .flush({ success: true, data: { tournamentId: 1, tournamentName: 'Test' } });

    // Segunda petición de ngOnInit (detalle)
    const req = httpMock.expectOne(`${environment.apiUrl}/results/table?tournamentId=1&modalityId=2`);
    const mockData = {
      success: true,
      data: [
        { personId: 1, playerName: 'Player 1', clubName: 'Club 1', scores: [100, 200], total: 300, promedio: 150 },
        { personId: 2, playerName: 'Player 2', clubName: 'Club 2', scores: [120], total: 120, promedio: 120 }
      ]
    };
    req.flush(mockData);

    expect(component.players.length).toBe(2);
    expect(component.maxJuegos).toBe(2); // Player 1 tiene 2 juegos
  });

  it('getMaxJuegos should return correct max', () => {
    const jugadores = [
      { scores: [100, 200] },
      { scores: [120] },
      { scores: [80, 90, 100] }
    ] as any;

    const result = (component as any).getMaxJuegos(jugadores);
    expect(result).toBe(3);
  });

  it('should call getDetalleTorenoTodoEvento() and set players and maxJuegos', () => {
    fixture.detectChanges();

    // Peticiones iniciales de ngOnInit
    httpMock.expectOne(`${environment.apiUrl}/results/tournament-summary?tournamentId=1`)
      .flush({ success: true, data: { tournamentId: 1, tournamentName: 'Test' } });

    httpMock.expectOne(`${environment.apiUrl}/results/table?tournamentId=1&modalityId=2`)
      .flush({ success: true, data: [] });

    // Llamada directa al método
    component.getDetalleTorenoTodoEvento();

    const req = httpMock.expectOne(`${environment.apiUrl}/results/by-gender?tournamentId=1`);
    const mockData = {
      success: true,
      data: [
        { personId: 1, playerName: 'P1', clubName: 'C1', scores: [100, 150], total: 250, promedio: 125 }
      ]
    };
    req.flush(mockData);

    expect(component.players.length).toBe(1);
    expect(component.maxJuegos).toBe(2);
  });
});
