import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentsComponent } from './tournaments.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TournamentsService } from 'src/app/services/tournaments.service';
import { BranchesService } from 'src/app/services/branch-api.service';

describe('TournamentsComponent', () => {
  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let branchesServiceSpy: jasmine.SpyObj<BranchesService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;

  const mockTournament = {
    tournamentId: 1,
    name: 'Torneo Prueba',
    organizer: 'Organizador',
    categories: [{ categoryId: 1, name: 'Cat A', status: true }],
    modalities: [{ modalityId: 1, name: 'Mod A', status: true }],
    branches: [{ branchId: 1, name: 'Branch A', description: '', status: true }],
    ambit: { ambitId: 1, name: 'Nacional' },
    startDate: new Date(),
    endDate: new Date(),
    stage: 'Programado',
    status: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentsComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [
        {
          provide: TournamentsService,
          useValue: jasmine.createSpyObj('TournamentsService', [
            'getTournaments', 'getModalities', 'getCategories', 'getAmbits',
            'getDepartments', 'createTournament', 'updateTournament', 'deleteTournament'
          ])
        },
        {
          provide: BranchesService,
          useValue: jasmine.createSpyObj('BranchesService', ['getAll'])
        },
        {
          provide: NgbModal,
          useValue: jasmine.createSpyObj('NgbModal', ['open', 'dismissAll'])
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    branchesServiceSpy = TestBed.inject(BranchesService) as jasmine.SpyObj<BranchesService>;
    modalSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  // ------------------ BASICS ------------------
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadData on init', () => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    expect(component.loadData).toHaveBeenCalled();
  });

  // ------------------ LOAD DATA ------------------
  it('should load tournaments correctly', () => {
    tournamentsServiceSpy.getTournaments.and.returnValue(
      of({ success: true, message: '', data: [mockTournament] })
    );
    component.getTournaments();
    expect(component.tournaments.length).toBe(1);
    expect(component.tournaments[0].name).toBe('Torneo Prueba');
  });

  it('should load modalities, categories, ambits, branches and departments', () => {
    tournamentsServiceSpy.getTournaments.and.returnValue(
      of({ success: true, message: '', data: [] })
    );
    tournamentsServiceSpy.getModalities.and.returnValue(
      of({ success: true, message: '', data: [{ modalityId: 1, name: 'Mod A', status: true }] })
    );
    tournamentsServiceSpy.getCategories.and.returnValue(
      of({ success: true, message: '', data: [{ categoryId: 1, name: 'Cat A', status: true }] })
    );
    tournamentsServiceSpy.getAmbits.and.returnValue(
      of({ success: true, message: '', data: [{ ambitId: 1, name: 'Ambit A' }] })
    );
    tournamentsServiceSpy.getDepartments.and.returnValue(of([{ id: 1, name: 'Dept A' }]));
    branchesServiceSpy.getAll.and.returnValue(of([{ branchId: 1, name: 'Branch A', description: '', status: true }]));

    component.loadData();

    expect(component.modalities[0].name).toBe('Mod A');
    expect(component.categories[0].name).toBe('Cat A');
    expect(component.ambits[0].name).toBe('Ambit A');
    expect(component.departments[0].name).toBe('Dept A');
    expect(component.branches[0].name).toBe('Branch A');
  });

  // ------------------ FILTERS / UTILS ------------------
  it('should clear filter', () => {
    component.filter = 'abc';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should return formatted strings correctly', () => {
    expect(component.getModalitiesString(mockTournament as any)).toBe('Mod A');
    expect(component.getCategoriesString(mockTournament as any)).toBe('Cat A');
    expect(component.getBranchesString(mockTournament as any)).toBe('Branch A');
  });

  it('should return "-" when arrays are empty', () => {
    expect(component.getModalitiesString({ modalities: [] } as any)).toBe('-');
  });

 it('should format date properly with toYMDStrict()', () => {
  const date = new Date('2025-05-10T00:00:00');
  const result = component.toYMDStrict(date);

  // Normaliza tanto el valor esperado como el resultado para evitar diferencias de zona horaria
  const expected = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
    .toISOString()
    .split('T')[0];

  expect(result).toBe(expected);
});


  // ------------------ MODALS ------------------
  it('should open and close modal correctly', () => {
    component.initForm();
    component.openModal({});
    expect(modalSpy.open).toHaveBeenCalled();

    component.closeModal();
    expect(modalSpy.dismissAll).toHaveBeenCalled();
    expect(component.idTournament).toBeNull();
  });

  it('should open modal for set result tournament', () => {
    component.openModalSetResultTournament(mockTournament as any);
    expect(component.selectedTournament).toEqual(mockTournament);
    expect(modalSpy.open).toHaveBeenCalled();
  });

  // ------------------ SAVE FORM ------------------
  it('should save new tournament successfully', fakeAsync(() => {
    spyOn(Swal, 'fire');
    component.initForm();
    component.tournamentForm.patchValue({
      name: 'Nuevo Torneo',
      organizer: 'Org',
      modalityIds: [1],
      categoryIds: [1],
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      ambitId: 1,
      branchIds: [1],
      location: 'Loc',
      stage: 'Programado',
      status: true
    });

    tournamentsServiceSpy.createTournament.and.returnValue(of({ success: true }));
    tournamentsServiceSpy.getTournaments.and.returnValue(of({ success: true, message: '', data: [] }));

    component.saveForm();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Torneo creado', 'success');
  }));

  it('should handle error when saving tournament', fakeAsync(() => {
    spyOn(Swal, 'fire');
    component.initForm();
    component.tournamentForm.patchValue({
      name: 'Nuevo Torneo',
      organizer: 'Org',
      modalityIds: [1],
      categoryIds: [1],
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      ambitId: 1,
      branchIds: [1],
      location: 'Loc',
      stage: 'Programado',
      status: true
    });

    tournamentsServiceSpy.createTournament.and.returnValue(
      throwError(() => ({ error: { message: 'Error al guardar' } }))
    );

    component.saveForm();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error al guardar torneo',
      text: 'Error al guardar'
    }));
  }));

  // ------------------ DELETE ------------------
  it('should delete tournament successfully', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    tournamentsServiceSpy.deleteTournament.and.returnValue(of({ success: true }));
    tournamentsServiceSpy.getTournaments.and.returnValue(of({ success: true, message: '', data: [] }));

    component.deleteTournament(1);
    tick();

    expect(tournamentsServiceSpy.deleteTournament).toHaveBeenCalledWith(1);
  }));

  it('should handle delete error gracefully', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    tournamentsServiceSpy.deleteTournament.and.returnValue(
      throwError(() => ({ error: { message: 'Error al eliminar' } }))
    );

    component.deleteTournament(1);
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error al eliminar torneo',
      text: 'Error al eliminar'
    }));
  }));
});
