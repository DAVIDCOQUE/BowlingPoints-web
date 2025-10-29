import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResultsService } from './results.service';
import { environment } from '../../environments/environment';
import { IResults } from '../model/result.interface';

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

  describe('getResultsFiltered', () => {
    const mockResults: IResults[] = [
      { resultId: 1, personId: 1, score: 200 } as IResults,
      { resultId: 2, personId: 2, score: 180 } as IResults,
    ];

    it('should call the correct endpoint without filters', () => {
      service.getResultsFiltered(10).subscribe((res: IResults[]) => {
        expect(res).toEqual(mockResults);
      });

      const req = httpMock.expectOne(`${apiUrl}/results/tournament/10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockResults);
    });

    it('should include branchId param when provided', () => {
      service.getResultsFiltered(10, 5).subscribe((res: IResults[]) => {
        expect(res).toEqual(mockResults);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${apiUrl}/results/tournament/10` && r.params.has('branchId')
      );
      expect(req.request.params.get('branchId')).toBe('5');
      req.flush(mockResults);
    });

    it('should include roundNumber param when provided', () => {
      service.getResultsFiltered(10, undefined, 2).subscribe((res: IResults[]) => {
        expect(res).toEqual(mockResults);
      });

      const req = httpMock.expectOne(
        (r) => r.url === `${apiUrl}/results/tournament/10` && r.params.has('roundNumber')
      );
      expect(req.request.params.get('roundNumber')).toBe('2');
      req.flush(mockResults);
    });

    it('should include both params when branchId and roundNumber are provided', () => {
      service.getResultsFiltered(10, 5, 3).subscribe((res: IResults[]) => {
        expect(res).toEqual(mockResults);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${apiUrl}/results/tournament/10` &&
          r.params.has('branchId') &&
          r.params.has('roundNumber')
      );

      expect(req.request.params.get('branchId')).toBe('5');
      expect(req.request.params.get('roundNumber')).toBe('3');
      req.flush(mockResults);
    });
  });
});
