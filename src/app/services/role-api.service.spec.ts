import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RoleApiService } from './role-api.service';
import { IRole } from '../model/role.interface';
import { environment } from 'src/environments/environment';

describe('RoleApiService', () => {
  let service: RoleApiService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/roles`;

  const mockRole: IRole = {
    roleId: 1,
    description: 'ADMIN',
    permissions: [
      { permissionId: 1, name: 'CREATE_USERS' }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoleApiService]
    });

    service = TestBed.inject(RoleApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all roles', () => {
    service.getAll().subscribe((roles) => {
      expect(roles.length).toBe(1);
      expect(roles).toEqual([mockRole]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'List fetched', data: [mockRole] });
  });

  it('should get a role by id', () => {
    const id = 1;
    service.getById(id).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'Fetched', data: mockRole });
  });

  it('should create a new role', () => {
    const payload: Partial<IRole> = {
      description: 'NEW_ROLE'
    };

    service.create(payload).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Created', data: mockRole });
  });

  it('should update a role', () => {
    const id = 1;
    const payload: Partial<IRole> = { description: 'UPDATED_ROLE' };

    service.update(id, payload).subscribe((role) => {
      expect(role).toEqual(mockRole);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, message: 'Updated', data: mockRole });
  });

  it('should delete a role', () => {
    const id = 1;

    service.delete(id).subscribe((res) => {
      expect(res).toBeFalsy();// delete returns void
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // DELETE responses are usually empty
  });
});
