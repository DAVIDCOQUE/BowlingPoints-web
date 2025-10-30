import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentsComponent } from './tournaments.component';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { BranchesService } from 'src/app/services/branch-api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { ITournament } from 'src/app/model/tournament.interface';

describe('TournamentsComponent', () => {
  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;
  let tournamentsServiceSpy: jasmine.SpyObj<TournamentsService>;
  let branchesServiceSpy: jasmine.SpyObj<BranchesService>;
  let modalSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    const tServiceSpy = jasmine.createSpyObj('TournamentsService', [
      'getTournaments',
      'getModalities',
      'getCategories',
      'getDepartments',
      'getAmbits',
      'createTournament',
      'updateTournament',
      'deleteTournament',
    ]);
    const bServiceSpy = jasmine.createSpyObj('BranchesService', ['getAll']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TournamentsComponent],
      providers: [
        { provide: TournamentsService, useValue: tServiceSpy },
        { provide: BranchesService, useValue: bServiceSpy },
        { provide: NgbModal, useValue: modalServiceSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;
    tournamentsServiceSpy = TestBed.inject(TournamentsService) as jasmine.SpyObj<TournamentsService>;
    branchesServiceSpy = TestBed.inject(BranchesService) as jasmine.SpyObj<BranchesService>;
    modalSpy = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadData on init', () => {
    tournamentsServiceSpy.getTournaments.and.returnValue(of({ success: true, message: '', data: [] }));
    tournamentsServiceSpy.getModalities.and.returnValue(of({ success: true, message: '', data: [] }));
    tournamentsServiceSpy.getCategories.and.returnValue(of({ success: true, message: '', data: [] }));
    tournamentsServiceSpy.getAmbits.and.returnValue(of({ success: true, message: '', data: [] }));
    branchesServiceSpy.getAll.and.returnValue(of([]));

    component.ngOnInit();

    expect(tournamentsServiceSpy.getTournaments).toHaveBeenCalled();
    expect(tournamentsServiceSpy.getModalities).toHaveBeenCalled();
    expect(tournamentsServiceSpy.getCategories).toHaveBeenCalled();
    expect(tournamentsServiceSpy.getDepartments).toHaveBeenCalled();
    expect(tournamentsServiceSpy.getAmbits).toHaveBeenCalled();
    expect(branchesServiceSpy.getAll).toHaveBeenCalled();
  });

  it('should patch form on editTournament', () => {
    const tournamentMock = {
      tournamentId: 1,
      name: 'Test Tournament',
      organizer: 'Org',
      categories: [{ categoryId: 1, name: 'Cat 1' }],
      modalities: [{ modalityId: 2, name: 'Mod 1' }],
      startDate: '2023-01-01',
      endDate: '2023-01-10',
      ambitId: 3,
      branches: [{ branchId: 4, name: 'Branch 1' }],
      location: 'Stadium',
      stage: 'Programado',
      status: true,
    };

    component.editTournament(tournamentMock as any);

    expect(component.tournamentForm.value.name).toBe('Test Tournament');
    expect(component.tournamentForm.value.organizer).toBe('Org');
    expect(component.tournamentForm.value.status).toBe(true);
    expect(modalSpy.open).toHaveBeenCalled();
  });

  it('should call createTournament on save', fakeAsync(() => {
    const payload = {
      name: 'Test',
      organizer: 'Test Org',
      modalityIds: [1],
      categoryIds: [1],
      startDate: '2023-01-01',
      endDate: '2023-01-10',
      ambitId: 1,
      branchIds: [1],
      location: 'X',
      stage: 'Programado',
      status: true,
    };

    component.tournamentForm.setValue(payload);
    tournamentsServiceSpy.createTournament.and.returnValue(of({}));

    component.saveForm();
    tick();

    expect(tournamentsServiceSpy.createTournament).toHaveBeenCalled();
  }));

  it('should call updateTournament if idTournament is set', fakeAsync(() => {
    component.idTournament = 5;
    const payload = {
      name: 'Test',
      organizer: 'Test Org',
      modalityIds: [1],
      categoryIds: [1],
      startDate: '2023-01-01',
      endDate: '2023-01-10',
      ambitId: 1,
      branchIds: [1],
      location: 'X',
      stage: 'Programado',
      status: true,
    };
    component.tournamentForm.setValue(payload);
    tournamentsServiceSpy.updateTournament.and.returnValue(of({}));

    component.saveForm();
    tick();

    expect(tournamentsServiceSpy.updateTournament).toHaveBeenCalledWith(5, jasmine.any(Object));
  }));

  it('should delete a tournament with confirmation', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    tournamentsServiceSpy.deleteTournament.and.returnValue(of({}));
    tournamentsServiceSpy.getTournaments.and.returnValue(of({ success: true, message: '', data: [] }));


    component.deleteTournament(123);
    tick();

    expect(tournamentsServiceSpy.deleteTournament).toHaveBeenCalledWith(123);
  }));

  it('should return date in YYYY-MM-DD from toYMDStrict', () => {
    const result = component.toYMDStrict('2024-01-05T00:00:00Z');
    expect(result).toBe('2024-01-05');
  });
});
