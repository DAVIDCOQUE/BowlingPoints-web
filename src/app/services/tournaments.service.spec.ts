import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TournamentsService } from './tournaments.service';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TournamentsService],
    });

    service = TestBed.inject(TournamentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch tournaments', () => {
    const mockResponse = { success: true, message: 'ok', data: [] };
    service.getTournaments().subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/tournaments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch tournament by id', () => {
    const mockResponse = {
      success: true,
      message: 'ok',
      data: { tournamentId: 1, name: 'Mock' },
    };
    service.getTournamentById(1).subscribe((res) => {
      expect(res.data?.tournamentId).toBe(1);
      expect(res.success).toBeTrue();
      expect(res.message).toBe('ok');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/tournaments/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });


  it('should fetch departments', () => {
    const mockDepartments = [{ id: 1, name: 'Valle del Cauca' }];
    service.getDepartments().subscribe((res) => {
      expect(res[0].name).toBe('Valle del Cauca');
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(
      'https://api-colombia.com/api/v1/Department'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockDepartments);
  });

  it('should create a new tournament', () => {
    const payload = { name: 'Nuevo Torneo' };
    const mockResponse = { success: true, message: 'created', data: payload };

    service.createTournament(payload).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.data).toEqual(payload);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/tournaments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should update a tournament', () => {
    const id = 1;
    const payload = { name: 'Torneo Actualizado' };
    const mockResponse = { success: true, message: 'updated', data: payload };

    service.updateTournament(id, payload).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.message).toBe('updated');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/tournaments/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should delete a tournament', () => {
    const id = 1;
    const mockResponse = { success: true, message: 'deleted' };

    service.deleteTournament(id).subscribe((res) => {
      expect(res.message).toBe('deleted');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/tournaments/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
