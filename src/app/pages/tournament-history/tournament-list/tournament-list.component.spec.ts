import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TournamentlistComponent } from './tournament-list.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from 'src/environments/environment';

describe('TournamentlistComponent', () => {
  let component: TournamentlistComponent;
  let fixture: ComponentFixture<TournamentlistComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TournamentlistComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'ambitId') return '1'; // Simula route param
                  return null;
                }
              }
            }
          }
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
    component.ngOnInit();

    // ✅ Verifica que se haya hecho la petición del ámbito
    const reqAmbit = httpMock.expectOne(`${environment.apiUrl}/ambits/1`);
    expect(reqAmbit.request.method).toBe('GET');

    reqAmbit.flush({
      success: true,
      message: '',
      data: { ambitId: 1, name: 'Nacional' }
    });

    expect(component.ambitName).toBe('Nacional');

    // ✅ Verifica que se haya hecho la petición de torneos
    const reqTorneos = httpMock.expectOne(`${environment.apiUrl}/results/by-ambit?ambitId=1`);
    expect(reqTorneos.request.method).toBe('GET');

    const mockTorneos = [
      { tournamentId: 1, tournamentName: 'Torneo A' },
      { tournamentId: 2, tournamentName: 'Torneo B' }
    ];

    reqTorneos.flush({
      success: true,
      message: '',
      data: mockTorneos
    });

    expect(component.listaTorneos.length).toBe(2);
    expect(component.listaTorneos[0].name).toBe('Torneo A'); // ✅ Correcto

  });

  it('should navigate back to dashboard', () => {
    const router = TestBed.inject(RouterTestingModule);
    const navigateSpy = spyOn((component as any).router, 'navigate');

    component.goBack();
    expect(navigateSpy).toHaveBeenCalledWith(['dashboard']);
  });
});
