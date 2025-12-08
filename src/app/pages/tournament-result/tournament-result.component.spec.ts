import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ITeam } from 'src/app/model/team.interface';
import { HttpClient } from '@angular/common/http';

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

  it('should skip loading registered players if tournamentId is null', () => {
    component.tournamentId = null;
    component.loadRegisteredPlayers();
    expect(component.registrations.length).toBe(0);
  });


  it('should init player form when opening player modal', () => {
    const spy = spyOn<any>(component, 'initPlayerForm');
    component.idPlayer = null;
    component.modalPlayerRef = {} as any;
    component.openModal(component.modalPlayerRef);
    expect(spy).toHaveBeenCalled();
  });

  it('should init result form when opening result modal', () => {
    const spy = spyOn<any>(component, 'initResultForm');
    component.idResult = null;
    component.modalResultRef = {} as any;
    component.openModal(component.modalResultRef);
    expect(spy).toHaveBeenCalled();
  });

  it('should init team form when opening team modal', () => {
    const spy = spyOn<any>(component, 'initTeamForm');
    component.idTeam = null;
    component.modalTeamRef = {} as any;
    component.openModal(component.modalTeamRef);
    expect(spy).toHaveBeenCalled();
  });


  it('should prevent saving result when neither personId nor teamId is set', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initResultForm();
    component.resultForm.patchValue({
      personId: null,
      teamId: null,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      roundNumber: 1,
      laneNumber: 1,
      lineNumber: 1,
      score: 100,
    });

    component.saveResult();

    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Debe seleccionar al menos un jugador o un equipo.',
      'error'
    );
  });

  it('should prevent saving result when teamId is set but personId is not', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initResultForm();
    component.resultForm.patchValue({
      personId: null,
      teamId: 99,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      roundNumber: 1,
      laneNumber: 1,
      lineNumber: 1,
      score: 100,
    });

    component.saveResult();

    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Debe seleccionar un jugador cuando se elige un equipo.',
      'error'
    );
  });

  it('should not save team if form is invalid', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initTeamForm(); // Inicializa vacío (inválido)
    component.saveTeam();

    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Formulario inválido o torneo no definido',
      'error'
    );
  });

  it('should handle error in saveResult()', fakeAsync(() => {
    component.tournamentId = 1;
    component.initResultForm();
    component.resultForm.patchValue({
      personId: 1,
      teamId: 2,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      roundNumber: 1,
      laneNumber: 1,
      lineNumber: 1,
      score: 100,
    });

    spyOn(Swal, 'fire');
    component.saveResult();

    const req = httpMock.expectOne(`${component['apiUrl']}/results`);
    req.flush({ message: 'Error en backend' }, { status: 500, statusText: 'Server Error' });

    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Error en backend', 'error');
  }));

  it('should save a new team (POST)', fakeAsync(() => {
    component.tournamentId = 1;
    component.idTeam = null;
    component.initTeamForm();

    component.teamForm.patchValue({
      nameTeam: 'Equipo A',
      phone: '123456',
      playerIds: [1, 2],
      categoryId: 1,
      modalityId: 1,
      status: true
    });

    spyOn(Swal, 'fire');
    spyOn(component, 'closeModal');
    spyOn(component, 'loadRegisteredPlayers');

    component.saveTeam();

    const req = httpMock.expectOne(`${component['apiUrl']}/teams`);
    expect(req.request.method).toBe('POST');
    req.flush({}); // Simulamos respuesta exitosa

    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Equipo creado correctamente', 'success');
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.loadRegisteredPlayers).toHaveBeenCalled();
  }));

  it('should update an existing team (PUT)', fakeAsync(() => {
    component.tournamentId = 1;
    component.idTeam = 123;
    component.initTeamForm();

    component.teamForm.patchValue({
      nameTeam: 'Equipo Editado',
      phone: '987654',
      playerIds: [3, 4],
      categoryId: 1,
      modalityId: 1,
      status: true
    });

    spyOn(Swal, 'fire');
    spyOn(component, 'closeModal');
    spyOn(component, 'loadRegisteredPlayers');

    component.saveTeam();

    const req = httpMock.expectOne(`${component['apiUrl']}/teams/123`);
    expect(req.request.method).toBe('PUT');
    req.flush({});

    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Equipo actualizado correctamente', 'success');
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.loadRegisteredPlayers).toHaveBeenCalled();
  }));


  it('should show error if selected player file is invalid', () => {
    const mockEvent = {
      target: {
        files: [{ name: 'archivo.txt' }],
      },
    };

    spyOn(Swal, 'fire');
    component.onPlayersFileSelected(mockEvent);
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Solo se permiten archivos Excel o CSV', 'error');
  });

  it('should return unique players', () => {
    component['filteredRegistrations'] = [
      { personId: 1, personFullName: 'Jugador Uno' },
      { personId: 1, personFullName: 'Jugador Uno' }, // duplicado
      { personId: 2, personFullName: null },          // sin nombre
      { personId: null, personFullName: 'Jugador Null' }, // sin ID
    ] as any;

    const result = component.uniquePlayers;

    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ personId: 1, personFullName: 'Jugador Uno' });
    expect(result[1]).toEqual({ personId: 2, personFullName: 'N/A' });
  });


  it('should return unique teams', () => {
    component['filteredRegistrations'] = [
      { teamId: 10, teamName: 'Team A' },
      { teamId: 10, teamName: 'Team A' }, // duplicado
      { teamId: 20, teamName: 'Team B' },
      { teamId: null, teamName: 'Team C' }, // sin ID
    ] as any;

    const result = component.uniqueTeams;

    expect(result.length).toBe(2);
    expect(result).toContain(jasmine.objectContaining({ teamId: 10, nameTeam: 'Team A' }));
    expect(result).toContain(jasmine.objectContaining({ teamId: 20, nameTeam: 'Team B' }));
  });


  it('should not delete result if ID is invalid', () => {
    spyOn(Swal, 'fire');
    component.deleteResult(undefined);
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'ID de resultado no válido', 'error');
  });


  it('should call executeDeleteResult when user confirms', fakeAsync(() => {
    component.tournamentId = 1;
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    spyOn<any>(component, 'executeDeleteResult');

    component.deleteResult(123);
    tick();

    expect(component['executeDeleteResult']).toHaveBeenCalledWith(123);
  }));

  it('should return unique players by personId', () => {
    component.filteredRegistrations = [
      { personId: 1, personFullName: 'Player One' },
      { personId: 2, personFullName: 'Player Two' },
      { personId: 1, personFullName: 'Player One' }, // duplicado
    ] as any;

    const result = component.uniquePlayers;
    expect(result.length).toBe(2);
    expect(result).toEqual([
      { personId: 1, personFullName: 'Player One' },
      { personId: 2, personFullName: 'Player Two' },
    ]);
  });

  it('should return unique teams by teamId', () => {
    component.filteredRegistrations = [
      { teamId: 1, teamName: 'Team A' },
      { teamId: 2, teamName: 'Team B' },
      { teamId: 1, teamName: 'Team A' }, // duplicado
    ] as any;

    const result = component.uniqueTeams;
    expect(result.length).toBe(2);
    expect(result).toEqual([
      { teamId: 1, nameTeam: 'Team A' },
      { teamId: 2, nameTeam: 'Team B' },
    ]);
  });

  it('should group registrations by modalityName', () => {
    component.filteredRegistrations = [
      { modalityName: 'Doble', personId: 1 } as any,
      { modalityName: 'Doble', personId: 2 } as any,
      { modalityName: 'Individual', personId: 3 } as any,
      { personId: 4 } as any, // Sin modalidad
    ];

    const grouped = component.groupedRegistrations;

    expect(grouped.length).toBe(3);

    const modalityNames = grouped.map(g => g.modality);
    expect(modalityNames).toContain('Doble');
    expect(modalityNames).toContain('Individual');
    expect(modalityNames).toContain('Sin modalidad');

    const sinModalidad = grouped.find(g => g.modality === 'Sin modalidad');
    expect(sinModalidad?.players.length).toBe(1);
  });


  it('should group registrations by modalityName', () => {
    component.filteredRegistrations = [
      { modalityName: 'Doble', personId: 1 } as any,
      { modalityName: 'Doble', personId: 2 } as any,
      { modalityName: 'Individual', personId: 3 } as any,
      { personId: 4 } as any, // Sin modalidad
    ];

    const grouped = component.groupedRegistrations;

    expect(grouped.length).toBe(3);

    const modalityNames = grouped.map(g => g.modality);
    expect(modalityNames).toContain('Doble');
    expect(modalityNames).toContain('Individual');
    expect(modalityNames).toContain('Sin modalidad');

    const sinModalidad = grouped.find(g => g.modality === 'Sin modalidad');
    expect(sinModalidad?.players.length).toBe(1);
  });

  it('should show error if resultId is invalid', () => {
    spyOn(Swal, 'fire');
    component.deleteResult(undefined);
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'ID de resultado no válido', 'error');
  });


  it('should not call executeDeleteResult if user cancels', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    const spy = spyOn<any>(component, 'executeDeleteResult');

    component.deleteResult(123);
    tick();
    expect(spy).not.toHaveBeenCalled();
  }));


  it('should not upload if no file is selected', () => {
    const fakeEvent = { target: { files: [] } };
    component.onResultFileSelected(fakeEvent);
    // No error esperado pero tampoco debe lanzar nada
  });

  it('should show error for invalid extension', () => {
    const fakeFile = new File([''], 'test.txt');
    const fakeEvent = { target: { files: [fakeFile] } };
    spyOn(Swal, 'fire');

    component.tournamentId = 1;
    component.onResultFileSelected(fakeEvent);

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Solo se permiten archivos Excel o CSV', 'error');
  });

  it('should show error if tournamentId is missing', () => {
    const fakeFile = new File([''], 'test.xlsx');
    const fakeEvent = { target: { files: [fakeFile] } };
    spyOn(Swal, 'fire');

    component.tournamentId = null;
    component.onResultFileSelected(fakeEvent);

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No hay torneo seleccionado para cargar resultados', 'error');
  });

  it('should return unique players based on personId', () => {
    component.filteredRegistrations = [
      { personId: 1, personFullName: 'John Doe' } as any,
      { personId: 2, personFullName: 'Jane Doe' } as any,
      { personId: 1, personFullName: 'John Doe' } as any,
    ];

    const unique = component.uniquePlayers;
    expect(unique.length).toBe(2);
    expect(unique).toEqual([
      { personId: 1, personFullName: 'John Doe' },
      { personId: 2, personFullName: 'Jane Doe' },
    ]);
  });


  it('should return unique teams based on teamId', () => {
    component.filteredRegistrations = [
      { teamId: 1, teamName: 'Team A' } as any,
      { teamId: 2, teamName: 'Team B' } as any,
      { teamId: 1, teamName: 'Team A' } as any,
    ];

    const teams = component.uniqueTeams;
    expect(teams.length).toBe(2);
    expect(teams).toEqual([
      { teamId: 1, nameTeam: 'Team A' },
      { teamId: 2, nameTeam: 'Team B' },
    ]);
  });

  it('should group registrations by modalityName', () => {
    component.filteredRegistrations = [
      { modalityName: 'Doble' } as any,
      { modalityName: 'Individual' } as any,
      { modalityName: 'Doble' } as any,
    ];

    const grouped = component.groupedRegistrations;
    expect(grouped.length).toBe(2);
    expect(grouped.find(g => g.modality === 'Doble')?.players.length).toBe(2);
    expect(grouped.find(g => g.modality === 'Individual')?.players.length).toBe(1);
  });

  it('should show error when deleteResult is called without valid id', () => {
    spyOn(Swal, 'fire');
    component.deleteResult(undefined);
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'ID de resultado no válido', 'error');
  });

  it('should call executeDeleteResult when user confirms deletion', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    spyOn<any>(component, 'executeDeleteResult');

    component.deleteResult(123);
    tick();

    expect(component['executeDeleteResult']).toHaveBeenCalledWith(123);
  }));

  it('should show error for invalid result file extension', () => {
    spyOn(Swal, 'fire');
    const mockEvent = {
      target: {
        files: [new File(['dummy content'], 'test.txt')],
      },
    };

    component.tournamentId = 1;
    component.onResultFileSelected(mockEvent as any);

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Solo se permiten archivos Excel o CSV', 'error');
  });

  it('should show error if no tournamentId when uploading players', () => {
    spyOn(Swal, 'fire');
    const mockEvent = {
      target: {
        files: [new File(['dummy'], 'players.xlsx')],
      },
    };

    component.tournamentId = null;
    component.onPlayersFileSelected(mockEvent as any);

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No hay torneo seleccionado para cargar jugadores', 'error');
  });


  it('should call Swal in handlePlayerError', () => {
    spyOn(Swal, 'fire');
    component['handlePlayerError']({ error: { message: 'Fallo' } });
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Fallo', 'error');
  });

  it('should patch form and open modal for editPlayer', () => {
    const spy = spyOn(component, 'openModal');

    component.initPlayerForm(); // 💥 Necesario

    const reg = {
      registrationId: 10,
      personId: 1,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      teamId: 2,
      status: true
    } as any;

    component.modalPlayerRef = {} as any;
    component.editPlayer(reg);

    expect(component.idPlayer).toBe(10);
    expect(component.playerForm.value.personId).toBe(1); // Ya no fallará
    expect(spy).toHaveBeenCalledWith(component.modalPlayerRef);
  });


  it('should upload players file successfully', fakeAsync(() => {
    component.tournamentId = 1;
    const mockFile = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const mockEvent = { target: { files: [mockFile] } };

    spyOn(Swal, 'fire');
    spyOn(component, 'loadPlayers');

    component.onPlayersFileSelected(mockEvent);

    const req = httpMock.expectOne(`${component['apiUrl']}/players/upload`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Jugadores cargados correctamente', 'success');
    expect(component.loadPlayers).toHaveBeenCalled();
    expect(component.isUploadingPlayers).toBeFalse();
  }));


  it('should show error if file upload fails', fakeAsync(() => {
    component.tournamentId = 1;
    const mockFile = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const mockEvent = { target: { files: [mockFile] } };

    spyOn(Swal, 'fire');
    spyOn(console, 'error');

    component.onPlayersFileSelected(mockEvent);

    const req = httpMock.expectOne(`${component['apiUrl']}/players/upload`);
    req.error(new ErrorEvent('Network error'));

    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo cargar el archivo', 'error');
    expect(console.error).toHaveBeenCalled();
    expect(component.isUploadingPlayers).toBeFalse();
  }));

  it('should upload results file successfully', fakeAsync(() => {
    component.tournamentId = 1;
    const mockFile = new File(['dummy'], 'results.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const mockEvent = { target: { files: [mockFile] } };

    spyOn(Swal, 'fire');
    spyOn(component, 'loadResults');

    component.onResultFileSelected(mockEvent);

    const req = httpMock.expectOne(`${component['apiUrl']}/results/upload`);
    expect(req.request.method).toBe('POST');
    req.flush({}); // respuesta simulada

    tick();

    expect(component.isUploadingResults).toBeFalse();
    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Resultados cargados correctamente', 'success');
    expect(component.loadResults).toHaveBeenCalled();
  }));


  it('should show error if result file upload fails', fakeAsync(() => {
    component.tournamentId = 1;
    const mockFile = new File(['dummy'], 'results.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const mockEvent = { target: { files: [mockFile] } };

    spyOn(Swal, 'fire');
    spyOn(console, 'error');

    component.onResultFileSelected(mockEvent);

    const req = httpMock.expectOne(`${component['apiUrl']}/results/upload`);
    req.error(new ErrorEvent('Network error'));

    tick();

    expect(component.isUploadingResults).toBeFalse();
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'No se pudo cargar el archivo', 'error');
    expect(console.error).toHaveBeenCalled();
  }));

  it('should return false when branch does not match p.branchName', () => {
    const result = component['matchesBranch']('juvenil')({ branchName: 'mayores' });
    expect(result).toBeFalse(); // correcto
  });

  it('should return true when branch matches p.branchName', () => {
    const result = component['matchesBranch']('juvenil')({ branchName: 'rama juvenil femenino' });
    expect(result).toBeTrue(); // correcto
  });

  it('should return true when branch filter is empty', () => {
    const result = component['matchesBranch']('')({ branchName: 'cualquiera' });
    expect(result).toBeTrue();
  });

  it('should patch the form and open modal for editTeam', () => {
    const mockTeam: ITeam = {
      teamId: 1,
      nameTeam: 'Team A',
      phone: '123456789',
      members: [
        { personId: 1001 } as IUser,
        { personId: 1002 } as IUser
      ],
      categoryId: 5,
      modalityId: 2,
      status: true,
    };

    const patchSpy = spyOn(component.teamForm, 'patchValue');
    const modalSpy = spyOn(component as any, 'openModal');

    component.editTeam(mockTeam);

    expect(component.idTeam).toBe(mockTeam.teamId);

    expect(patchSpy).toHaveBeenCalledWith({
      nameTeam: mockTeam.nameTeam,
      phone: mockTeam.phone,
      playerIds: [1001, 1002],
      categoryId: mockTeam.categoryId,
      modalityId: mockTeam.modalityId,
      status: mockTeam.status,
    });

    expect(modalSpy).toHaveBeenCalledWith(component['modalTeamRef']);
  });


  it('should call handleDeleteSuccess on successful delete', () => {
    const id = 123;

    const spySuccess = spyOn(component as any, 'handleDeleteSuccess');
    const spyError = spyOn(component as any, 'handleDeleteError');

    // Usa la instancia de HttpClient inyectada
    const httpDeleteSpy = spyOn(component['http'], 'delete').and.returnValue(of({}));

    // Ejecuta la función
    (component as any).executeDeleteResult(id);

    // Aserciones
    expect(httpDeleteSpy).toHaveBeenCalledWith(`${component['apiUrl']}/results/${id}`);
    expect(spySuccess).toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });

  it('should call handleDeleteError on failed delete', () => {
    const id = 123;
    const spySuccess = spyOn(component as any, 'handleDeleteSuccess');
    const spyError = spyOn(component as any, 'handleDeleteError');

    // ❗ Espía sobre la instancia del servicio, no la clase
    const httpDeleteSpy = spyOn(component['http'], 'delete').and.returnValue(
      throwError(() => new Error('Error'))
    );

    (component as any).executeDeleteResult(id);

    expect(httpDeleteSpy).toHaveBeenCalledWith(`${component['apiUrl']}/results/${id}`);
    expect(spyError).toHaveBeenCalled();
    expect(spySuccess).not.toHaveBeenCalled();
  });

  it('should show error if form is invalid or tournamentId is missing', () => {
    component.tournamentId = null;
    const markSpy = spyOn(component.resultForm, 'markAllAsTouched');
    const swalSpy = spyOn(Swal, 'fire');

    component.saveResult();

    expect(markSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'Formulario inválido o torneo no definido',
      'error'
    );
  });

  it('should show error if form is invalid', () => {
    component.tournamentId = 1;

    component.resultForm = new FormGroup({
      categoryId: new FormControl(null, Validators.required)
    });

    const markSpy = spyOn(component.resultForm, 'markAllAsTouched');
    const swalSpy = spyOn(Swal, 'fire');

    component.saveResult();

    expect(markSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'Formulario inválido o torneo no definido',
      'error'
    );
  });

  it('should call handleDeleteSuccess on successful delete', () => {
    const id = 123;

    const spySuccess = spyOn(component as any, 'handleDeleteSuccess');
    const spyError = spyOn(component as any, 'handleDeleteError');

    const httpDeleteSpy = spyOn(component['http'], 'delete')
      .and.returnValue(of({}));

    (component as any).executeDeleteResult(id);

    expect(httpDeleteSpy).toHaveBeenCalledWith(`${component['apiUrl']}/results/${id}`);
    expect(spySuccess).toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });


  it('should call handleDeleteError on failed delete', () => {
    const id = 123;

    const spySuccess = spyOn(component as any, 'handleDeleteSuccess');
    const spyError = spyOn(component as any, 'handleDeleteError');

    const httpDeleteSpy = spyOn(component['http'], 'delete')
      .and.returnValue(throwError(() => new Error('Error')));

    (component as any).executeDeleteResult(id);

    expect(httpDeleteSpy).toHaveBeenCalledWith(`${component['apiUrl']}/results/${id}`);
    expect(spyError).toHaveBeenCalled();
    expect(spySuccess).not.toHaveBeenCalled();
  });


});

