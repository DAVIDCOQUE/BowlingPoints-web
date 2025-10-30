import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentlistComponent } from './tournament-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

describe('TournamentlistComponent', () => {
  let component: TournamentlistComponent;
  let fixture: ComponentFixture<TournamentlistComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [TournamentlistComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'ambitId') return '1';
                  return null;
                }
              }
            }
          }
        },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TournamentlistComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAmbitNameById and getListaTorneos on ngOnInit', () => {
    fixture.detectChanges(); // <-- ejecuta ngOnInit

    // Verifica llamada a getAmbitNameById
    const reqAmbit = httpMock.expectOne(`${environment.apiUrl}/ambits/1`);
    expect(reqAmbit.request.method).toBe('GET');

    reqAmbit.flush({
      success: true,
      data: { ambitId: 1, name: 'Nacional' }
    });

    expect(component.ambitName).toBe('Nacional');

    // Verifica llamada a getListaTorneos
    const reqTorneos = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    expect(reqTorneos.request.method).toBe('GET');

    reqTorneos.flush({
      success: true,
      data: [
        { tournamentId: 1, name: 'Torneo A' },
        { tournamentId: 2, name: 'Torneo B' }
      ]
    });

    expect(component.listaTorneos.length).toBe(2);
    expect(component.listaTorneos[0].name).toBe('Torneo A');
  });

  it('should handle error when ambit request fails', () => {
    fixture.detectChanges();

    const reqAmbit = httpMock.expectOne(`${environment.apiUrl}/ambits/1`);
    reqAmbit.flush('Error', { status: 500, statusText: 'Server Error' });

    // llamada a torneos sigue aunque ambit falle
    const reqTorneos = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    reqTorneos.flush({
      success: true,
      data: []
    });

    expect(component.listaTorneos.length).toBe(0);
  });

  it('should handle error when getListaTorneos fails', () => {
    fixture.detectChanges();

    const reqAmbit = httpMock.expectOne(`${environment.apiUrl}/ambits/1`);
    reqAmbit.flush({
      success: true,
      data: { ambitId: 1, name: 'Nacional' }
    });

    const reqTorneos = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    reqTorneos.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.listaTorneos).toEqual([]);
  });

  it('should navigate back to dashboard', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['dashboard']);
  });
});
