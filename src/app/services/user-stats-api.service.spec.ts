import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserStatsApiService } from './user-stats-api.service';
import { environment } from 'src/environments/environment';
import { IEstadisticas } from '../model/estadisticas.interface';
import { ITorneoResumen } from '../model/torneo-resumen.interface';

describe('UserStatsApiService', () => {
  let service: UserStatsApiService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserStatsApiService],
    });

    service = TestBed.inject(UserStatsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getResumenEstadisticas', () => {
    it('should GET resumen data and map to res.data', (done) => {
      const userId = 5;
      const mockData: IEstadisticas = {
        totalGames: 20,
        averageScore: 180,
        strikes: 60,
        spares: 40,
        tournaments: 5
      };

      service.getResumenEstadisticas(userId).subscribe((data) => {
        expect(data).toEqual(mockData as any);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/api/user-stats/summary?userId=${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockData });
    });
  });

  describe('#getTopTorneos', () => {
    it('should GET top tournaments data and map to res.data', (done) => {
      const userId = 10;
      const mockTorneos: ITorneoResumen[] = [
        { tournamentId: 1, name: 'Copa Valle', scoreAverage: 185 },
        { tournamentId: 2, name: 'Liga Cali', scoreAverage: 190 },
      ];

      service.getTopTorneos(userId).subscribe((data) => {
        expect(data.length).toBe(2);
        expect(data[0].name).toBe('Copa Valle');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/api/user-stats/top-tournaments?userId=${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockTorneos });
    });
  });
});
