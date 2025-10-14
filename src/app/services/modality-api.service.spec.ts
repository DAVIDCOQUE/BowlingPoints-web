import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ModalityApiService } from './modality-api.service';
import { IModality } from '../model/modality.interface';
import { environment } from 'src/environments/environment';

describe('ModalityApiService', () => {
  let service: ModalityApiService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/modalities`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ModalityApiService]
    });

    service = TestBed.inject(ModalityApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('debe obtener todas las modalidades (getModalities)', () => {
    const mockModalities: IModality[] = [
      { modalityId: 1, name: 'Individual', status: true },
      { modalityId: 2, name: 'Grupal', status: false }
    ];

    service.getModalities().subscribe(modalities => {
      expect(modalities.length).toBe(2);
      expect(modalities).toEqual(mockModalities);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    req.flush({
      success: true,
      message: 'Modalidades encontradas',
      data: mockModalities
    });
  });

  it('debe crear una nueva modalidad (createModality)', () => {
    const payload: Partial<IModality> = { name: 'Nueva Modalidad', status: true };

    service.createModality(payload).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({ success: true });
  });

  it('debe actualizar una modalidad (updateModality)', () => {
    const id = 1;
    const payload: Partial<IModality> = { name: 'Actualizado', status: false };

    service.updateModality(id, payload).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({ success: true });
  });

  it('debe eliminar una modalidad por ID (deleteModality)', () => {
    const id = 1;

    service.deleteModality(id).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');

    req.flush({ success: true });
  });
});
