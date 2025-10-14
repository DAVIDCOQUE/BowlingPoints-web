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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getUsers', () => {
    it('should GET users and map to res.data', (done) => {
      const mockUsers = [
        { userId: 1, email: 'a@a.com', name: 'A' },
        { userId: 2, email: 'b@b.com', name: 'B' },
      ] as unknown as IUser[];

      // espiamos el console.log del tap
      const logSpy = spyOn(console, 'log');

      service.getUsers().subscribe((users) => {
        expect(users.length).toBe(2);
        expect(users[0].userId).toBe(1);
        expect(logSpy).toHaveBeenCalled(); // el tap se ejecutó
        done();
      });

      const req = httpMock.expectOne(usersUrl);
      expect(req.request.method).toBe('GET');
      req.flush({
        success: true,
        message: 'ok',
        data: mockUsers,
      });
    });
  });

  describe('#createUser', () => {
    it('should POST to /users with payload', (done) => {
      const payload = { email: 'new@user.com', name: 'New' };

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
    it('should PUT to /users/:id with payload', (done) => {
      const id = 7;
      const payload: Partial<IUser> = { fullName: 'Updated' };

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
    it('should DELETE /users/:id', (done) => {
      const id = 3;

      service.deleteUser(id).subscribe((res) => {
        expect(res).toEqual({ success: true });
        done();
      });

      const req = httpMock.expectOne(`${usersUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('#getRoles', () => {
    it('should GET roles and map to res.data', (done) => {
      // ✅ IRole usa "description"
      const mockRoles: IRole[] = [
        { roleId: 1, description: 'Admin' },
        { roleId: 2, description: 'User' },
      ];

      service.getRoles().subscribe((roles) => {
        expect(roles.length).toBe(2);
        expect(roles[1].description).toBe('User'); // ✅
        done();
      });

      const req = httpMock.expectOne(rolesUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, message: 'ok', data: mockRoles });
    });
  });

});
