import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserTournamentsComponent } from './user-tournaments.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/auth/auth.service';
import { UserTournamentApiService } from 'src/app/services/user-tournament-api.service';

describe('UserTournamentsComponent', () => {
  let component: UserTournamentsComponent;
  let fixture: ComponentFixture<UserTournamentsComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceStub: Partial<AuthService>;
  const userId = 10;
  const apiUrl = 'http://localhost:9999';
  const groupedUrl = `${apiUrl}/user-tournaments/player/${userId}/grouped`;

  beforeEach(async () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'user') {
        return JSON.stringify({ userId });
      }
      return null;
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceStub = { baseUrl: apiUrl };

    await TestBed.configureTestingModule({
      declarations: [UserTournamentsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceStub },
        UserTournamentApiService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserTournamentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(groupedUrl);
    req.flush({
      success: true,
      message: '',
      data: {
        active: [{ tournamentId: 1, name: 'Activo' }],
        finished: [{ tournamentId: 2, name: 'Finalizado' }]
      }
    });

    expect(component).toBeTruthy();
  });

  it('debe exponer apiUrl correctamente desde AuthService', () => {
    expect(component.apiUrl).toBe(apiUrl);
  });

  it('debe obtener el userId desde localStorage', () => {
    expect(component.userId).toBe(userId);
  });

  it('debe llamar cargarTorneosJugados cuando userId > 0', () => {
    const spy = spyOn(component, 'cargarTorneosJugados');
    component.userId = 5;
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('no debe cargar torneos si userId es 0', () => {
    component.userId = 0;
    component.ngOnInit();
    httpMock.expectNone(`${apiUrl}/user-tournaments/player/0/grouped`);
    expect().nothing();
  });

  it('debe cargar torneos activos y finalizados correctamente', () => {
    fixture.detectChanges();

    const mockResponse = {
      active: [
        { tournamentId: 1, name: 'Torneo Activo' }
      ],
      finished: [
        { tournamentId: 2, name: 'Torneo Finalizado' }
      ]
    };

    const req = httpMock.expectOne(groupedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: '',
      data: {
        active: [{ tournamentId: 1, name: 'Torneo Activo' }],
        finished: [{ tournamentId: 2, name: 'Torneo Finalizado' }]
      }
    });

    expect(component.torneosActivos.length).toBe(1);
    expect(component.torneosFinalizados.length).toBe(1);
  });

  it('debe mostrar alerta de error si la carga de torneos falla', () => {
    spyOn(Swal, 'fire');
    fixture.detectChanges();

    const req = httpMock.expectOne(groupedUrl);
    req.error(new ErrorEvent('Error de red'));

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron cargar los torneos del usuario.'
    }));
  });

  it('debe manejar error de imagen correctamente', () => {
    const mockImg = document.createElement('img');
    const event = { target: mockImg } as unknown as Event;

    component.onImgError(event, 'ruta/por/defecto.png');
    expect(mockImg.src).toContain('ruta/por/defecto.png');
  });

  it('debe advertir si el target no es una imagen válida', () => {
    const consoleSpy = spyOn(console, 'warn');
    const fakeEvent = { target: {} } as unknown as Event;

    component.onImgError(fakeEvent, 'fallback.png');
    expect(consoleSpy).toHaveBeenCalledWith('Error al reemplazar la imagen: elemento no válido.');
  });

  it('debe retornar "No especificada" si la lista es vacía o null', () => {
    expect(component.getNombres(null)).toBe('No especificada');
    expect(component.getNombres(undefined)).toBe('No especificada');
    expect(component.getNombres([])).toBe('No especificada');
  });

  it('debe retornar los nombres concatenados si la lista es válida', () => {
    const input = [{ name: 'Uno' }, { name: 'Dos' }];
    const resultado = component.getNombres(input);
    expect(resultado).toBe('Uno / Dos');
  });

  it('debe retornar null si localStorage tiene JSON inválido', () => {
    spyOn(console, 'warn');
    (localStorage.getItem as jasmine.Spy).and.returnValue('no es json');
    const res = (component as any).getUserFromStorage();
    expect(res).toBeNull();
  });

  it('debe advertir si el JSON no tiene userId válido', () => {
    spyOn(console, 'warn');
    (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ nombre: 'Invalid' }));

    const result = (component as any).getUserFromStorage();
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('Datos de usuario inválidos en localStorage');
  });

  it('debe retornar objeto válido si JSON tiene userId', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({ userId: 25 }));
    const result = (component as any).getUserFromStorage();
    expect(result).toEqual(jasmine.objectContaining({ userId: 25 }));
  });

});
