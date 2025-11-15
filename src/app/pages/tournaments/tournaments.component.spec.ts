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
import { AmbitApiService } from 'src/app/services/ambit-api.service';
import { ModalityApiService } from 'src/app/services/modality-api.service';
import { CategoryApiService } from 'src/app/services/category-api.service';

describe('TournamentsComponent', () => {
  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;

  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let branchesServiceSpy: jasmine.SpyObj<BranchesService>;
  let ambitApiServiceSpy: jasmine.SpyObj<AmbitApiService>;
  let modalityApiServiceSpy: jasmine.SpyObj<ModalityApiService>;
  let categoryApiServiceSpy: jasmine.SpyObj<CategoryApiService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;

  function mockLoadData() {
    tournamentsServiceSpy.getTournaments.and.returnValue(of({ success: true, message: '', data: [] }));
    modalityApiServiceSpy.getActiveModalities.and.returnValue(of({ success: true, message: '', data: [] }));
    categoryApiServiceSpy.getActiveCategories.and.returnValue(of({ success: true, message: '', data: [] }));
    ambitApiServiceSpy.getActiveAmbits.and.returnValue(of({ success: true, message: '', data: [] }));
    tournamentsServiceSpy.getDepartments.and.returnValue(of([]));
    branchesServiceSpy.getAll.and.returnValue(of([]));
  }

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
          provide: NgbModal,
          useValue: jasmine.createSpyObj('NgbModal', ['open', 'dismissAll'])
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      // Override de todos los servicios inyectados con inject()
      .overrideProvider(TournamentsService, {
        useValue: jasmine.createSpyObj('TournamentsService', [
          'getTournaments', 'getDepartments', 'createTournament',
          'updateTournament', 'deleteTournament'
        ])
      })
      .overrideProvider(BranchesService, {
        useValue: jasmine.createSpyObj('BranchesService', ['getAll'])
      })
      .overrideProvider(AmbitApiService, {
        useValue: jasmine.createSpyObj('AmbitApiService', ['getActiveAmbits'])
      })
      .overrideProvider(ModalityApiService, {
        useValue: jasmine.createSpyObj('ModalityApiService', ['getActiveModalities'])
      })
      .overrideProvider(CategoryApiService, {
        useValue: jasmine.createSpyObj('CategoryApiService', ['getActiveCategories'])
      })
      .compileComponents();

    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;

    // Inyección de los spies
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    branchesServiceSpy = TestBed.inject(BranchesService) as jasmine.SpyObj<BranchesService>;
    ambitApiServiceSpy = TestBed.inject(AmbitApiService) as jasmine.SpyObj<AmbitApiService>;
    modalityApiServiceSpy = TestBed.inject(ModalityApiService) as jasmine.SpyObj<ModalityApiService>;
    categoryApiServiceSpy = TestBed.inject(CategoryApiService) as jasmine.SpyObj<CategoryApiService>;
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

  it('should load all initial data', () => {
    tournamentsServiceSpy.getTournaments.and.returnValue(of({ success: true, message: '', data: [] }));
    modalityApiServiceSpy.getActiveModalities.and.returnValue(of({ success: true, message: '', data: [{ modalityId: 1, name: 'Mod A', status: true }] }));
    categoryApiServiceSpy.getActiveCategories.and.returnValue(of({ success: true, message: '', data: [{ categoryId: 1, name: 'Cat A', status: true }] }));
    ambitApiServiceSpy.getActiveAmbits.and.returnValue(of({ success: true, message: '', data: [{ ambitId: 1, name: 'Ambit A' }] }));
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
    expect(result).toBe('2025-05-10');
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
    const fireSpy = spyOn(Swal, 'fire');

    mockLoadData();
    tournamentsServiceSpy.createTournament.and.returnValue(of({ success: true }));

    component.ngOnInit();
    fixture.detectChanges(); // 👈 IMPORTANTE para activar validaciones

    component.modalities = [{ modalityId: 1, name: 'Mod A', status: true }];
    component.categories = [{ categoryId: 1, name: 'Cat A', status: true }];
    component.ambits = [{ ambitId: 1, name: 'Nacional' }];
    component.branches = [{ branchId: 1, name: 'Branch A', description: '', status: true }];

    component.tournamentForm.patchValue({
      name: 'Nuevo Torneo',
      organizer: 'Org',
      modalityIds: [1],
      categoryIds: [1],
      startDate: '2099-01-01',
      endDate: '2099-01-02',
      ambitId: 1,
      branchIds: [1],
      location: 'Loc',
      stage: 'Programado',
      status: true
    });

    component.saveForm();
    tick();

    expect(fireSpy).toHaveBeenCalledWith('Éxito', 'Torneo creado', 'success');
  }));

  it('should handle error when saving tournament', fakeAsync(() => {
    const fireSpy = spyOn(Swal, 'fire');

    // 🔥 Necesario para evitar undefined.subscribe()
    mockLoadData();

    tournamentsServiceSpy.createTournament.and.returnValue(
      throwError(() => ({
        error: { message: 'Error al guardar' }
      }))
    );

    component.ngOnInit();
    fixture.detectChanges();

    component.modalities = [{ modalityId: 1, name: 'Mod A', status: true }];
    component.categories = [{ categoryId: 1, name: 'Cat A', status: true }];
    component.ambits = [{ ambitId: 1, name: 'Nacional' }];
    component.branches = [{ branchId: 1, name: 'Branch A', description: '', status: true }];

    component.tournamentForm.patchValue({
      name: 'Nuevo Torneo',
      organizer: 'Org',
      modalityIds: [1],
      categoryIds: [1],
      startDate: '2099-01-01',
      endDate: '2099-01-02',
      ambitId: 1,
      branchIds: [1],
      location: 'Loc',
      stage: 'Programado',
      status: true
    });

    component.saveForm();
    tick();

    expect(fireSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error al guardar torneo',
      text: 'Error al guardar',
      confirmButtonText: 'Aceptar'
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

  it('should patch form and open modal on editTournament with full tournament object', () => {
    const fullTournament = {
      tournamentId: 123,
      name: 'Edit Torneo',
      organizer: 'Editor',
      startDate: '2025-05-01',
      endDate: '2025-05-10',
      categories: [{ categoryId: 1 }],
      modalities: [{ modalityId: 2 }],
      ambit: { ambitId: 3 },
      branches: [{ branchId: 4 }],
      location: 'Ciudad',
      stage: 'En curso',
      status: true
    };

    spyOn(component, 'openModal');
    component.initForm();
    component.editTournament(fullTournament as any);

    expect(component.tournamentForm.get('name')?.value).toBe('Edit Torneo');
    expect(component.tournamentForm.get('ambitId')?.value).toBe(3);
    expect(component.tournamentForm.get('modalityIds')?.value).toEqual([2]);
    expect(component.openModal).toHaveBeenCalled();
  });

  it('should filter tournaments by name', () => {
    component.tournaments = [
      { name: 'Copa Nacional' } as any,
      { tournamentName: 'Liga Regional' } as any,
    ];
    component.filter = 'nacional';

    const filtered = component.filteredTournaments;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Copa Nacional');
  });




  it('should handle error when opening modal', () => {
    const brokenModalService = {
      open: () => { throw new Error('Modal error'); }
    } as any;

    (component as any).modalService = brokenModalService;

    spyOn(Swal, 'fire');

    component.openModal({}); // Causa error

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Error al abrir modal'
    }));
  });


  it('should handle error when closing modal', () => {
    const brokenModalService = {
      dismissAll: () => { throw new Error('Close error'); }
    } as any;

    (component as any).modalService = brokenModalService;

    spyOn(Swal, 'fire');

    component.closeModal();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Error al cerrar modal'
    }));
  });

  it('should return null in toYMDStrict for invalid inputs', () => {
    expect(component.toYMDStrict(null)).toBeNull();
    expect(component.toYMDStrict(undefined)).toBeNull();
    expect(component.toYMDStrict('not a date')).toBeNull();
    expect(component.toYMDStrict({})).toBeNull();
  });

  it('should return valid string directly in toYMDStrict', () => {
    expect(component.toYMDStrict('2025-11-01')).toBe('2025-11-01');
  });

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
