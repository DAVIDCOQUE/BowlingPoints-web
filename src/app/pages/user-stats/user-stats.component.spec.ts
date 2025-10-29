import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStatsComponent } from './user-stats.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

describe('UserStatsComponent', () => {
  let component: UserStatsComponent;
  let fixture: ComponentFixture<UserStatsComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') {
        return JSON.stringify({ userId: 42 });
      }
      return null;
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [UserStatsComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserStatsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();
    httpMock
      .expectOne(`${component.apiUrl}/api/user-stats/dashboard?userId=42`)
      .flush({ success: true, data: {
        avgScoreGeneral: 180,
        bestLine: 250,
        totalTournaments: 5,
        totalLines: 50,
        bestTournamentAvg: { tournamentId: 1, tournamentName: 'Open', imageUrl: '', average: 190, startDate: '2024-01-01' },
        avgPerTournament: [],
        avgPerModality: [],
        scoreDistribution: []
      } });

    expect(component).toBeTruthy();
  });

  it('debe asignar dashboardStats correctamente', () => {
    fixture.detectChanges();

    const mockStats = {
      avgScoreGeneral: 181,
      bestLine: 255,
      totalTournaments: 10,
      totalLines: 120,
      bestTournamentAvg: { tournamentId: 1, tournamentName: 'Liga', imageUrl: '', average: 200, startDate: '2024-02-01' },
      avgPerTournament: [],
      avgPerModality: [],
      scoreDistribution: []
    };

    httpMock
      .expectOne(`${component.apiUrl}/api/user-stats/dashboard?userId=42`)
      .flush({ success: true, data: mockStats });

    expect(component.dashboardStats.totalTournaments).toBe(10);
    expect(component.dashboardStats.bestLine).toBe(255);
  });

  // Ya no existen llamadas separadas a top-tournaments; se incluye en dashboard

  // El método resumenToreno no existe en el componente actual

  it('debe manejar error en imagen', () => {
    const mockEvent = {
      target: { src: '' }
    } as unknown as Event;

    component.onImgError(mockEvent, 'assets/img/default.png');

    expect((mockEvent.target as HTMLImageElement).src).toBe('assets/img/default.png');
  });
it('debe retornar null si localStorage tiene JSON malformado', () => {
  (localStorage.getItem as jasmine.Spy).and.returnValue('mal json');

  // Llama el método privado usando el component ya inyectado
  const result = (component as any).getUserFromStorage();

  expect(result).toBeNull();
});
});
