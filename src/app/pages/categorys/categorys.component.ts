import { Component, ViewChild, TemplateRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { ICategory } from '../../model/category.interface';

@Component({
  selector: 'app-categorys',
  templateUrl: './categorys.component.html',
  styleUrls: ['./categorys.component.css']
})
export class CategorysComponent {
  @ViewChild('modalCategory') modalCategoryRef!: TemplateRef<unknown>;

  // State
  filter = '';
  categories: ICategory[] = [];
  idCategory: number | null = null;

  // Form
  categoryForm: FormGroup = new FormGroup({});

  // Estado del registro
  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  // Inyecciones modernas
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly modalService = inject(NgbModal);

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
  }

  /** Inicializa el formulario reactivo */
  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  /** Consulta todas las categorías */
  getCategories(): void {
    this.http.get<{ success: boolean; message: string; data: ICategory[] }>(`${environment.apiUrl}/categories`)
      .subscribe({
        next: res => this.categories = res.data,
        error: err => console.error('Error al cargar categorías:', err)
      });
  }

  /** Devuelve las categorías filtradas */
  get filteredCategories(): ICategory[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.categories.filter(cat => cat.name.toLowerCase().includes(term))
      : this.categories;
  }

  /** Edita una categoría existente */
  editCategory(category: ICategory): void {
    this.idCategory = category.categoryId;

    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      status: category.status
    });

    this.openModal(this.modalCategoryRef);
  }

  /** Guarda (crea o actualiza) una categoría */
  saveForm(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const payload = this.categoryForm.value;
    const isEdit = !!this.idCategory;

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/categories/${this.idCategory}`, payload)
      : this.http.post(`${environment.apiUrl}/categories`, payload);

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

  /** Elimina una categoría con confirmación */
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
        this.http.delete(`${environment.apiUrl}/categories/${id}`).subscribe({
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

  /** Abre el modal de formulario */
  openModal(content: TemplateRef<unknown>): void {
    if (!this.idCategory) {
      this.categoryForm.reset();
    }
    this.modalService.open(content);
  }

  /** Cierra el modal y limpia el formulario */
  closeModal(): void {
    this.modalService.dismissAll();
    this.categoryForm.reset();
    this.idCategory = null;
  }

  /** Limpia el filtro de búsqueda */
  clear(): void {
    this.filter = '';
  }
}
