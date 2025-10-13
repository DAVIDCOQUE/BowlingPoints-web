import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsAndStatsComponent } from './results-and-stats.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

describe('ResultsAndStatsComponent', () => {
  let component: ResultsAndStatsComponent;
  let fixture: ComponentFixture<ResultsAndStatsComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [ResultsAndStatsComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsAndStatsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  /** Helper para responder a las llamadas iniciales del ngOnInit() */
  const flushInitRequests = () => {
    const reqTournaments = httpMock.expectOne(`${apiUrl}/tournaments`);
    reqTournaments.flush({
      success: true,
      data: [{ tournamentId: 1, tournamentName: 'Torneo A' }],
    });

    const reqCategories = httpMock.expectOne(`${apiUrl}/categories`);
    reqCategories.flush({
      success: true,
      data: [{ categoryId: 1, name: 'Cat A' }],
    });

    const reqModalities = httpMock.expectOne(`${apiUrl}/modalities`);
    reqModalities.flush({
      success: true,
      data: [{ modalityId: 1, name: 'Indiv' }],
    });

    const reqResults = httpMock.expectOne(`${apiUrl}/results`);
    reqResults.flush({ success: true, data: [{ resultId: 1, score: 100 }] });
  };

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    flushInitRequests();
    expect(component).toBeTruthy();
  });

  it('should load tournaments on init', () => {
    fixture.detectChanges();
    flushInitRequests();
    expect(component.tournaments.length).toBe(1);
    expect(component.selectedTournament?.tournamentName).toBe('Torneo A');
  });

  it('should filter results by category, modality and rama', () => {
    component.results = [
      {
        resultId: 1,
        category: { categoryId: 1, name: 'Cat 1' } as any,
        modality: { modalityId: 1, name: 'Mod 1' } as any,
        rama: 'Masculina',
      } as any,
      {
        resultId: 2,
        category: { categoryId: 2, name: 'Cat 2' } as any,
        modality: { modalityId: 2, name: 'Mod 2' } as any,
        rama: 'Femenina',
      } as any,
    ];

    component.selectedCategory = '1';
    component.selectedModality = '1';
    component.selectedRama = 'Masculina';

    component.onFilterChange();

    expect(component.filteredResults.length).toBe(1);
    expect(component.filteredResults[0].resultId).toBe(1);
  });

  it('should open file input when calling openFileInput()', () => {
    const clickSpy = spyOn(document, 'createElement').and.callThrough();
    component.openFileInput();
    expect(clickSpy).toHaveBeenCalledWith('input');
  });

  it('should handle file selection and show Swal alert', () => {
    const file = new File(['dummy'], 'test.xlsx', {
      type: 'application/vnd.ms-excel',
    });
    const event = { target: { files: [file] } };
    const swalSpy = spyOn(Swal, 'fire');
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
    expect(swalSpy).toHaveBeenCalled();
  });

  it('should open modal', () => {
    fixture.detectChanges();
    flushInitRequests();
    component.openModal('mock-template');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should close modal', () => {
    fixture.detectChanges();
    flushInitRequests();
    component.closeModal();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should call deleteResult and refresh results on success', async () => {
    fixture.detectChanges();
    flushInitRequests();

    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true }) as any
    );
    spyOn(component, 'loadResults');

    await component.deleteResult(1);

    const req = httpMock.expectOne(`${apiUrl}/results/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });

    expect(component.loadResults).toHaveBeenCalled();
  });
});
