import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserTournamentApiService } from './user-tournament-api.service';
import { environment } from 'src/environments/environment';
import { IUserTournament } from '../model/UserTournament.interface';

describe('UserTournamentApiService', () => {
  let service: UserTournamentApiService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserTournamentApiService],
    });

    service = TestBed.inject(UserTournamentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ✅ Caso 1: getTorneosJugados (éxito)
  describe('#getTorneosJugados', () => {
    it('should GET tournaments played by user and map to res.data', (done) => {
      const userId = 1;
      const mockTorneos: IUserTournament[] = [
        { tournamentId: 1, name: 'Copa Valle', score: 185 },
        { tournamentId: 2, name: 'Liga Cali', score: 190 },
      ] as unknown as IUserTournament[];

      service.getTorneosJugados(userId).subscribe((data) => {
        expect(data.length).toBe(2);
        expect(data[0].name).toBe('Copa Valle');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'ok', data: mockTorneos });
    });

    // ❌ Caso 2: getTorneosJugados (error simulado)
    it('should handle HTTP error in getTorneosJugados', (done) => {
      const userId = 10;
      const consoleSpy = spyOn(console, 'error');

      service.getTorneosJugados(userId).subscribe({
        next: () => fail('Expected an error, not data'),
        error: (err) => {
          expect(err.status).toBe(500);
          expect(consoleSpy).toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      expect(req.request.method).toBe('GET');
      req.error(new ErrorEvent('Network error'), { status: 500 });
    });
  });

  // ✅ Caso 3: getTorneosInscriptos (éxito)
  describe('#getTorneosInscriptos', () => {
    it('should GET tournaments registered by user and map to res.data', (done) => {
      const userId = 2;
      const mockTorneos: IUserTournament[] = [
        { tournamentId: 3, name: 'Torneo Nacional', score: 200 },
      ] as unknown as IUserTournament[];

      service.getTorneosInscriptos(userId).subscribe((data) => {
        expect(data.length).toBe(1);
        expect(data[0].name).toBe('Torneo Nacional');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'ok', data: mockTorneos });
    });

    // ❌ Caso 4: getTorneosInscriptos (error simulado)
    it('should handle HTTP error in getTorneosInscriptos', (done) => {
      const userId = 99;
      const consoleSpy = spyOn(console, 'error');

      service.getTorneosInscriptos(userId).subscribe({
        next: () => fail('Expected an error, not data'),
        error: (err) => {
          expect(err.status).toBe(404);
          expect(consoleSpy).toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      expect(req.request.method).toBe('GET');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });
});
