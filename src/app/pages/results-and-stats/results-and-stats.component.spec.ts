import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsAndStatsComponent } from './results-and-stats.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { IResults } from '../../model/result.interface';
import { NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';
import { environment } from 'src/environments/environment';

describe('ResultsAndStatsComponent', () => {
  let component: ResultsAndStatsComponent;
  let fixture: ComponentFixture<ResultsAndStatsComponent>;
  let httpMock: HttpTestingController;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);

    await TestBed.configureTestingModule({
      declarations: [ResultsAndStatsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NgbModal, useValue: modalServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Para ignorar templates no relevantes
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsAndStatsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // ngOnInit()
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tournaments on init', () => {
    const mockTournaments = [{ name: 'Torneo Test' }];
    const req = httpMock.expectOne(`${environment.apiUrl}/tournaments`);
    req.flush({ success: true, data: mockTournaments });

    expect(component.tournaments.length).toBe(1);
    expect(component.selectedTournament?.name).toBe('Torneo Test');
  });

  it('should load categories', () => {
    component.loadCategories();
    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    req.flush({ success: true, data: [{ name: 'Juvenil' }] });

    expect(component.categories.length).toBe(1);
  });

  it('should load and group results', () => {
    const mockResults: IResults[] = [
      { personName: 'Juan', tournamentName: 'Torneo 1', score: 200 } as IResults,
      { personName: 'Juan', tournamentName: 'Torneo 1', score: 100 } as IResults,
      { personName: 'Ana', tournamentName: 'Torneo 2', score: 300 } as IResults,
    ];

    component.loadResults();
    const req = httpMock.expectOne(`${environment.apiUrl}/results`);
    req.flush({ success: true, data: mockResults });

    expect(component.filteredResults.length).toBe(3);
    expect(component.playerStats.length).toBe(2);
    expect(component.playerStats.find(p => p.name === 'Juan')?.totalAverage).toBe(150);
  });

  it('should filter results by branch', () => {
    component.results = [
      { branchName: 'Femenino' } as IResults,
      { branchName: 'Masculino' } as IResults,
    ];
    component.selectedBranch = 'femenino';
    component.onFilterChange();

    expect(component.filteredResults.length).toBe(1);
  });

  it('should return player average correctly', () => {
    const player = {
      name: 'Carlos',
      tournaments: [{ tournamentName: 'Torneo X', average: 180 }],
      totalAverage: 180
    };

    const avg = component.getPlayerAverage(player, 'Torneo X');
    expect(avg).toBe(180);
  });

  it('should handle file selection', () => {
    const swalSpy = spyOn(Swal, 'fire');
    const file = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.ms-excel' });

    const event = {
      target: {
        files: [file]
      }
    } as unknown as Event;

    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
    expect(swalSpy).toHaveBeenCalled();
  });

  it('should open modal on editResult', () => {
    const result: IResults = { score: 100 } as IResults;
    component.modalResultRef = {} as TemplateRef<unknown>;
    component.editResult(result);

    expect(modalServiceSpy.open).toHaveBeenCalled();
  });

  it('should delete result and reload', () => {
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    const loadSpy = spyOn(component, 'loadResults');

    component.deleteResult(1);

    setTimeout(() => {
      const req = httpMock.expectOne(`${environment.apiUrl}/results/1`);
      req.flush({});
      expect(loadSpy).toHaveBeenCalled();
    }, 0);
  });
});
