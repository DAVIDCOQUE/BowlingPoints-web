import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
// opcional si tienes errores de plantilla:
// import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TournamentResultComponent', () => {
  let component: TournamentResultComponent;
  let fixture: ComponentFixture<TournamentResultComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [TournamentResultComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }],
      // schemas: [NO_ERRORS_SCHEMA], // descomenta si fallan elementos de la plantilla
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentResultComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Este componente carga datos si existe tournamentId en la ruta.
  // En estas pruebas evitamos forzar ngOnInit con llamadas HTTP innecesarias.

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected tournament manually', () => {
    (component as any).selectedTournament = { tournamentId: 1, name: 'Torneo A' } as any;
    expect(component.selectedTournament?.name).toBe('Torneo A');
  });

  it('should trigger loadResults on filter change', () => {
    const spy = spyOn(component, 'loadResults');
    component.selectedBranch = 'Masculina';
    component.selectedRound = 2;
    component.onFilterChange();
    expect(spy).toHaveBeenCalled();
  });

  it('should open file input when calling openFileInputResults()', () => {
    const createSpy = spyOn(document, 'createElement').and.callThrough();
    component.openFileInputResults();
    expect(createSpy).toHaveBeenCalledWith('input');
  });

  it('should handle file selection and show Swal alert', () => {
    const file = new File(['dummy'], 'test.xlsx', {
      type: 'application/vnd.ms-excel',
    });
    const event = { target: { files: [file] } } as any; // el handler acepta Event, casteamos
    const swalSpy = spyOn(Swal, 'fire');
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
    expect(swalSpy).toHaveBeenCalled();
  });

  it('should open modal', () => {
    fixture.detectChanges();
    // openModal ahora espera un TemplateRef: usamos un dummy y casteamos
    component.openModal({} as any);
    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should close modal', () => {
    fixture.detectChanges();
    component.closeModal();
    expect(modalServiceSpy.dismissAll).toHaveBeenCalled();
  });

  it('should call deleteResult and refresh results on success', async () => {
    fixture.detectChanges();

    // Simulamos confirmación inmediata del Swal
    spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true }) as any
    );
    spyOn(component, 'loadResults');

    component.deleteResult(1);

    // Espera a que se resuelvan las promesas del .then(...)
    await fixture.whenStable();

    const req = httpMock.expectOne(`${apiUrl}/results/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });

    expect(component.loadResults).toHaveBeenCalled();
  });
});
