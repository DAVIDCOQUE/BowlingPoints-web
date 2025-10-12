import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentlistComponent } from './tournament-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { IGenerico } from 'src/app/model/generico.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { ITournament } from 'src/app/model/tournament.interface';

describe('TournamentlistComponent', () => {
  let component: TournamentlistComponent;
  let fixture: ComponentFixture<TournamentlistComponent>;
  let httpMock: HttpTestingController;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'ambitId' ? '1' : null)
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentlistComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentlistComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // ejecuta ngOnInit()
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el componente y cargar el nombre del ámbito', () => {
    const req1 = httpMock.expectOne(`${environment.apiUrl}/ambits/1`);
    req1.flush({
      success: true,
      message: '',
      data: { ambitId: 1, name: 'Nacional' }
    });

    const req2 = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    req2.flush({ success: true, message: '', data: [] });

    expect(component).toBeTruthy();
    expect(component.ambitName).toBe('Nacional');
  });

  it('debería cargar correctamente la lista de torneos', () => {
    // 1️⃣ Mock ámbito
    httpMock.expectOne(`${environment.apiUrl}/ambits/1`).flush({
      success: true,
      message: '',
      data: { ambitId: 1, name: 'Nacional' }
    });

    // 2️⃣ Mock torneos
    const mockTorneos: IGenerico<ITournament[]> = {
      success: true,
      message: '',
      data: [
        {
          tournamentId: 1,
          name: 'Torneo Nacional',
          organizer: 'Liga',
          imageUrl: 'default.jpg',
          modalities: [],
          categories: [],
          modalityIds: [],
          categoryIds: [],
          startDate: '2025-01-01',
          endDate: '2025-01-03',
          ambitId: 1,
          ambitName: 'Nacional',
          location: 'Cali',
          stage: 'Fase 1',
          status: true,
          lugar: 'Liga Municipal'
        }
      ]
    };

    const req2 = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    req2.flush(mockTorneos);

    expect(component.listaTorneos.length).toBe(1);
    expect(component.listaTorneos[0].name).toBe('Torneo Nacional');
  });

  it('debería navegar al dashboard al llamar goBack()', () => {
    // Cerramos las 2 peticiones del ngOnInit para evitar pendientes
    httpMock.expectOne(`${environment.apiUrl}/ambits/1`).flush({
      success: true,
      message: '',
      data: { ambitId: 1, name: 'Nacional' }
    });

    httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`).flush({
      success: true,
      message: '',
      data: []
    });

    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['dashboard']);
  });

  it('debería manejar error al cargar ámbito', () => {
    const req1 = httpMock.expectOne(`${environment.apiUrl}/ambits/1`);
    req1.flush('Error al obtener ámbito', { status: 500, statusText: 'Internal Server Error' });

    // Cierra también la segunda request
    const req2 = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    req2.flush({ success: true, message: '', data: [] });

    expect(component.ambitName).toBe('');
  });

  it('debería manejar error al cargar torneos', () => {
    httpMock.expectOne(`${environment.apiUrl}/ambits/1`).flush({
      success: true,
      message: '',
      data: { ambitId: 1, name: 'Nacional' }
    });

    const req2 = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    req2.flush('Error al obtener torneos', { status: 500, statusText: 'Server Error' });

    expect(component.listaTorneos).toEqual([]);
  });

  it('no debería llamar APIs si no hay ambitId', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      declarations: [TournamentlistComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } }
          }
        },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentlistComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    httpMock.expectNone(`${environment.apiUrl}/ambits/1`);
    httpMock.expectNone(`${environment.apiUrl}/results/by-ambit`);
    expect(component.listaTorneos).toEqual([]);
  });
});
