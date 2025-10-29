import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TournamentResultComponent } from './tournament-result.component';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';
import { IResults } from 'src/app/model/result.interface';
import { Location } from '@angular/common';

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

  /** Responde a las llamadas de ngOnInit() */
  const flushInitRequests = () => {
    const reqTournaments = httpMock.expectOne(`${apiUrl}/tournaments`);
    reqTournaments.flush({
      success: true,
      data: [{ tournamentId: 1, name: 'Torneo A' }],
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
    expect(component.selectedTournament).toBeTruthy();
    expect(component.selectedTournament?.name).toBe('Torneo A');
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
    component.selectedBranch = 'Masculina';
    component.onFilterChange();

    expect(component.filteredResults.length).toBe(1);
    expect(component.filteredResults[0].resultId).toBe(1);
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
    flushInitRequests();
    // openModal ahora espera un TemplateRef: usamos un dummy y casteamos
    component.openModal({} as any);
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

  it('should handle file selection and show Swal alert', () => {
    const file = new File(['dummy'], 'test.xlsx', {
      type: 'application/vnd.ms-excel',
    });
    const event = { target: { files: [file] } } as any;
    const swalSpy = spyOn(Swal, 'fire');

    component.onFileSelected(event);

    expect(component.selectedFile).toEqual(file);
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'info',
        title: 'Archivo seleccionado',
        text: `Archivo: ${file.name}`,
        confirmButtonText: 'Aceptar',
      })
    );
  });

  it('should delete player and show success Swal when confirmed', fakeAsync(() => {
    // Simulamos confirmación del Swal
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );

    // Mock del método delete del HttpClient
    const httpSpy = jasmine.createSpyObj('HttpClient', ['delete']);
    httpSpy.delete.and.returnValue(of({}));

    // Inyectamos manualmente el mock de HttpClient
    (component as any).http = httpSpy;

    // Espiamos método interno
    const reloadSpy = spyOn(component as any, 'loadRegisteredPlayers');

    // Ejecutamos el método
    component.deletePlayer(123);
    tick(); // simula la resolución del Swal

    // Verificaciones
    expect(swalSpy).toHaveBeenCalled();
    expect(httpSpy.delete).toHaveBeenCalledWith(
      `${(component as any).apiUrl}/registrations/123`
    );
    expect(reloadSpy).toHaveBeenCalled();
  }));

  it('should show error Swal if form is invalid or tournamentId is missing', () => {
    // Espiamos Swal.fire
    const swalSpy = spyOn(Swal, 'fire');

    // Caso 1: formulario inválido
    component['playerForm'] = {
      invalid: true,
      markAllAsTouched: () => {},
    } as any;
    component['tournamentId'] = 1;
    component.savePlayer();
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'Formulario inválido o torneo no definido',
      'error'
    );

    // Caso 2: sin tournamentId
    component['playerForm'] = {
      invalid: false,
      markAllAsTouched: () => {},
    } as any;
    component['tournamentId'] = null;
    component.savePlayer();
    expect(swalSpy).toHaveBeenCalledTimes(2);
  });

  it('should show error Swal if form is invalid or tournamentId is missing', () => {
    const swalSpy = spyOn(Swal, 'fire');
    component['playerForm'] = {
      invalid: true,
      markAllAsTouched: jasmine.createSpy(),
    } as any;
    component.tournamentId = null;

    component.savePlayer();

    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'Formulario inválido o torneo no definido',
      'error'
    );
    expect(component['playerForm'].markAllAsTouched).toHaveBeenCalled();
  });

  it('should call handlePlayerSuccess after saving player', () => {
    const successSpy = spyOn<any>(component, 'handlePlayerSuccess');
    spyOn<any>(component, 'handlePlayerError');

    component['playerForm'] = { invalid: false, value: { personId: 1 } } as any;
    component.tournamentId = 1;
    component.idPlayer = null;

    spyOn(component['http'], 'post').and.returnValue(of({}));

    component.savePlayer();

    expect(successSpy).toHaveBeenCalled();
  });

  it('should call Swal.fire with error when delete fails', () => {
    const swalSpy = spyOn(Swal, 'fire');
    const httpSpy = spyOn(component['http'], 'delete').and.returnValue(
      throwError(() => new Error('Error'))
    );

    component.deletePlayer(1);

    // Simula confirmación del usuario
    swalSpy.calls.reset();
    swalSpy.and.returnValue(Promise.resolve({ isConfirmed: true } as any));

    expect(httpSpy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalled();
  });

  it('should handle error when loading results', () => {
    const swalSpy = spyOn(Swal, 'fire');
    const consoleSpy = spyOn(console, 'error');
    const mockError = new Error('Error de red');

    spyOn(
      (component as any).resultsService,
      'getResultsFiltered'
    ).and.returnValue(throwError(() => mockError));

    component.tournamentId = 1;
    component.loadResults();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error al cargar resultados:',
      mockError
    );
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'No se pudieron cargar los resultados',
      'error'
    );
  });

  it('should patch form and open modal when editResult is called', () => {
    const mockResult: IResults = {
      resultId: 5,
      personId: 2,
      teamId: 1,
      tournamentId: 3,
      categoryId: 4,
      modalityId: 1,
      branchId: 2,
      roundNumber: 1,
      laneNumber: 6,
      lineNumber: 2,
      score: 250,
    } as IResults;

    const patchSpy = spyOn(component.resultForm, 'patchValue');
    const modalSpy = spyOn(component as any, 'openModal');

    component.editResult(mockResult);

    expect(patchSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        personId: 2,
        score: 250,
      })
    );
    expect(modalSpy).toHaveBeenCalledWith(component.modalResultRef);
  });

  it('should show success Swal when result is saved successfully', () => {
    component.tournamentId = 1;
    component.idResult = null;
    component.resultForm.setValue({
      personId: 1,
      teamId: 2,
      tournamentId: 1,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      roundNumber: 1,
      laneNumber: 1,
      lineNumber: 1,
      score: 250,
    });

    const swalSpy = spyOn(Swal, 'fire');
    spyOn(component['http'], 'post').and.returnValue(of({}));

    component.saveResult();

    expect(swalSpy).toHaveBeenCalledWith(
      'Éxito',
      'Resultado creado',
      'success'
    );
  });

  it('should show error Swal when saveResult fails', () => {
    component.tournamentId = 1;
    component.resultForm.setValue({
      personId: 1,
      teamId: 2,
      tournamentId: 1,
      categoryId: 1,
      modalityId: 1,
      branchId: 1,
      roundNumber: 1,
      laneNumber: 1,
      lineNumber: 1,
      score: 250,
    });

    const swalSpy = spyOn(Swal, 'fire');
    spyOn(component['http'], 'post').and.returnValue(
      throwError(() => ({ error: { message: 'Error de red' } }))
    );

    component.saveResult();

    expect(swalSpy).toHaveBeenCalledWith('Error', 'Error de red', 'error');
  });

  it('should call Swal.fire and delete result when confirmed', () => {
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(
      Promise.resolve({ isConfirmed: true } as any)
    );
    const httpSpy = spyOn(component['http'], 'delete').and.returnValue(of({}));
    const successSpy = spyOn(component as any, 'handleDeleteSuccess');

    component.deleteResult(1);

    expect(swalSpy).toHaveBeenCalled();
    expect(httpSpy).toHaveBeenCalledWith(
      `${(component as any).apiUrl}/results/1`
    );
    expect(successSpy).toHaveBeenCalled();
  });

  it('should show error Swal if id is missing', () => {
    const swalSpy = spyOn(Swal, 'fire');
    component.deleteResult();
    expect(swalSpy).toHaveBeenCalledWith(
      'Error',
      'ID de resultado no válido',
      'error'
    );
  });

  it('should reset filters and call loadResults', () => {
    const loadSpy = spyOn(component, 'loadResults');
    component.selectedBranch = 'A';
    component.selectedRound = 1;

    component.clearFilters();

    expect(component.selectedBranch).toBe('');
    expect(component.selectedRound).toBeNull();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should filter registrations by branch name', () => {
    component.registrations = [
      { branchName: 'Norte' },
      { branchName: 'Sur' },
    ] as any[];

    component.selectedBranchPlayer = 'nor';
    component.onFilterPlayerChange();

    expect(component.filteredRegistrations.length).toBe(1);
    expect(component.filteredRegistrations[0].branchName).toBe('Norte');
  });

  it('should create a file input and trigger click on openFileInputResults', () => {
    const createSpy = spyOn(document, 'createElement').and.callThrough();
    const clickSpy = jasmine.createSpy('click');
    const inputMock: Partial<HTMLInputElement> = {
      type: '',
      accept: '',
      onchange: null as any,
      click: clickSpy as any,
    };

    (createSpy as jasmine.Spy).and.returnValue(inputMock as HTMLInputElement);

    component.openFileInputResults();

    expect(createSpy).toHaveBeenCalledWith('input');
    expect(inputMock.type).toBe('file');
    expect(inputMock.accept).toBe('.xlsx, .xls');
    expect(typeof inputMock.onchange).toBe('function');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should handle file selection and show Swal alert', () => {
    const file = new File(['data'], 'test.xlsx', {
      type: 'application/vnd.ms-excel',
    });
    const event = { target: { files: [file] } } as unknown as Event;
    const swalSpy = spyOn(Swal, 'fire');

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'info',
        title: 'Archivo seleccionado',
        text: `Archivo: ${file.name}`,
        confirmButtonText: 'Aceptar',
      })
    );
  });

  it('should replace image src when onImgError is called', () => {
    const mockImg = { src: 'old.png' };
    const fallback = 'new.png';
    const event = { target: mockImg } as unknown as Event;

    component.onImgError(event, fallback);

    expect(mockImg.src).toBe(fallback);
  });

  it('should call location.back when goBack is called', () => {
    const locationSpy = spyOn((component as any).location, 'back');
    component.goBack();
    expect(locationSpy).toHaveBeenCalled();
  });
});
