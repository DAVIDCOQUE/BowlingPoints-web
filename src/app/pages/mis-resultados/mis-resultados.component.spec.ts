import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisResultadosComponent } from './mis-resultados.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

describe('MisResultadosComponent', () => {
  let component: MisResultadosComponent;
  let fixture: ComponentFixture<MisResultadosComponent>;
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
      declarations: [MisResultadosComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MisResultadosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    // Mock para estadisticas
    httpMock.expectOne(`${component.apiUrl}/api/user-stats/summary?userId=42`)
      .flush({ success: true, data: component.estadisticas });

    // Mock para torneos top
    httpMock.expectOne(`${component.apiUrl}/api/user-stats/top-tournaments?userId=42`)
      .flush({ success: true, data: [] });

    expect(component).toBeTruthy();
  });

  it('debe asignar estadísticas correctamente', () => {
    fixture.detectChanges();

    const mockStats = {
      tournamentsWon: 2,
      totalTournaments: 10,
      totalStrikes: 30,
      avgScore: 180,
      bestGame: 250
    };

    httpMock.expectOne(`${component.apiUrl}/api/user-stats/summary?userId=42`)
      .flush({ success: true, data: mockStats });

    httpMock.expectOne(`${component.apiUrl}/api/user-stats/top-tournaments?userId=42`)
      .flush({ success: true, data: [] });

    expect(component.estadisticas.totalTournaments).toBe(10);
    expect(component.estadisticas.avgScore).toBe(180);
  });

  it('debe asignar torneos top correctamente', () => {
    fixture.detectChanges();

    const mockTorneos = [
      {
        tournamentId: 1,
        name: 'Torneo Ejemplo',
        startDate: '2025-01-01',
        lugar: 'Club X',
        modalidad: 'Individual',
        categoria: 'A',
        bestScore: 200,
        imageUrl: '',
        resultados: 210
      }
    ];

    httpMock.expectOne(`${component.apiUrl}/api/user-stats/summary?userId=42`)
      .flush({ success: true, data: component.estadisticas });

    httpMock.expectOne(`${component.apiUrl}/api/user-stats/top-tournaments?userId=42`)
      .flush({ success: true, data: mockTorneos });

    expect(component.topTorneos.length).toBe(1);
    expect(component.torneos.length).toBe(1);
    expect(component.torneos[0].name).toBe('Torneo Ejemplo');
  });

  it('debe navegar al resumen del torneo', () => {
    component.resumenToreno(5);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/resumen-torneo', 5]);
  });

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
