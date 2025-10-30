import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStatsComponent } from './user-stats.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

describe('UserStatsComponent', () => {
  let component: UserStatsComponent;
  let fixture: ComponentFixture<UserStatsComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') return JSON.stringify({ userId: 42 });
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

  afterEach(() => httpMock.verify());

  it('debe crear el componente', () => {
    fixture.detectChanges();
    httpMock.expectOne(`${component.apiUrl}/api/user-stats/dashboard?userId=42`)
      .flush({
        success: true,
        data: {
          avgScoreGeneral: 180, bestLine: 250, totalTournaments: 5, totalLines: 50,
          bestTournamentAvg: { tournamentId: 1, tournamentName: 'Open', imageUrl: '', average: 190, startDate: '2024-01-01' },
          avgPerTournament: [], avgPerModality: [], scoreDistribution: []
        }
      });
    expect(component).toBeTruthy();
  });

  it('debe asignar dashboardStats correctamente', () => {
    fixture.detectChanges();
    const mockStats = {
      avgScoreGeneral: 181, bestLine: 255, totalTournaments: 10, totalLines: 120,
      bestTournamentAvg: { tournamentId: 1, tournamentName: 'Liga', imageUrl: '', average: 200, startDate: '2024-02-01' },
      avgPerTournament: [], avgPerModality: [], scoreDistribution: []
    };
    httpMock.expectOne(`${component.apiUrl}/api/user-stats/dashboard?userId=42`)
      .flush({ success: true, data: mockStats });
    expect(component.dashboardStats.bestLine).toBe(255);
  });

  it('debe manejar error en imagen', () => {
    const img = document.createElement('img');
    img.src = '';
    const mockEvent = { target: img } as unknown as Event;
    component.onImgError(mockEvent, 'assets/img/default.png');
    expect(img.src).toContain('assets/img/default.png');
  });

  it('debe retornar null si localStorage tiene JSON malformado', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue('mal json');
    const spy = spyOn(console, 'error');
    const result = (component as any).getUserFromStorage();
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalled();
  });

  it('debe manejar error al cargar estadísticas', () => {
    const swalSpy = spyOn(Swal, 'fire');
    fixture.detectChanges();
    const req = httpMock.expectOne(`${component.apiUrl}/api/user-stats/dashboard?userId=42`);
    req.error(new ProgressEvent('error'));
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
  });

  it('debe manejar caso sin dashboardStats en renderAllCharts', () => {
    component['dashboardStats'] = undefined as any;
    expect((component as any).renderAllCharts()).toBeUndefined();
  });

  it('debe inicializar userId correctamente', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ userId: 7 }));
    // forzamos llamada al método privado dentro del mismo componente
    (component as any).initializeUser();
    expect(component.userId).toBe(7);
  });

  it('debe dejar userId=0 si no hay user en storage', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);
    (component as any).initializeUser();
    expect(component.userId).toBe(0);
  });
});
