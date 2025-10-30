import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TournamentsService } from 'src/app/services/tournaments.service';
import { ResultsService } from 'src/app/services/results.service';
import { UserApiService } from 'src/app/services/user-api.service';

describe('TournamentResultComponent', () => {
  let component: TournamentResultComponent;
  let fixture: ComponentFixture<TournamentResultComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let userApiServiceSpy: jasmine.SpyObj<UserApiService>;
  let resultsServiceSpy: jasmine.SpyObj<ResultsService>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentResultComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'tournamentId' ? '1' : null)
              }
            }
          }
        },
        {
          provide: TournamentsService,
          useValue: jasmine.createSpyObj('TournamentsService', ['getTournamentById'])
        },
        {
          provide: UserApiService,
          useValue: jasmine.createSpyObj('UserApiService', ['getUsers'])
        },
        {
          provide: ResultsService,
          useValue: jasmine.createSpyObj('ResultsService', ['getResultsFiltered'])
        },
        {
          provide: NgbModal,
          useValue: jasmine.createSpyObj('NgbModal', ['open', 'dismissAll'])
        },
        {
          provide: Location,
          useValue: jasmine.createSpyObj('Location', ['back'])
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentResultComponent);
    component = fixture.componentInstance;
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    userApiServiceSpy = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
    resultsServiceSpy = TestBed.inject(ResultsService) as jasmine.SpyObj<ResultsService>;
    modalServiceSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  // ----------------------------------------
  // TESTS BÁSICOS
  // ----------------------------------------

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournament data on init', fakeAsync(() => {
    const mockTournament = {
      success: true,
      message: '',
      data: {
        tournamentId: 1,
        name: 'Torneo Prueba',
        categories: [{ categoryId: 1, name: 'Cat A', status: true }],
        modalities: [{ modalityId: 1, name: 'Mod A', status: true }],
        branches: [{ branchId: 1, name: 'Branch A', description: '', status: true }]
      }
    };

    tournamentsServiceSpy.getTournamentById.and.returnValue(of(mockTournament));
    userApiServiceSpy.getUsers.and.returnValue(of([])); // evita error .subscribe()
    resultsServiceSpy.getResultsFiltered.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

    expect(component.selectedTournament?.name).toBe('Torneo Prueba');
    expect(component.categories.length).toBe(1);
    expect(component.modalities.length).toBe(1);
    expect(component.branches.length).toBe(1);
  }));

  it('should show alert if tournament not found', fakeAsync(() => {
    spyOn(Swal, 'fire');
    tournamentsServiceSpy.getTournamentById.and.returnValue(
      of({ success: true, message: '', data: null })
    );
    userApiServiceSpy.getUsers.and.returnValue(of([]));
    resultsServiceSpy.getResultsFiltered.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(
      'Atención',
      'No se encontró el torneo solicitado',
      'info'
    );
  }));

  it('should open and close modal correctly', () => {
    const fakeTemplateRef: any = {};
    component.openModal(fakeTemplateRef);
    expect(modalServiceSpy.open).toHaveBeenCalled();

    component.closeModal();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
    expect(component.idPlayer).toBeNull();
    expect(component.idResult).toBeNull();
  });

  it('should not save player if form is invalid', () => {
    spyOn(Swal, 'fire');
    component.tournamentId = 1;
    component.initPlayerForm();
    component.playerForm.patchValue({});

    component.savePlayer();
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Formulario inválido o torneo no definido',
      'error'
    );
  });

  it('should handle image fallback', () => {
    const event = { target: { src: 'original.jpg' } } as any;
    component.onImgError(event, 'fallback.jpg');
    expect(event.target.src).toBe('fallback.jpg');
  });

  it('should navigate back on goBack()', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  // ----------------------------------------
  // TESTS ADICIONALES (COBERTURA EXTRA)
  // ----------------------------------------

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
