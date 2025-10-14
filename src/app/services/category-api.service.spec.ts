import { TestBed } from '@angular/core/testing';
import { CategoryApiService } from './category-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { ICategory } from '../model/category.interface';

describe('CategoryApiService', () => {
  let service: CategoryApiService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/categories`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryApiService]
    });

    service = TestBed.inject(CategoryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener categorías correctamente (getCategories)', () => {
    const mockCategories: ICategory[] = [
      {
        categoryId: 1,
        name: 'Categoría A',
        description: 'Descripción A',
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        categoryId: 2,
        name: 'Categoría B',
        description: 'Descripción B',
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    service.getCategories().subscribe((categories) => {
      expect(categories.length).toBe(2);
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'Categorías obtenidas correctamente',
      data: mockCategories
    });
  });

  it('debe crear una categoría (createCategory)', () => {
    const payload: Partial<ICategory> = {
      name: 'Nueva categoría',
      description: 'Descripción de prueba',
      status: true
    };

    service.createCategory(payload).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe actualizar una categoría (updateCategory)', () => {
    const id = 3;
    const payload: Partial<ICategory> = {
      name: 'Categoría actualizada',
      status: false
    };

    service.updateCategory(id, payload).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true });
  });

  it('debe eliminar una categoría (deleteCategory)', () => {
    const id = 5;

    service.deleteCategory(id).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
