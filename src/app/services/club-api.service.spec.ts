import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ClubApiService } from './club-api.service';
import { environment } from 'src/environments/environment';
import { IClubs } from '../model/clubs.interface';
import { mockUser } from '../tests/mocks/mock-user';

describe('ClubApiService', () => {
  let service: ClubApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/clubs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClubApiService],
    });
    service = TestBed.inject(ClubApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener clubes (getClubs)', () => {
    const mockClubs: IClubs[] = [
      {
        clubId: 1,
        name: 'Club A',
        description: 'Club deportivo',
        city: 'Ciudad A',
        foundationDate: new Date(),
        status: true,
        imageUrl: '',
        members: [mockUser],
      },
      {
        clubId: 2,
        name: 'Club B',
        description: 'Otro club',
        city: 'Ciudad B',
        foundationDate: new Date(),
        status: false,
        imageUrl: '',
        members: [],
      },
    ];

    service.getClubs().subscribe((clubs) => {
      expect(clubs.length).toBe(2);
      expect(clubs[0].name).toBe('Club A');
      expect(clubs[1].status).toBeFalse();
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockClubs });
  });

  it('debe obtener un club por ID (getClubById)', () => {
    const id = 10;
    const mockClub: IClubs = {
      clubId: id,
      name: 'Club Central',
      description: 'Sede principal',
      city: 'Cali',
      foundationDate: new Date(),
      status: true,
      imageUrl: '',
      members: [mockUser],
    };

    service.getClubById(id).subscribe((club) => {
      expect(club.clubId).toBe(id);
      expect(club.name).toContain('Central');
      expect(club.members?.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'ok', data: mockClub });
  });

  it('debe crear un club (createClub)', () => {
    const payload = {
      name: 'Nuevo Club',
      city: 'Ciudad C',
      members: [{ userId: 5 }, { userId: 6 }],
    };

    service.createClub(payload).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe actualizar un club (updateClub)', () => {
    const id = 7;
    const payload = {
      name: 'Club actualizado',
      city: 'Ciudad nueva',
    };

    service.updateClub(id, payload).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe eliminar un club (deleteClub)', () => {
    const id = 3;

    service.deleteClub(id).subscribe((res) => {
      expect(res).toBeNull(); // Angular devuelve null si no hay body
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('debe exponer la URL base desde la propiedad apiUrl', () => {
    expect(service.apiUrl).toBe(environment.apiUrl);
  });

  it('debe manejar errores HTTP en getClubs', () => {
  let capturedError: any;

  service.getClubs().subscribe({
    next: () => fail('La llamada debería fallar'),
    error: (err) => (capturedError = err),
  });

  const req = httpMock.expectOne(baseUrl);
  expect(req.request.method).toBe('GET');

  req.flush({ message: 'Error interno' }, { status: 500, statusText: 'Server Error' });

  expect(capturedError).toBeTruthy();
  expect(capturedError.status).toBe(500);
});

});
