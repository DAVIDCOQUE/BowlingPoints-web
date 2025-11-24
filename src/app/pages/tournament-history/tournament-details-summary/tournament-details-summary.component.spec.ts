import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentDetailsSummaryComponent } from './tournament-details-summary.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

describe('TournamentDetailsSummaryComponent', () => {
  let component: TournamentDetailsSummaryComponent;
  let fixture: ComponentFixture<TournamentDetailsSummaryComponent>;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;



  const flushInitRequest = (responseOverride = {}) => {
    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/by-modality?tournamentId=1&roundNumber=1&branchId=2`
    );
    req.flush({
      tournament: {},
      modalities: [],
      rounds: [],
      resultsByModality: [],
      ...responseOverride
    });
  };



  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      declarations: [TournamentDetailsSummaryComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'tournamentId') return '1';
                  if (key === 'branchId') return '2';
                  return null;
                }
              }
            }
          }
        },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentDetailsSummaryComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    flushInitRequest();
    expect(component).toBeTruthy();
  });

  it('should load general results on init', () => {
    const mockResponse = {
      tournament: { name: 'Torneo Test' },
      modalities: [{ name: 'Individual' }],
      rounds: [1, 2],
      resultsByModality: [{ playerName: 'Juan', scores: [100, 200] }]
    };

    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/by-modality?tournamentId=1&roundNumber=1&branchId=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(component.resumenTorneo.name).toBe('Torneo Test');
    expect(component.modalities.length).toBe(1);
    expect(component.rounds).toEqual([1, 2]);
    expect(component.resultsByModality.length).toBe(1);
  });

  it('should handle error when loading results', () => {
    const consoleSpy = spyOn(console, 'error');
    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/by-modality?tournamentId=1&roundNumber=1&branchId=2`
    );
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    expect(consoleSpy).toHaveBeenCalledWith(' Error cargando resumen general:', jasmine.anything());
  });

  it('should return plus/minus from 200 correctly', () => {
    flushInitRequest(); //  Añadido
    expect(component.getPlusMinus200(220)).toBe('+20');
    expect(component.getPlusMinus200(180)).toBe('-20');
    expect(component.getPlusMinus200(200)).toBe('+0');
  });

  it('should load data again on round change', () => {
    flushInitRequest();
    component.roundNumber = 2;
    component.onRoundChange();

    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/by-modality?tournamentId=1&roundNumber=2&branchId=2`
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      tournament: {},
      modalities: [],
      rounds: [],
      resultsByModality: []
    });

    expect(component.modalities).toEqual([]);
  });

  it('should fallback image on error', () => {
    flushInitRequest();
    const event = { target: { src: '' } };
    const fallback = 'fallback.jpg';
    component.onImgError(event, fallback);
    expect(event.target.src).toBe(fallback);
  });

  it('should go back when goBack is called', () => {
    flushInitRequest();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });


  it('should filter visible modalities correctly when valid data is present', () => {
    flushInitRequest(); // Esto ya es seguro aquí porque httpMock está definido

    component.modalities = [
      { name: 'Individual' },
      { name: 'Parejas' }
    ] as any;

    component.resultsByModality = [
      {
        modalityScores: {
          Individual: [100],
          Parejas: null
        }
      }
    ] as any;

    component.filterVisibleModalities();

    expect(component.visibleModalities.length).toBe(1);
    expect(component.visibleModalities[0].name).toBe('Individual');
  });

  it('should result in empty visible modalities when all modalities have null scores', () => {
    flushInitRequest();

    component.modalities = [
      { name: 'Individual' },
      { name: 'Parejas' }
    ] as any;

    component.resultsByModality = [
      {
        modalityScores: {
          Individual: null,
          Parejas: null
        }
      }
    ] as any;

    component.filterVisibleModalities();

    expect(component.visibleModalities.length).toBe(0);
  });




});
