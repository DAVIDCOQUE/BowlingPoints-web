import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
    component = fixture.componentInstance;

    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    userApiSpy = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    resultsServiceSpy = TestBed.inject(ResultsService) as jasmine.SpyObj<ResultsService>;
    modalSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
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
        branches: [{ branchId: 1, name: 'Branch A', description: '', status: true }]
      }
    };

    tournamentsServiceSpy.getTournamentById.and.returnValue(of(mockTournament));
    userApiSpy.getActiveUsers.and.returnValue(of([]));
    resultsServiceSpy.getResultsFiltered.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

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
        // Campos opcionales omitidos por simplicidad
      }
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

  it('should initialize and validate player form', () => {
    component.initPlayerForm();
    expect(component.playerForm.valid).toBeFalse();
  });

  it('should initialize and validate result form', () => {
    component.initResultForm();
    expect(component.resultForm.valid).toBeFalse();
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
        branchName: 'Branch A'
      }
    ];
    resultsServiceSpy.getResultsFiltered.and.returnValue(of(results));
    component.loadResults();
    tick();
    expect(component.results.length).toBe(1);
  }));

  it('should handle loadResults error', () => {
    component.tournamentId = 1;
    spyOn(Swal, 'fire');
    resultsServiceSpy.getResultsFiltered.and.returnValue(throwError(() => new Error()));
    component.loadResults();
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should not save player if form is invalid', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initPlayerForm();
    component.playerForm.patchValue({});
    component.savePlayer();
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Formulario inválido o torneo no definido', 'error');
  });

  it('should not save result if form is invalid', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initResultForm();
    component.resultForm.patchValue({});
    component.saveResult();
    expect(Swal.fire).toHaveBeenCalledWith('Error', 'Formulario inválido o torneo no definido', 'error');
  });

  it('should handle image fallback', () => {
    const event = { target: { src: 'img.jpg' } } as any;
    component.onImgError(event, 'fallback.jpg');
    expect(event.target.src).toBe('fallback.jpg');
  });

  it('should open and close modal', () => {
    const fakeTemplateRef: any = {};
    component.openModal(fakeTemplateRef);
    expect(modalSpy.open).toHaveBeenCalled();

    component.closeModal();
    expect(modalSpy.dismissAll).toHaveBeenCalled();
    expect(component.idPlayer).toBeNull();
    expect(component.idResult).toBeNull();
  });

  it('should navigate back', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should filter players by branch', () => {
    component.registrations = [
      { branchName: 'Branch A' } as any,
      { branchName: 'Branch B' } as any
    ];

    component.selectedBranchPlayer = 'branch a';
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

  it('should clear filters and reload results', () => {
    spyOn(component, 'loadResults');
    component.selectedBranch = 'A';
    component.selectedRound = 5;

    component.clearFilters();

    expect(component.selectedBranch).toBe('');
    expect(component.selectedRound).toBeNull();
    expect(component.loadResults).toHaveBeenCalled();
  });
});
