import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategorysComponent } from './categorys.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ICategory } from '../../model/category.interface';
import { environment } from 'src/environments/environment';
import { TemplateRef } from '@angular/core';

describe('CategorysComponent', () => {
  let component: CategorysComponent;
  let fixture: ComponentFixture<CategorysComponent>;
  let httpMock: HttpTestingController;

  const modalMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategorysComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      providers: [{ provide: NgbModal, useValue: modalMock }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorysComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // 🔹 Al inicializar, se hace un GET automático a categories
    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    req.flush({ success: true, message: '', data: [] });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid', () => {
    expect(component.categoryForm.valid).toBeFalse();
  });

  it('should build form correctly', () => {
    component.initForm();
    expect(component.categoryForm.contains('name')).toBeTrue();
    expect(component.categoryForm.contains('description')).toBeTrue();
    expect(component.categoryForm.contains('status')).toBeTrue();
  });

  it('should fetch categories from API', () => {
    const mockCategories: ICategory[] = [
      { categoryId: 1, name: 'Test', description: 'desc', status: true }
    ];

    component.getCategories();

    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: mockCategories });

    expect(component.categories.length).toBe(1);
    expect(component.categories[0].name).toBe('Test');
  });

  it('should patch form when editing a category', () => {
    const category: ICategory = {
      categoryId: 1,
      name: 'Test Category',
      description: 'Desc',
      status: true
    };

    component.editCategory(category);

    expect(component.idCategory).toBe(category.categoryId);
    expect(component.categoryForm.value.name).toBe(category.name);
    expect(modalMock.open).toHaveBeenCalled();
  });

  it('should reset form when opening modal to create new', () => {
    component.idCategory = null;
    component.categoryForm.setValue({
      name: 'Old Name',
      description: 'Old Desc',
      status: true
    });

    component.openModal({} as TemplateRef<unknown>);
    expect(component.categoryForm.value.name).toBeNull(); // 🔹 Se usa null porque el form se resetea así
  });

  it('should close modal and reset form', () => {
    component.idCategory = 1;
    component.categoryForm.patchValue({ name: 'Test' });

    component.closeModal();

    expect(modalMock.dismissAll).toHaveBeenCalled();
    expect(component.categoryForm.value.name).toBeNull(); // 🔹 Se usa null
    expect(component.idCategory).toBeNull();
  });

  it('should not submit invalid form', () => {
    component.saveForm();
    expect(component.categoryForm.invalid).toBeTrue();
  });

  it('should send POST when creating new category', () => {
    component.idCategory = null;
    component.categoryForm.setValue({
      name: 'Nueva',
      description: 'Desc',
      status: true
    });

    component.saveForm();

    const req = httpMock.expectOne(`${environment.apiUrl}/categories`);
    expect(req.request.method).toBe('POST');
    req.flush({});

    // 🔹 Simula el getCategories() que ocurre después del POST
    const reqReload = httpMock.expectOne(`${environment.apiUrl}/categories`);
    reqReload.flush({ success: true, message: '', data: [] });

    expect(modalMock.dismissAll).toHaveBeenCalled();
  });

  it('should send PUT when updating existing category', () => {
    component.idCategory = 5;
    component.categoryForm.setValue({
      name: 'Editada',
      description: 'Algo',
      status: true
    });

    component.saveForm();

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/5`);
    expect(req.request.method).toBe('PUT');
    req.flush({});

    // 🔹 Simula el getCategories() que ocurre después del PUT
    const reqReload = httpMock.expectOne(`${environment.apiUrl}/categories`);
    reqReload.flush({ success: true, message: '', data: [] });

    expect(modalMock.dismissAll).toHaveBeenCalled();
  });

  it('should filter categories correctly', () => {
    component.categories = [
      { categoryId: 1, name: 'Juvenil', description: '', status: true },
      { categoryId: 2, name: 'Senior', description: '', status: false }
    ];

    component.filter = 'juvenil';
    const result = component.filteredCategories;

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Juvenil');
  });

  it('should clear filter', () => {
    component.filter = 'abc';
    component.clear();
    expect(component.filter).toBe('');
  });

  it('should delete category after confirmation', fakeAsync(() => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    spyOn(component, 'getCategories');

    component.deleteCategory(3);

    tick(); // simula la respuesta async

    const req = httpMock.expectOne(`${environment.apiUrl}/categories/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(component.getCategories).toHaveBeenCalled();
  }));
});
