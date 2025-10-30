import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResultsAndStatsComponent } from './results-and-stats.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';
import { ITournament } from 'src/app/model/tournament.interface';
import { ICategory } from 'src/app/model/category.interface';
import { IResults } from 'src/app/model/result.interface';

describe('ResultsAndStatsComponent', () => {
  let component: ResultsAndStatsComponent;
  let fixture: ComponentFixture<ResultsAndStatsComponent>;
  let httpMock: HttpTestingController;
  let modalService: jasmine.SpyObj<NgbModal>;

  beforeEach(waitForAsync(() => {
    const modalSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    TestBed.configureTestingModule({
      declarations: [ResultsAndStatsComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: NgbModal, useValue: modalSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsAndStatsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const flushNgOnInitRequests = (
    tournaments: ITournament[] = [],
    categories: ICategory[] = [],
    results: IResults[] = []
  ) => {
    httpMock.expectOne('http://localhost:9999/tournaments').flush({ success: true, data: tournaments });
    httpMock.expectOne('http://localhost:9999/categories').flush({ success: true, data: categories });
    httpMock.expectOne('http://localhost:9999/results').flush({ success: true, data: results });
  };

  // --------------------------------------------------
  // CREACIÓN
  // --------------------------------------------------
  it('should create', () => {
    fixture.detectChanges();
    flushNgOnInitRequests();
    expect(component).toBeTruthy();
  });

  // --------------------------------------------------
  // CARGA DE DATOS
  // --------------------------------------------------
  it('should load tournaments', () => {
    fixture.detectChanges();
    const mockTournaments: ITournament[] = [
      { tournamentId: 1, name: 'Torneo A', startDate: new Date() },
      { tournamentId: 2, name: 'Torneo B', startDate: new Date() }
    ];
    flushNgOnInitRequests(mockTournaments, [], []);
    expect(component.tournaments.length).toBe(2);
    expect(component.selectedTournament?.name).toBe('Torneo A');
  });

  it('should load categories', () => {
    component.loadCategories();
    const req = httpMock.expectOne('http://localhost:9999/categories');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ id: 1, name: 'Juvenil' }] });
    expect(component.categories.length).toBe(1);
  });

  it('should load results', () => {
    const mockResults: IResults[] = [
      {
        resultId: 1,
        score: 100,
        laneNumber: 1,
        lineNumber: 1,
        branchName: 'Masculino',
        branchId: 1,
        personName: 'Ana',
        tournamentName: 'Torneo X'
      },
      {
        resultId: 2,
        score: 200,
        laneNumber: 2,
        lineNumber: 1,
        branchName: 'Masculino',
        branchId: 1,
        personName: 'Ana',
        tournamentName: 'Torneo X'
      }
    ];

    component.loadResults();

    const req = httpMock.expectOne('http://localhost:9999/results');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockResults });

    expect(component.results.length).toBe(2);
    expect(component.playerStats.length).toBe(1);
    expect(component.playerStats[0].totalAverage).toBeGreaterThan(0);
  });

  // --------------------------------------------------
  // FILTROS Y AGRUPAMIENTO
  // --------------------------------------------------
  it('should filter results by branch', () => {
    component.results = [
      {
        resultId: 1, score: 200, laneNumber: 1, lineNumber: 1,
        branchName: 'Masculino', branchId: 1
      } as IResults,
      {
        resultId: 2, score: 150, laneNumber: 2, lineNumber: 1,
        branchName: 'Femenino', branchId: 2
      } as IResults
    ];
    component.selectedBranch = 'Femenino';
    component.onFilterChange();
    expect(component.filteredResults.length).toBe(1);
    expect(component.filteredResults[0].branchName).toBe('Femenino');
  });

  it('should group results by player and tournament correctly', () => {
    const results: IResults[] = [
      {
        resultId: 1, score: 100, laneNumber: 1, lineNumber: 1,
        branchName: 'Masculino', branchId: 1, personName: 'Juan', tournamentName: 'Open'
      },
      {
        resultId: 2, score: 200, laneNumber: 2, lineNumber: 1,
        branchName: 'Masculino', branchId: 1, personName: 'Juan', tournamentName: 'Open'
      },
      {
        resultId: 3, score: 150, laneNumber: 3, lineNumber: 1,
        branchName: 'Femenino', branchId: 2, personName: 'Ana', tournamentName: 'Master'
      }
    ];

    (component as any).groupResultsByPlayerAndTournament(results);
    expect(component.playerStats.length).toBe(2);
    expect(component.allTournaments).toContain('Open');
  });

  // --------------------------------------------------
  // PROMEDIOS
  // --------------------------------------------------
  it('should return player average correctly', () => {
    const stats = {
      name: 'Pedro',
      tournaments: [
        { tournamentName: 'Torneo 1', average: 100 },
        { tournamentName: 'Torneo 2', average: 80 }
      ],
      totalAverage: 90
    };
    expect(component.getPlayerAverage(stats, 'Torneo 2')).toBe(80);
  });

  it('should return null if tournament not found', () => {
    const stats = {
      name: 'Luis',
      tournaments: [{ tournamentName: 'Torneo A', average: 100 }],
      totalAverage: 100
    };
    expect(component.getPlayerAverage(stats, 'Otro')).toBeNull();
  });

  // --------------------------------------------------
  // ARCHIVOS
  // --------------------------------------------------
  it('should handle file selection', () => {
    const fakeFile = new File(['fake'], 'test.xlsx', { type: 'application/vnd.ms-excel' });
    const event = { target: { files: [fakeFile] } } as unknown as Event;

    spyOn(Swal, 'fire');
    component.onFileSelected(event);

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'info',
      title: 'Archivo seleccionado',
      text: jasmine.stringMatching(/test\.xlsx/)
    }));
    expect(component.selectedFile).toBe(fakeFile);
  });

  // --------------------------------------------------
  // MODALES
  // --------------------------------------------------
  it('should open and close modal', () => {
    const fakeTemplate = {} as TemplateRef<unknown>;
    component.openModal(fakeTemplate);
    expect(modalService.open).toHaveBeenCalled();

    component.closeModal();
    expect(modalService.dismissAll).toHaveBeenCalled();
  });

  it('should open modal on editResult', () => {
    const mockResult: IResults = {
      resultId: 1, score: 120, laneNumber: 1, lineNumber: 1,
      branchName: 'Femenino', branchId: 1
    };
    component.modalResultRef = {} as TemplateRef<unknown>;
    component.editResult(mockResult);
    expect(modalService.open).toHaveBeenCalled();
  });

  // --------------------------------------------------
  // DELETE RESULT
  // --------------------------------------------------
  it('should delete result and reload', async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);

    component.deleteResult(1);

    // Esperar que la promesa de Swal.fire se resuelva
    await fixture.whenStable();

    const deleteReq = httpMock.expectOne('http://localhost:9999/results/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ success: true });

    const reqReload = httpMock.expectOne('http://localhost:9999/results');
    reqReload.flush({ success: true, data: [] });
  });
});
