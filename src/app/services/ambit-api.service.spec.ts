import { TestBed } from '@angular/core/testing';
import { AmbitApiService } from './ambit-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { IAmbit } from 'src/app/model/ambit.interface';

describe('AmbitApiService', () => {
  let service: AmbitApiService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/ambits`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AmbitApiService]
    });

    service = TestBed.inject(AmbitApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener ambits correctamente (getAmbits)', () => {
    const mockAmbits: IAmbit[] = [
      {
        ambitId: 1,
        name: 'Ambit A',
        description: 'First ambit',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ambitId: 2,
        name: 'Ambit B',
        description: 'Second ambit',
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    service.getAmbits().subscribe((ambits) => {
      expect(ambits.length).toBe(2);
      expect(ambits).toEqual(mockAmbits);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'Ambits fetched successfully',
      data: mockAmbits
    });
  });

  it('debe crear un ambit (createAmbit)', () => {
    const payload: Partial<IAmbit> = {
      name: 'Nuevo Ámbito',
      description: 'Descripción breve',
      status: true
    };

    service.createAmbit(payload).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe actualizar un ambit (updateAmbit)', () => {
    const id = 3;
    const payload: Partial<IAmbit> = {
      name: 'Ambit actualizado',
      status: false
    };

    service.updateAmbit(id, payload).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe eliminar un ambit (deleteAmbit)', () => {
    const id = 4;

    service.deleteAmbit(id).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
