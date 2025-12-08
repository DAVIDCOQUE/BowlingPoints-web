import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserTournamentApiService } from './user-tournament-api.service';
import { environment } from 'src/environments/environment';
import { IUserTournament } from '../model/UserTournament.interface';

describe('UserTournamentApiService', () => {
  let service: UserTournamentApiService;
  let httpMock: HttpTestingController;

  const API_URL = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserTournamentApiService]
    });

    service = TestBed.inject(UserTournamentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe hacer una petición GET y retornar los torneos agrupados', () => {
    const userId = 42;

    const mockResponse = {
      success: true,
      message: '',
      data: {
        active: [
          { tournamentId: 1, name: 'Torneo Activo' } as IUserTournament
        ],
        finished: [
          { tournamentId: 2, name: 'Torneo Finalizado' } as IUserTournament
        ]
      }
    };

    service.getTorneosAgrupados(userId).subscribe((result) => {
      expect(result.active.length).toBe(1);
      expect(result.active[0].name).toBe('Torneo Activo');

      expect(result.finished.length).toBe(1);
      expect(result.finished[0].name).toBe('Torneo Finalizado');
    });

    const req = httpMock.expectOne(`${API_URL}/user-tournaments/player/42/grouped`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse); // Respuesta simulada
  });

});
