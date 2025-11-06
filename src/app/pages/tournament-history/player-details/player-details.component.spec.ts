import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerDetailsComponent } from './player-details.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

describe('PlayerDetailsComponent', () => {
  let component: PlayerDetailsComponent;
  let fixture: ComponentFixture<PlayerDetailsComponent>;
  let httpMock: HttpTestingController;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerDetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'userId' ? '42' : null)
              }
            }
          }
        },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/user-stats/summary?userId=42`);
    const mockResponse = {
      success: true,
      data: {
        fullName: 'John Doe',
        photoUrl: 'http://example.com/photo.jpg',
        age: 30,
        club: 'Club Central',
        avgScore: 195,
        bestGame: 280,
        tournamentsWon: 3
      }
    };
    req.flush(mockResponse);

    expect(component).toBeTruthy();
    expect(component.statisticsUser).toEqual(mockResponse.data);
  });

  it('should call location.back when goBack() is called', () => {
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/api/user-stats/summary?userId=42`)
      .flush({ success: true, data: {} });

    component.goBack();
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should fallback to default image on error', () => {
    fixture.detectChanges();

    httpMock.expectOne(`${environment.apiUrl}/api/user-stats/summary?userId=42`)
      .flush({ success: true, data: {} });

    const mockEvent = { target: { src: 'old.jpg' } } as unknown as Event;
    component.onImgError(mockEvent, 'default.jpg');

    expect((mockEvent.target as HTMLImageElement).src).toBe('default.jpg');
  });

  it('should not call API if userId is 0', () => {
    //  Reconfiguramos el TestBed con un ActivatedRoute sin userId
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      declarations: [PlayerDetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: () => null }
            }
          }
        },
        { provide: Location, useValue: jasmine.createSpyObj('Location', ['back']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerDetailsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    httpMock.expectNone(`${environment.apiUrl}/api/user-stats/summary?userId=0`);
  });

  it('should handle API error gracefully', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/user-stats/summary?userId=42`);
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(component.statisticsUser).toBeNull();
  });
});
