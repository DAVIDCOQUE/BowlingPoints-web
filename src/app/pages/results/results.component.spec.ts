import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ResultsComponent } from './results.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let httpMock: HttpTestingController;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [ResultsComponent],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Mock de peticiones de ngOnInit
    mockNgOnInitRequests();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function mockNgOnInitRequests() {
    httpMock.expectOne(`${environment.apiUrl}/results`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/tournaments`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/modalities`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/rounds`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/users`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/teams`).flush({ data: [] });
    httpMock.expectOne(`${environment.apiUrl}/categories`).flush({ data: [] });
  }

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.resultForm.valid).toBeFalse();
  });

  it('should reset form and open modal if idResult is null', () => {
    component.idResult = null;
    const content = 'modalContent';
    component.resultForm.patchValue({ score: 100 });
    component.openModal(content);
    expect(component.resultForm.value.score).toBeNull();
    expect(modalServiceSpy.open).toHaveBeenCalledWith(content);
  });

  it('should open modal for read-only result', () => {
    const content = 'readOnlyModal';
    component.openModalResultados(content);
    expect(modalServiceSpy.open).toHaveBeenCalledWith(content);
  });

  it('should patch form and open modal on editResult', () => {
    const mockResult = {
      resultId: 1,
      tournamentId: 2,
      categoryId: 3,
      modalityId: 4,
      roundId: 5,
      laneNumber: 6,
      lineNumber: 7,
      score: 180,
    };
    component.editResult(mockResult as any);
    expect(component.resultForm.value.score).toBe(180);
    expect(component.idResult).toBe(1);
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should return filtered results by tournament name', () => {
    component.results = [
      {
        resultId: 1,
        score: 100,
        rama: 'M',
        roundNumber: 1,
        tournament: { tournamentId: 1, tournamentName: 'Torneo A' } as any,
      },
      {
        resultId: 2,
        score: 120,
        rama: 'F',
        roundNumber: 1,
        tournament: { tournamentId: 2, tournamentName: 'Otro' } as any,
      },
    ] as any;

    component.filter = 'torneo';
    const filtered = component.filteredResult;

    expect(filtered.length).toBe(1);
    expect(filtered[0].tournament!.tournamentName).toBe('Torneo A');
  });

  it('should clear filter', () => {
    component.filter = 'abc';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should close modal and reset form', () => {
    component.resultForm.patchValue({ score: 200 });
    component.closeModal();
    expect(component.resultForm.value.score).toBeNull();
    expect(component.idResult).toBeNull();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    spyOn(component['http'], 'post');
    component.saveForm();
    expect(component['http'].post).not.toHaveBeenCalled();
  });

  it('should save new result (POST)', () => {
    component.resultForm.setValue({
      personId: '',
      teamId: '',
      tournamentId: 1,
      categoryId: 2,
      modalityId: 3,
      roundId: 4,
      laneNumber: 5,
      lineNumber: 6,
      score: 100,
    });

    component.idResult = null;

    component.saveForm();

    const req = httpMock.expectOne(`${environment.apiUrl}/results`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    // Se espera nueva carga de resultados después de guardar
    httpMock.expectOne(`${environment.apiUrl}/results`).flush({ data: [] });

    expect(component.isLoading$.value).toBeFalse();
  });

  it('should update existing result (PUT)', () => {
    component.idResult = 123;
    component.resultForm.setValue({
      personId: '',
      teamId: '',
      tournamentId: 1,
      categoryId: 2,
      modalityId: 3,
      roundId: 4,
      laneNumber: 5,
      lineNumber: 6,
      score: 150,
    });

    component.saveForm();

    const req = httpMock.expectOne(`${environment.apiUrl}/results/123`);
    expect(req.request.method).toBe('PUT');
    req.flush({});

    httpMock.expectOne(`${environment.apiUrl}/results`).flush({ data: [] });

    expect(component.isLoading$.value).toBeFalse();
  });

  it('should delete result', () => {
    component.deleteResult(321);

    const req = httpMock.expectOne(`${environment.apiUrl}/results/321`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    httpMock.expectOne(`${environment.apiUrl}/results`).flush({ data: [] });
  });
});
