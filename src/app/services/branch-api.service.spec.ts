import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BranchesService } from './branch-api.service';
import { environment } from 'src/environments/environment';
import { IBranch } from '../model/branch.interface';

describe('BranchesService', () => {
  let service: BranchesService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/branches`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BranchesService],
    });
    service = TestBed.inject(BranchesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener todas las ramas (getAll)', () => {
    const mockBranches: IBranch[] = [
      { branchId: 1, name: 'Sucursal Norte', description: 'Ubicada al norte', status: true },
      { branchId: 2, name: 'Sucursal Sur', description: 'Ubicada al sur', status: false },
    ];

    service.getAll().subscribe((branches) => {
      expect(branches.length).toBe(2);
      expect(branches).toEqual(mockBranches);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockBranches);
  });

  it('debe obtener una rama por ID (getById)', () => {
    const mockBranch: IBranch = {
      branchId: 10,
      name: 'Sucursal Central',
      description: 'Sucursal principal',
      status: true,
    };

    service.getById(10).subscribe((branch) => {
      expect(branch).toEqual(mockBranch);
    });

    const req = httpMock.expectOne(`${apiUrl}/10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBranch);
  });

  it('debe crear una rama (create)', () => {
    const payload = { name: 'Nueva Sucursal', description: 'Sucursal nueva', status: true };
    const createdBranch: IBranch = { branchId: 3, ...payload };

    service.create(payload).subscribe((branch) => {
      expect(branch).toEqual(createdBranch);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(createdBranch);
  });

  it('debe actualizar una rama (update)', () => {
    const branch: IBranch = {
      branchId: 5,
      name: 'Sucursal Actualizada',
      description: 'Sucursal actualizada',
      status: false,
    };

    service.update(branch).subscribe((response) => {
      expect(response).toBe('Actualización exitosa');
    });

    const req = httpMock.expectOne(`${apiUrl}/${branch.branchId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(branch);
    req.flush('Actualización exitosa');
  });

  it('debe eliminar una rama (delete)', () => {
    const id = 6;

    service.delete(id).subscribe((response) => {
      expect(response).toBe('Eliminación exitosa');
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush('Eliminación exitosa');
  });
});
