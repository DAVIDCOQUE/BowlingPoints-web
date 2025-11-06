import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserStatsApiService, UserDashboardStats } from './user-stats-api.service';
import { environment } from 'src/environments/environment';

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

  describe('#getDashboardStats', () => {
    it('should GET dashboard stats and map to res.data', (done) => {
      const userId = 5;
      const mockData: UserDashboardStats = {
        avgScoreGeneral: 180,
        bestLine: 245,
        totalTournaments: 7,
        totalLines: 120,
        bestTournamentAvg: {
          tournamentId: 1,
          tournamentName: 'Open Cali',
          imageUrl: 'img.png',
          average: 195.5,
          startDate: '2024-01-01',
        },
        avgPerTournament: [
          {
            tournamentId: 2,
            tournamentName: 'Liga',
            imageUrl: 'x.png',
            average: 188.2,
            startDate: '2024-02-01',
          },
        ],
        avgPerModality: [
          { modalityName: 'Clásico', average: 182.3 },
        ],
        scoreDistribution: [
          { label: '130–160', count: 10 },
          { label: '160–190', count: 5 },
        ],
      };

      service.getDashboardStats(userId).subscribe((data) => {
        expect(data.bestLine).toBe(245);
        expect(data.avgPerTournament.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/api/user-stats/dashboard?userId=${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockData });
    });
  });
});
