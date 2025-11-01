import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserApiService } from './user-api.service';
import { environment } from 'src/environments/environment';
import { IUser } from '../model/user.interface';
import { IRole } from '../model/role.interface';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl;
  const usersUrl = `${apiUrl}/users`;
  const rolesUrl = `${apiUrl}/roles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserApiService],
    });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('#getUsers', () => {
    it('debe realizar un GET y devolver usuarios (mapeo correcto)', (done) => {
      const mockUsers: IUser[] = [
        {
          userId: 1,
          fullName: 'Sara Arteaga',
          fullSurname: 'A.',
          email: 'sara@example.com',
          nickname: 'saraA',
          password: '123',
          roles: [],
          document: '12345',
          phone: '5551234',
          gender: 'F',
          personId: 1,
          clubId: 1,
          sub: '',
          categories: [],
        },
      ];

      const consoleSpy = spyOn(console, 'log');

      service.getUsers().subscribe((users) => {
        expect(users.length).toBe(1);
        expect(users[0].email).toBe('sara@example.com');
        expect(consoleSpy).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'ok', data: mockUsers });
    });
  });

  describe('#createUser', () => {
    it('debe realizar un POST al endpoint /users', (done) => {
      const payload: Partial<IUser> = {
        fullName: 'Nuevo Usuario',
        email: 'nuevo@example.com',
        categories: [],
      };

      service.createUser(payload).subscribe((res) => {
        expect(res).toEqual({ success: true });
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true });
    });
  });

  describe('#updateUser', () => {
    it('debe realizar un PUT al endpoint /users/:id', (done) => {
      const id = 7;
      const payload: Partial<IUser> = {
        fullName: 'Actualizado',
        categories: [],
      };

      service.updateUser(id, payload).subscribe((res) => {
        expect(res).toEqual({ success: true });
        done();
      });

      const req = httpMock.expectOne(`${usersUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true });
    });
  });

  describe('#deleteUser', () => {
    it('debe realizar un DELETE al endpoint /users/:id y retornar respuesta', (done) => {
      const id = 3;

      service.deleteUser(id).subscribe((res) => {
        expect(res).toEqual({ success: true });
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

});
