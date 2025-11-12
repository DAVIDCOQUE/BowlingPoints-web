import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResultsService } from './results.service';
import { environment } from '../../environments/environment';
import { IResults } from '../model/result.interface';
import { ICategory } from '../model/category.interface';
import { IModality } from '../model/modality.interface';
import { ITournament } from '../model/tournament.interface';
import { IRound } from '../model/round.interface';
import { ITeam } from '../model/team.interface';
import { IUser } from '../model/user.interface';

describe('ResultsService', () => {
  let service: ResultsService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ResultsService],
    });

    service = TestBed.inject(ResultsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener todos los resultados (getResults)', () => {
    const mockResults: IResults[] = [
      { resultId: 1, personId: 1, score: 200 } as IResults,
    ];

    service.getResults().subscribe((res) => {
      expect(res.data).toEqual(mockResults);
    });

    const req = httpMock.expectOne(`${apiUrl}/results`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockResults });
  });

  it('debe obtener resultados filtrados sin parámetros opcionales', () => {
    const mockResults: IResults[] = [
      { resultId: 1, personId: 1, score: 200 } as IResults,
    ];

    service.getResultsFiltered(10).subscribe((res) => {
      expect(res).toEqual(mockResults);
    });

    const req = httpMock.expectOne(`${apiUrl}/results/filter?tournamentId=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResults);
  });

  it('debe incluir branchId y roundNumber en los parámetros si se proporcionan', () => {
    const mockResults: IResults[] = [];
    service.getResultsFiltered(10, 5, 2).subscribe((res) => {
      expect(res).toEqual(mockResults);
    });

    const req = httpMock.expectOne((r) =>
      r.url === `${apiUrl}/results/filter` &&
      r.params.get('tournamentId') === '10' &&
      r.params.get('branchId') === '5' &&
      r.params.get('roundNumber') === '2'
    );
    expect(req).toBeTruthy();
    req.flush(mockResults);
  });

  it('debe manejar errores HTTP en getResultsFiltered', () => {
    let capturedError: any;
    service.getResultsFiltered(10).subscribe({
      next: () => fail('Debería lanzar error'),
      error: (e) => (capturedError = e),
    });

    const req = httpMock.expectOne(`${apiUrl}/results/filter?tournamentId=10`);
    req.flush(
      { message: 'Error interno' },
      { status: 500, statusText: 'Server Error' }
    );

    expect(capturedError).toBeTruthy();
    expect(capturedError.status).toBe(500);
  });


  it('debe crear un resultado (createResult)', () => {
    const payload = { personId: 2, score: 250 };

    service.createResult(payload).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/results`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe actualizar un resultado (updateResult)', () => {
    const id = 1;
    const payload = { score: 300 };

    service.updateResult(id, payload).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/results/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe eliminar un resultado (deleteResult)', () => {
    const id = 1;

    service.deleteResult(id).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/results/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('debe obtener torneos (getTournaments)', () => {
    const mockTournaments: ITournament[] = [
      { tournamentId: 1, name: 'Torneo A' } as ITournament,
    ];

    service.getTournaments().subscribe((res) => {
      expect(res.data).toEqual(mockTournaments);
    });

    const req = httpMock.expectOne(`${apiUrl}/tournaments`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockTournaments });
  });

  it('debe obtener categorías (getCategories)', () => {
    const mockCategories: ICategory[] = [
      { categoryId: 1, name: 'Senior' } as ICategory,
    ];

    service.getCategories().subscribe((res) => {
      expect(res.data).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(`${apiUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockCategories });
  });

  it('debe obtener modalidades (getModalities)', () => {
    const mockModalities: IModality[] = [
      { modalityId: 1, name: 'Individual', status: true },
    ];

    service.getModalities().subscribe((res) => {
      expect(res.data).toEqual(mockModalities);
    });

    const req = httpMock.expectOne(`${apiUrl}/modalities`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockModalities });
  });

  it('debe obtener rondas (getRounds)', () => {
    const mockRounds: IRound[] = [{ roundId: 1, roundNumber: 1 } as IRound];

    service.getRounds().subscribe((res) => {
      expect(res.data).toEqual(mockRounds);
    });

    const req = httpMock.expectOne(`${apiUrl}/rounds`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockRounds });
  });

  it('debe obtener usuarios (getUsers)', () => {
    const mockUsers: IUser[] = [{ userId: 1, fullName: 'Juan Pérez' } as IUser];

    service.getUsers().subscribe((res) => {
      expect(res.data).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockUsers });
  });

  it('debe obtener equipos (getTeams)', () => {
    const mockTeams: ITeam[] = [{ teamId: 1, nameTeam: 'Team A' } as ITeam];

    service.getTeams().subscribe((res) => {
      expect(res.data).toEqual(mockTeams);
    });

    const req = httpMock.expectOne(`${apiUrl}/teams`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockTeams });
  });
});
