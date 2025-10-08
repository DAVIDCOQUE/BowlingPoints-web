import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisTorneosComponent } from './mis-torneos.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { IUserTournament } from 'src/app/model/UserTournament.interface';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('MisTorneosComponent', () => {
  let component: MisTorneosComponent;
  let fixture: ComponentFixture<MisTorneosComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') {
        return JSON.stringify({ userId: 10 });
      }
      return null;
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [MisTorneosComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MisTorneosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    httpMock.expectOne(`${component.apiUrl}/user-tournaments/10/played`)
      .flush({ success: true, message: '', data: [] });

    expect(component).toBeTruthy();
  });

  it('debe obtener el userId desde localStorage', () => {
    expect(component.userId).toBe(10);
  });

  it('debe cargar torneos jugados desde la API', () => {
    fixture.detectChanges(); // activa ngOnInit

    const mockTorneos: IUserTournament[] = [
      { tournamentId: 1, name: 'Torneo 1' } as IUserTournament
    ];

    const req = httpMock.expectOne(`${component.apiUrl}/user-tournaments/10/played`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: mockTorneos });

    expect(component.torneosJugados.length).toBe(1);
    expect(component.torneosJugados[0].name).toBe('Torneo 1');
  });

  it('no debe cargar torneos si userId es 0', () => {
    spyOn<any>(component, 'getUserFromStorage').and.returnValue(null);
    component.userId = 0;

    component.ngOnInit();

    httpMock.expectNone(`${component.apiUrl}/user-tournaments/0/played`);
  });

  it('debe cargar torneos inscritos usando el mismo endpoint', () => {
    const mockTorneos: IUserTournament[] = [
      { tournamentId: 2, name: 'Torneo 2' } as IUserTournament
    ];

    component.cargarTorneosInscriptos();

    const req = httpMock.expectOne(`${component.apiUrl}/user-tournaments/10/played`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: mockTorneos });

    expect(component.torneosJugados.length).toBe(1);
    expect(component.torneosJugados[0].tournamentId).toBe(2);
  });

  it('debe manejar error en imagen', () => {
    const mockEvent = {
      target: { src: '' }
    } as unknown as Event;

    component.onImgError(mockEvent, 'ruta/por/defecto.png');

    expect((mockEvent.target as HTMLImageElement).src).toBe('ruta/por/defecto.png');
  });

  it('debe retornar null si localStorage está vacío o malformado', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue('mal json');

    const result = (component as any).getUserFromStorage();

    expect(result).toBeNull();
  });
});
