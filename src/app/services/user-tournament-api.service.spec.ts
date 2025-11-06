import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserTournamentApiService } from './user-tournament-api.service';
import { environment } from 'src/environments/environment';
import { IUserTournament } from '../model/UserTournament.interface';

describe('UserTournamentApiService', () => {
  let service: UserTournamentApiService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;

  // Mock de torneos válidos
  const mockTorneos: IUserTournament[] = [
    {
      tournamentId: 1,
      name: 'Copa Valle',
      categoria: 'A',
      date: '2025-05-01',
      imageUrl: 'https://example.com/img1.jpg',
      location: 'Cali',
      modalidad: 'Individual',
      posicionFinal: 1,
      resultados: 185,
    },
    {
      tournamentId: 2,
      name: 'Liga Cali',
      categoria: 'B',
      date: '2025-06-01',
      imageUrl: 'https://example.com/img2.jpg',
      location: 'Palmira',
      modalidad: 'Parejas',
      posicionFinal: 3,
      resultados: 190,
    },
  ];

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

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('#getTorneosJugados', () => {
    it('debe obtener torneos jugados por el usuario', (done) => {
      const userId = 5;

      service.getTorneosJugados(userId).subscribe((data) => {
        expect(data.length).toBe(2);
        expect(data[0].name).toBe('Copa Valle');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'ok', data: mockTorneos });
    });

    it('debe manejar un error HTTP al obtener torneos jugados', (done) => {
      const userId = 10;

      service.getTorneosJugados(userId).subscribe({
        next: () => fail('Se esperaba un error, no datos'),
        error: (err) => {
          expect(err.status).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      req.error(new ErrorEvent('Error de red'), { status: 500 });
    });
  });

  describe('#getTorneosInscriptos', () => {
    it('debe obtener torneos inscritos por el usuario', (done) => {
      const userId = 7;

      service.getTorneosInscriptos(userId).subscribe((data) => {
        expect(data.length).toBe(2);
        expect(data[1].name).toBe('Liga Cali');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'ok', data: mockTorneos });
    });

    it('debe manejar un error HTTP al obtener torneos inscritos', (done) => {
      const userId = 20;

      service.getTorneosInscriptos(userId).subscribe({
        next: () => fail('Se esperaba un error, no datos'),
        error: (err) => {
          expect(err.status).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/user-tournaments/${userId}/played`);
      req.error(new ErrorEvent('No encontrado'), { status: 404 });
    });
  });
});
