import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerDetailsComponent } from './player-details.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UserStatsApiService } from 'src/app/services/user-stats-api.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

describe('PlayerDetailsComponent', () => {
  let component: PlayerDetailsComponent;
  let fixture: ComponentFixture<PlayerDetailsComponent>;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      declarations: [PlayerDetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        UserStatsApiService,
        { provide: Location, useValue: locationSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'userId' ? '42' : null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

it('should create the component and load statistics', () => {
  const mockResponse = {
    fullName: 'John Doe',
    photoUrl: 'http://example.com/photo.jpg',
    age: 30,
    club: 'Club Central',
    avgScore: 195,
    bestGame: 280,
    tournamentsWon: 3
  };

  fixture.detectChanges();

  const req = httpMock.expectOne(`${environment.apiUrl}/api/user-stats/public-summary?userId=42`);
  req.flush({ success: true, data: mockResponse }); // 👈 importante

  fixture.detectChanges();

  expect(component.statisticsUser).toEqual(mockResponse);
});



  it('should call location.back when goBack() is called', () => {
    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should fallback to default image on error', () => {
    const mockEvent = { target: { src: 'old.jpg' } } as unknown as Event;
    component.onImgError(mockEvent, 'default.jpg');

    expect((mockEvent.target as HTMLImageElement).src).toBe('default.jpg');
  });

  it('should not call API if userId is 0', () => {
    // Override ActivatedRoute to return null
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [PlayerDetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        UserStatsApiService,
        { provide: Location, useValue: locationSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    // No request should be made
    httpMock.expectNone(`${environment.apiUrl}/api/user-stats/public-summary?userId=0`);
  });

  it('should handle API error gracefully with Swal', () => {
    spyOn(Swal, 'fire');

    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/user-stats/public-summary?userId=42`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(component.statisticsUser).toBeNull();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error',
      text: ' No se pudieron cargar las estadísticas del jugador.',
      confirmButtonColor: '#dc3545',
    }));
  });
});
