import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentDetailsComponent } from './tournament-details.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { IResultsResponse } from 'src/app/model/result-details.interface';

describe('TournamentDetailsComponent', () => {
  let component: TournamentDetailsComponent;
  let fixture: ComponentFixture<TournamentDetailsComponent>;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;

  const mockResponse: IResultsResponse = {
    tournament: { tournamentName: 'Torneo Test' } as any,
    results: [
      { playerId: 1, scores: [100, 200] }
    ] as any,
    modalities: [
      { modalityId: 2, name: 'Individual' }
    ],
    rounds: [1, 2],
    avgByRound: 150,
    avgByLine: { line1: 180 },
    highestLine: { playerName: 'Test', score: 200, lineNumber: 1 }
  };

  const flushInitialRequest = () => {
    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/tournament-table?tournamentId=1&modalityId=2&roundNumber=1`
    );
    req.flush(mockResponse);
  };

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);

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
                  switch (key) {
                    case 'tournamentId':
                      return '1';
                    case 'modalityId':
                      return '2';
                    default:
                      return null;
                  }
                }
              }
            }
          }
        },
        {
          provide: Location,
          useValue: locationSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    flushInitialRequest();
    expect(component).toBeTruthy();
  });

  it('should call loadResultsTable on init and populate data', () => {
    flushInitialRequest();

    expect(component.resumenTorneo?.tournamentName).toBe('Torneo Test');
    expect(component.players.length).toBe(1);
    expect(component.modalities.length).toBe(1);
    expect(component.rounds).toEqual([1, 2]);
    expect(component.promedioRonda).toBe(150);
    expect(component.promediosPorLinea['line1']).toBe(180);
    expect(component.mayorLinea?.score).toBe(200);
    expect(component.nombreModalidad).toBe('Individual');
    expect(component.maxJuegos).toBe(2);
  });

  it('should calculate max games played by any player', () => {
    flushInitialRequest();
    const mockPlayers = [
      { scores: [100, 150, 180] },
      { scores: [90] },
      { scores: [120, 130] }
    ] as any;

    const max = (component as any).getMaxJuegos(mockPlayers);
    expect(max).toBe(3);
  });

  it('should fallback image on error', () => {
    flushInitialRequest();
    const event = {
      target: {
        src: '',
      }
    };
    const fallbackUrl = 'fallback.jpg';
    component.onImgError(event, fallbackUrl);
    expect(event.target.src).toBe(fallbackUrl);
  });

  it('should go back when goBack is called', () => {
    flushInitialRequest();
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});
