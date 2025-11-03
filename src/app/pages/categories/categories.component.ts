import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { ICategory } from 'src/app/model/category.interface';
import { CategoryApiService } from 'src/app/services/category-api.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent {
  @ViewChild('modalCategory') modalCategoryRef!: TemplateRef<unknown>;

  // State
  filter = '';
  categories: ICategory[] = [];
  idCategory: number | null = null;

  // Form
  categoryForm: FormGroup = new FormGroup({});

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly api = inject(CategoryApiService);

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  getCategories(): void {
    this.api.getCategories().subscribe({
      next: res => this.categories = res,
      error: err => {
        console.error('Error al cargar categorías:', err);
        Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
      }
    });
  }

  get filteredCategories(): ICategory[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.categories.filter(cat => cat.name.toLowerCase().includes(term))
      : this.categories;
  }

  editCategory(category: ICategory): void {
    this.idCategory = category.categoryId;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      status: category.status
    });

    this.openModal(this.modalCategoryRef);
  }

  saveForm(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.categoryForm.value;
    const isEdit = !!this.idCategory;

    const request = isEdit
      ? this.api.updateCategory(this.idCategory!, payload)
      : this.api.createCategory(payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Categoría actualizada' : 'Categoría creada', 'success');
        this.getCategories();
        this.closeModal();
      },
      error: err => {
        console.error('Error al guardar categoría:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
      }
    });
  }

  deleteCategory(id: number): void {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.api.deleteCategory(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Categoría eliminada correctamente', 'success');
            this.getCategories();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
          }
        });
      }
    });
  }

  openModal(content: TemplateRef<unknown>): void {
    if (!this.idCategory) {
      this.categoryForm.reset();
    }
    this.modalService.open(content);
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.categoryForm.reset();
    this.idCategory = null;
  }

  clear(): void {
    this.filter = '';
  }
}
