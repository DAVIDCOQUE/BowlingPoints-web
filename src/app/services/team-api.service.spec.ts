import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TeamApiService } from './team-api.service';

describe('TeamApiService', () => {
  let service: TeamApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TeamApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
