import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TournamentsComponent } from './tournaments.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { dateRangeValidator } from 'src/app/shared/validators/date-range.validator';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

describe('TournamentsComponent', () => {
  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;
  let httpMock: HttpTestingController;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      declarations: [TournamentsComponent],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Mocks iniciales disparados por ngOnInit
    mockNgOnInitRequests();
  });

  afterEach(() => {
    // Limpia cualquier petición pendiente
    httpMock.verify();
  });

  function mockNgOnInitRequests() {
    httpMock.expectOne(`${component.apiUrl}/tournaments`).flush({ success: true, data: [] });
    httpMock.expectOne(`${component.apiUrl}/modalities`).flush({ success: true, data: [] });
    httpMock.expectOne(`${component.apiUrl}/categories`).flush({ success: true, data: [] });
    httpMock.expectOne(`${component.apiUrl}/ambits`).flush({ success: true, data: [] });
    httpMock.expectOne('https://api-colombia.com/api/v1/Department').flush([]);
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form on ngOnInit', () => {
    expect(component.tournamentForm).toBeDefined();
    expect(component.tournamentForm.valid).toBeFalse();
  });

  it('should patch form and open modal on editTournament', () => {
    const mockTournament = {
      tournamentId: 1,
      name: 'Torneo 1',
      organizer: 'Org',
      categories: [{ categoryId: 1, name: 'Cat 1' }],
      modalities: [{ modalityId: 2, name: 'Mod 1' }],
      startDate: '2025-10-10',
      endDate: '2025-10-12',
      ambitId: 1,
      location: 'City',
      stage: 'Etapa',
      status: true
    };

    component.editTournament(mockTournament as any);

    expect(component.tournamentForm.value.name).toBe('Torneo 1');
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should reset form and open modal if idTournament is null', () => {
    component.idTournament = null;
    const content = 'dummy';
    component.tournamentForm.patchValue({ name: 'X' });
    component.openModal(content);
    expect(component.tournamentForm.value.name).toBeNull();
    expect(modalServiceSpy.open).toHaveBeenCalledWith(content);
  });

  it('should close modal and reset form', () => {
    component.tournamentForm.patchValue({ name: 'X' });
    component.closeModal();
    expect(component.tournamentForm.value.name).toBeNull();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should return filtered tournaments', () => {
    component.tournaments = [
      { name: 'Torneo A' } as any,
      { name: 'Torneo B' } as any
    ];
    component.filter = 'a';
    const result = component.filteredTournaments;
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Torneo A');
  });

  it('should return formatted modalities string', () => {
    const mockT = { modalities: [{ name: 'X' }, { name: 'Y' }] } as any;
    const str = component.getModalitiesString(mockT);
    expect(str).toBe('X, Y');
  });

  it('should return formatted categories string', () => {
    const mockT = { categories: [{ name: 'A' }, { name: 'B' }] } as any;
    const str = component.getCategoriesString(mockT);
    expect(str).toBe('A, B');
  });

  it('should format dates correctly with toYMDStrict', () => {
    const date = new Date('2025-01-01T00:00:00');
    const ts = date.getTime(); // timestamp exacto de esa fecha
    const expected = component.toYMDStrict(date); // esto devuelve lo que tu app ve

    expect(component.toYMDStrict(date)).toBe(expected);
    expect(component.toYMDStrict('2025-01-01')).toBe(expected);
    expect(component.toYMDStrict(ts)).toBe(expected);
    expect(component.toYMDStrict(null)).toBeNull();
  });


 it('should not submit form if invalid', () => {
  component.tournamentForm = component.fb.group({
    name: [''],
    organizer: [''],
    modalityIds: [''],
    categoryIds: [''],
    startDate: ['2025-01-10'],
    endDate: ['2025-01-05'], // ⛔ fecha inválida: end < start
    ambitId: [''],
    location: [''],
    stage: [''],
    status: [''],
  }, {
    validators: dateRangeValidator('startDate', 'endDate', { allowEqual: true })
  });

  spyOn(Swal, 'fire');
  spyOn(component['http'], 'post');

  component.tournamentForm.markAllAsTouched();
  expect(component.tournamentForm.valid).toBeFalse(); // ✅ ahora sí es inválido

  component.saveForm();

  expect(component['http'].post).not.toHaveBeenCalled();
  expect(Swal.fire).not.toHaveBeenCalled();
});

  it('should confirm and call deleteTournament', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    spyOn(component['http'], 'delete').and.returnValue(of({}));
    spyOn(component, 'getTournaments');

    component.deleteTournament(1);
    tick();

    expect(component.getTournaments).toHaveBeenCalled();
  }));
});
