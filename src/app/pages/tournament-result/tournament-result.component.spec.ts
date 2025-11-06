import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TournamentsService } from 'src/app/services/tournaments.service';
import { ResultsService } from 'src/app/services/results.service';
import { UserApiService } from 'src/app/services/user-api.service';
import { IUser } from 'src/app/model/user.interface';
import { IResults } from 'src/app/model/result.interface';

describe('TournamentResultComponent', () => {
  let component: TournamentResultComponent;
  let fixture: ComponentFixture<TournamentResultComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let userApiSpy: jasmine.SpyObj<UserApiService>;
  let resultsServiceSpy: jasmine.SpyObj<ResultsService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;
  let locationSpy: jasmine.SpyObj<Location>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentResultComponent],
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'tournamentId' ? '1' : null),
              },
            },
          },
        },
        {
          provide: TournamentsService,
          useValue: jasmine.createSpyObj('TournamentsService', ['getTournamentById']),
        },
        {
          provide: UserApiService,
          useValue: jasmine.createSpyObj('UserApiService', ['getActiveUsers']),
        },
        {
          provide: ResultsService,
          useValue: jasmine.createSpyObj('ResultsService', ['getResultsFiltered']),
        },
        {
          provide: NgbModal,
          useValue: jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']),
        },
        {
          provide: Location,
          useValue: jasmine.createSpyObj('Location', ['back']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentResultComponent);
    httpMock = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;

    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    userApiSpy = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    resultsServiceSpy = TestBed.inject(ResultsService) as jasmine.SpyObj<ResultsService>;
    modalSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournament on init', fakeAsync(() => {
    const mockTournament = {
      success: true,
      message: 'ok',
      data: {
        tournamentId: 1,
        name: 'Test',
        categories: [{ categoryId: 1, name: 'Cat A', status: true }],
        modalities: [{ modalityId: 1, name: 'Mod A', status: true }],
        branches: [{ branchId: 1, name: 'Branch A', description: '', status: true }],
      },
    };

    tournamentsServiceSpy.getTournamentById.and.returnValue(of(mockTournament));
    userApiSpy.getActiveUsers.and.returnValue(of([]));
    resultsServiceSpy.getResultsFiltered.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

    // Interceptar y responder la petición que hace loadRegisteredPlayers()
    const req = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    req.flush([]);

    expect(component.selectedTournament?.name).toBe('Test');
    expect(component.categories.length).toBe(1);
  }));

  it('should show alert if tournament not found', fakeAsync(() => {
    spyOn(Swal, 'fire');

    tournamentsServiceSpy.getTournamentById.and.returnValue(
      of({ success: true, message: 'no encontrado', data: null })
    );
    userApiSpy.getActiveUsers.and.returnValue(of([]));
    resultsServiceSpy.getResultsFiltered.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

    const req = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    req.flush([]);

    expect(Swal.fire).toHaveBeenCalledWith('Atención', 'No se encontró el torneo solicitado', 'info');
  }));

  it('should load players', fakeAsync(() => {
    const mockPlayers: IUser[] = [
      {
        userId: 1,
        nickname: 'jugador1',
        password: '123456',
        fullName: 'Jugador 1',
        fullSurname: 'Apellido 1',
        email: 'jugador1@email.com',
        phone: '123456789',
        gender: 'Masculino',
        categories: [],
        roles: [],
        personId: 101,
        sub: 'abc123',
        status: true,
        photoUrl: '',
      },
    ];

    userApiSpy.getActiveUsers.and.returnValue(of(mockPlayers));

    component.loadPlayers();
    tick();

    expect(component.players.length).toBe(1);
  }));

  it('should handle error in loadPlayers', () => {
    spyOn(console, 'error');
    userApiSpy.getActiveUsers.and.returnValue(throwError(() => new Error('fail')));
    component.loadPlayers();
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle loadResults success', fakeAsync(() => {
    component.tournamentId = 1;
    const results: IResults[] = [
      {
        resultId: 1,
        personId: 1,
        teamId: null,
        tournamentId: 1,
        categoryId: 1,
        modalityId: 1,
        branchId: 1,
        roundNumber: 1,
        laneNumber: 1,
        lineNumber: 1,
        score: 200,
        branchName: 'Branch A',
      },
    ];
    resultsServiceSpy.getResultsFiltered.and.returnValue(of(results));
    component.loadResults();
    tick();
    expect(component.results.length).toBe(1);
  }));

  it('should handle loadResults error gracefully', () => {
    component.tournamentId = 1;
    spyOn(Swal, 'fire');
    spyOn(console, 'error');
    resultsServiceSpy.getResultsFiltered.and.returnValue(throwError(() => new Error('fail')));
    component.loadResults();
    expect(console.error).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudieron cargar los resultados', 'error');
  });

  //  loadRegisteredPlayers tests
  it('should skip loading registered players if tournamentId is null', () => {
    component.tournamentId = null;
    component.loadRegisteredPlayers();
    expect(component.registrations.length).toBe(0);
  });

  it('should load registered players successfully', () => {
    component.tournamentId = 1;
    spyOn(component, 'onFilterPlayerChange');

    component.loadRegisteredPlayers();

    const mockRegistrations = [
      { registrationId: 1, personId: 101, branchName: 'Branch A' },
      { registrationId: 2, personId: 102, branchName: 'Branch B' },
    ];

    const req = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRegistrations);

    expect(component.registrations.length).toBe(2);
    expect(component.filteredRegistrations.length).toBe(2);
    expect(component.onFilterPlayerChange).toHaveBeenCalled();
  });

  it('should handle error when loading registered players', () => {
    component.tournamentId = 1;
    spyOn(Swal, 'fire');
    spyOn(console, 'error');

    component.loadRegisteredPlayers();

    const req = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    req.error(new ErrorEvent('Network error'));

    expect(console.error).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los jugadores registrados',
      'error'
    );
  });

  // Test POST
  it('should save a new player (POST)', fakeAsync(() => {
    component.tournamentId = 1;
    component.initPlayerForm();
    component.playerForm.patchValue({
      personId: 1,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      teamId: null,
      status: true
    });

    spyOn(Swal, 'fire');
    component.savePlayer();

    // interceptar el POST
    const req = httpMock.expectOne(`${component['apiUrl']}/registrations`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    //interceptar el GET que dispara loadRegisteredPlayers()
    const getReq = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    getReq.flush([]); // responde lista vacía

    tick();
    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Jugador agregado', 'success');
  }));

  it('should update existing player (PUT)', fakeAsync(() => {
    component.tournamentId = 1;
    component.idPlayer = 55;
    component.initPlayerForm();
    component.playerForm.patchValue({
      personId: 1,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      teamId: null,
      status: true
    });

    spyOn(Swal, 'fire');
    component.savePlayer();

    const req = httpMock.expectOne(`${component['apiUrl']}/registrations/55`);
    expect(req.request.method).toBe('PUT');
    req.flush({});

    //  interceptar el GET de loadRegisteredPlayers()
    const getReq = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    getReq.flush([]);

    tick();
    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Jugador actualizado', 'success');
  }));

  it('should handle error in savePlayer()', fakeAsync(() => {
    component.tournamentId = 1;
    component.idPlayer = null;
    component.initPlayerForm();
    component.playerForm.patchValue({
      personId: 1,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      teamId: null,
      status: true
    });

    spyOn(Swal, 'fire');
    component.savePlayer();

    const req = httpMock.expectOne(`${component['apiUrl']}/registrations`);
    req.flush({ message: 'Error guardando' }, { status: 500, statusText: 'Server Error' });

    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Error guardando', 'error');
  }));

  it('should delete a player', fakeAsync(() => {
    component.tournamentId = 1;
    const registrationId = 42;

    // Simula confirmación del usuario en el modal
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);

    component.deletePlayer(registrationId);
    tick();

    // Interceptar DELETE
    const deleteReq = httpMock.expectOne(`${component['apiUrl']}/registrations/${registrationId}`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});
    //  Interceptar el GET que hace loadRegisteredPlayers()
    const getReq = httpMock.expectOne(`${component['apiUrl']}/registrations/tournament/1`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush([]);

    tick();

    expect(Swal.fire).toHaveBeenCalled();
  }));



  it('should initialize and validate player form', () => {
    component.initPlayerForm();
    expect(component.playerForm.valid).toBeFalse();
  });

  it('should initialize and validate result form', () => {
    component.initResultForm();
    expect(component.resultForm.valid).toBeFalse();
  });


  it('should not save player if form is invalid', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initPlayerForm();
    component.playerForm.patchValue({});
    component.savePlayer();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Formulario inválido o torneo no definido', 'error');
  });

  it('should replace image with fallback on error', () => {
    const mockEvent = {
      target: { src: 'original.jpg' }
    } as any;

    component.onImgError(mockEvent, 'fallback.jpg');
    expect(mockEvent.target.src).toBe('fallback.jpg');
  });

  it('should clear result filters and reload results', () => {
    component.selectedBranch = 'A';
    component.selectedRound = 2;
    spyOn(component, 'loadResults');

    component.clearFilters();

    expect(component.selectedBranch).toBe('');
    expect(component.selectedRound).toBeNull();
    expect(component.loadResults).toHaveBeenCalled();
  });


  it('should open modal', () => {
    const modalRef = { componentInstance: {} };
    modalSpy.open.and.returnValue(modalRef as any);

    component.openModal({} as any);
    expect(modalSpy.open).toHaveBeenCalled();
  });

  it('should close modal and reset IDs', () => {
    component.idPlayer = 5;
    component.idResult = 10;

    component.closeModal();
    expect(modalSpy.dismissAll).toHaveBeenCalled();
    expect(component.idPlayer).toBeNull();
    expect(component.idResult).toBeNull();
  });

  it('should not delete player if user cancels', fakeAsync(() => {
    component.tournamentId = 1;
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);

    component.deletePlayer(123);
    tick();

    httpMock.expectNone(`${component['apiUrl']}/registrations/123`);
  }));

  it('should filter players by branch', () => {
    component.registrations = [
      { branchName: 'Branch A' } as any,
      { branchName: 'Branch B' } as any
    ];

    component.selectedBranchPlayer = 'Branch A';
    component.onFilterPlayerChange();

    expect(component.filteredRegistrations.length).toBe(1);
  });


  it('should clear player filters', () => {
    component.selectedBranchPlayer = 'Branch X';
    spyOn(component, 'onFilterPlayerChange');
    component.clearPlayerFilters();
    expect(component.selectedBranchPlayer).toBe('');
    expect(component.onFilterPlayerChange).toHaveBeenCalled();
  });

  it('should navigate back', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });
});

