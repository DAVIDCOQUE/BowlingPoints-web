import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentSummaryComponent } from './tournament-summary.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { Location } from '@angular/common';

describe('TournamentSummaryComponent', () => {
  let component: TournamentSummaryComponent;
  let fixture: ComponentFixture<TournamentSummaryComponent>;
  let service: TournamentsService;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;

  const dummyResumen: any = {
    tournamentId: 1,
    name: 'Torneo de Prueba',
    categories: [{ categoryId: 1, name: 'Cat A' }],
    modalities: [{ modalityId: 1, name: 'Mod 1' }],
    branches: [{ branchId: 1, name: 'Central' }],
    tournamentRegistrations: [
      { playerId: 1, categoryId: 1, name: 'Jugador 1' },
    ],
  };

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TournamentSummaryComponent],
      providers: [
        { provide: Location, useValue: locationSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentSummaryComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TournamentsService);
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya requests pendientes
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('debería crearse correctamente', () => {
    httpMock
      .expectOne(
        `${environment.apiUrl}/results/tournament-summary?tournamentId=1`
      )
      .flush({ success: true, data: dummyResumen });

    expect(component).toBeTruthy();
  });

  it('should load tournament successfully', () => {
    const mockResponse: any = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        categories: [{ name: 'Cat 1' }],
        modalities: [{ name: 'Mod 1' }],
        branches: [{ branchId: 1, name: 'Central' }],
        tournamentRegistrations: [{ playerId: 1, name: 'John', categoryId: 1 }],
      },
    };

    spyOn(service, 'getTournamentById').and.returnValue(of(mockResponse));

    component.loadTournamentById(1);

    expect(service.getTournamentById).toHaveBeenCalledWith(1);
    expect(component.selectedTournament).toEqual(mockResponse.data);
    expect(component.categories.length).toBe(1);
    expect(component.branches.length).toBe(1);
    expect(component.players.length).toBe(1);
  });

  it('should handle error when loading tournament', () => {
    const consoleSpy = spyOn(console, 'error');
    const swalSpy = spyOn(Swal, 'fire');

    spyOn(service, 'getTournamentById').and.returnValue(
      throwError(() => new Error('Error HTTP'))
    );

    component.loadTournamentById(1);

    expect(consoleSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudo cargar el torneo',
      'error'
    );
  });

  it('should navigate back when goBack() is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should count players by category', () => {
    component.players = [
      { playerId: 1, categoryId: 1 } as any,
      { playerId: 2, categoryId: 2 } as any,
      { playerId: 3, categoryId: 1 } as any,
    ];

    const count = component.getPlayersCountByCategory(1);
    expect(count).toBe(2);
  });

  it('debería obtener el resumen del torneo', () => {
    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/tournament-summary?tournamentId=1`
    );
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, data: dummyResumen });

    expect(component.selectedTournament).toEqual(dummyResumen);
  });

  it('debería manejar errores al cargar resumen del torneo', () => {
    const consoleSpy = spyOn(console, 'error');
    const req = httpMock.expectOne(
      `${environment.apiUrl}/results/tournament-summary?tournamentId=1`
    );

    req.flush(
      { message: 'Error' },
      { status: 500, statusText: 'Server Error' }
    );

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.selectedTournament).toBeNull();
  });

  it('should load tournament with branches and player counts', () => {
    const mockResponse: any = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        categories: [{ name: 'Cat A' }],
        modalities: [{ name: 'Mod 1' }],
        branchPlayerCounts: [{ branch: 'Sur', players: 10 }],
        branches: [{ branchId: 1, name: 'Norte' }],
        tournamentRegistrations: [{ playerId: 1, name: 'Player' }],
      },
    };

    const serviceSpy = spyOn(service, 'getTournamentById').and.returnValue(
      of(mockResponse)
    );

    component.loadTournamentById(1);

    expect(serviceSpy).toHaveBeenCalledWith(1);
    expect(component.selectedTournament).toEqual(mockResponse.data);
    expect(component.branches).toEqual(mockResponse.data.branches);
    expect(component.players.length).toBe(1);
  });

  it('should load tournament with only branches if branchPlayerCounts is missing', () => {
    const mockResponse: any = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        categories: [{ name: 'Cat A' }],
        modalities: [{ name: 'Mod 1' }],
        branchPlayerCounts: [{ branch: 'Sur', players: 10 }],
        branches: [{ branchId: 1, name: 'Norte' }],
        tournamentRegistrations: [{ playerId: 1, name: 'Player' }],
      },
    };

    spyOn(service, 'getTournamentById').and.returnValue(of(mockResponse));
    component.loadTournamentById(5);
    expect(component.branches).toEqual(mockResponse.data.branches);
  });

  it('should handle case with no branches or player counts', () => {
    const mockResponse: any = {
      success: true,
      message: '',
      data: {},
    };

    spyOn(service, 'getTournamentById').and.returnValue(of(mockResponse));

    component.loadTournamentById(7);

    expect(component.branches).toEqual([]);
  });
});
