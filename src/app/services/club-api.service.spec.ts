import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClubApiService } from './club-api.service';
import { environment } from 'src/environments/environment';
import { IClubs } from '../model/clubs.interface';
import { IUser } from '../model/user.interface';

describe('ClubApiService', () => {
  let service: ClubApiService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/clubs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClubApiService]
    });

    service = TestBed.inject(ClubApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener clubes con miembros (getClubs)', () => {
    const mockClubs: IClubs[] = [
      {
        clubId: 1,
        name: 'Club A',
        description: 'Club deportivo',
        city: 'Ciudad A',
        foundationDate: new Date(),
        status: true,
        members: [
          {
            userId: 1,
            fullName: 'Juan Pérez',
            fullSurname: 'Pérez',
            email: 'juan@example.com',
            nickname: 'juanp',
            password: '',
            roles: [],
            categories: [],
            personId: 1,
            phone: '',
            gender: 'M',
            sub: ''
          },
          {
            userId: 2,
            fullName: 'Ana López',
            fullSurname: 'López',
            email: 'ana@example.com',
            nickname: 'anal',
            password: '',
            roles: [],
            categories: [],
            personId: 2,
            phone: '',
            gender: 'F',
            sub: ''
          }
        ]
      },
      {
        clubId: 2,
        name: 'Club B',
        city: 'Ciudad B',
        status: false,
        members: []
      }
    ];

    service.getClubs().subscribe((clubs) => {
      expect(clubs.length).toBe(2);
      expect(clubs).toEqual(mockClubs);
    });

    const req = httpMock.expectOne(`${baseUrl}/with-members`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClubs);
  });

  it('debe crear un club con miembros (createClub)', () => {
    const payload = {
      name: 'Nuevo Club',
      city: 'Ciudad C',
      members: [{ userId: 5 }, { userId: 6 }]
    };

    service.createClub(payload).subscribe((res) => {
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${baseUrl}/create-with-members`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe actualizar un club (updateClub)', () => {
    const id = 7;
    const payload = {
      name: 'Club actualizado',
      city: 'Ciudad nueva'
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
      expect(res).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${baseUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('debe exponer la URL base desde la propiedad apiUrl', () => {
    expect(service.apiUrl).toBe(environment.apiUrl);
  });
});
