import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('TournamentResultComponent', () => {
  let component: TournamentResultComponent;
  let fixture: ComponentFixture<TournamentResultComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [TournamentResultComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on init', () => {
    expect(component.resultForm).toBeTruthy();
    expect(component.resultForm.controls['tournamentId']).toBeDefined();
  });

  it('should not submit form if invalid', () => {
    spyOn(Swal, 'fire');
    component.resultForm.patchValue({ tournamentId: '' }); // invalid
    component.saveForm();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('should patch form and open modal when editing result', () => {
    const mockResult = {
      resultId: 1,
      personId: 1,
      teamId: 1,
      tournamentId: 1,
      categoryId: 1,
      modalityId: 1,
      roundId: 1,
      laneNumber: 1,
      lineNumber: 1,
      score: 150,
      tournamentName: '',
      personName: '',
      teamName: '',
      categoryName: '',
      modalityName: '',
      roundNumber: '',
      rama: ''
    };

    component.editResult(mockResult);
    expect(component.resultForm.value.tournamentId).toBe(1);
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should open modal and reset form if creating new result', () => {
    component.idResult = null;
    component.resultForm.patchValue({ tournamentId: 5 });
    component.openModal('mock-content');
    expect(component.resultForm.value.tournamentId).toBeNull();
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should call closeModal correctly', () => {
    component.resultForm.patchValue({ tournamentId: 1 });
    component.closeModal();
    expect(component.resultForm.value.tournamentId).toBeNull();
    expect(component.idResult).toBeNull();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should clear filter when calling clear()', () => {
    component.filter = 'test';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should filter results by tournament name', () => {
    component.results = [
      {
        resultId: 1,
        personId: 1,
        teamId: 1,
        tournamentId: 1,
        categoryId: 1,
        modalityId: 1,
        roundId: 1,
        laneNumber: 1,
        lineNumber: 1,
        score: 200,
        tournamentName: 'Copa Nacional',
        personName: '',
        teamName: '',
        categoryName: '',
        modalityName: '',
        roundNumber: '',
        rama: ''
      },
      {
        resultId: 2,
        personId: 2,
        teamId: 2,
        tournamentId: 2,
        categoryId: 2,
        modalityId: 2,
        roundId: 2,
        laneNumber: 2,
        lineNumber: 2,
        score: 180,
        tournamentName: 'Copa Local',
        personName: '',
        teamName: '',
        categoryName: '',
        modalityName: '',
        roundNumber: '',
        rama: ''
      }
    ];

    component.filter = 'nacional';
    const filtered = component.filteredResult;
    expect(filtered.length).toBe(1);
    expect(filtered[0].tournamentName).toBe('Copa Nacional');
  });
});
