import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategorysComponent } from './categorys.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ICategory } from '../../model/category.interface';
import { CategoryApiService } from 'src/app/services/category-api.service';
import { of } from 'rxjs';
import { TemplateRef } from '@angular/core';

describe('CategorysComponent', () => {
  let component: CategorysComponent;
  let fixture: ComponentFixture<CategorysComponent>;
  let categoryService: jasmine.SpyObj<CategoryApiService>;

  const modalMock = {
    open: jasmine.createSpy('open'),
    dismissAll: jasmine.createSpy('dismissAll')
  };

  beforeEach(async () => {
    // Crear spy para el servicio
    const categoryServiceSpy = jasmine.createSpyObj('CategoryApiService', ['getCategories', 'createCategory', 'updateCategory', 'deleteCategory']);

    await TestBed.configureTestingModule({
      declarations: [CategorysComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: modalMock },
        { provide: CategoryApiService, useValue: categoryServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategorysComponent);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(CategoryApiService) as jasmine.SpyObj<CategoryApiService>;

    // Configurar respuesta por defecto
    categoryService.getCategories.and.returnValue(of([]));

    fixture.detectChanges();
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

    categoryService.getCategories.and.returnValue(of(mockCategories));
    component.getCategories();

    expect(categoryService.getCategories).toHaveBeenCalled();
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
    expect(categoryService.createCategory).not.toHaveBeenCalled();
    expect(categoryService.updateCategory).not.toHaveBeenCalled();
  });

  it('should send POST when creating new category', () => {
    component.idCategory = null;
    component.categoryForm.setValue({
      name: 'Nueva',
      description: 'Desc',
      status: true
    });

    categoryService.createCategory.and.returnValue(of({}));
    component.saveForm();

    expect(categoryService.createCategory).toHaveBeenCalled();
    expect(modalMock.dismissAll).toHaveBeenCalled();
  });

  it('should send PUT when updating existing category', () => {
    component.idCategory = 5;
    component.categoryForm.setValue({
      name: 'Editada',
      description: 'Algo',
      status: true
    });

    categoryService.updateCategory.and.returnValue(of({}));
    component.saveForm();

    expect(categoryService.updateCategory).toHaveBeenCalledWith(5, jasmine.any(Object));
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
    categoryService.deleteCategory.and.returnValue(of({}));

    component.deleteCategory(3);
    tick(); // simula la respuesta async

    expect(categoryService.deleteCategory).toHaveBeenCalledWith(3);
    expect(component.getCategories).toHaveBeenCalled();
  }));
});
