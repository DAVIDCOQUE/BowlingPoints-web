import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
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

  @ViewChild('modalCategory') modalCategoryRef: any;

  filter: string = '';
  categories: ICategory[] = [];
  idCategory: number | null = null;

  categoryForm: FormGroup = new FormGroup({});

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
  }

  initForm(): void {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  getCategories(): void {
    this.http.get<{ success: boolean; message: string; data: ICategory[] }>(`${environment.apiUrl}/categories`)
      .subscribe({
        next: res => {
          this.categories = res.data;
        },
        error: err => {
          console.error('Error al cargar categorías:', err);
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
    this.categoryForm.patchValue({ name: category.name });
    this.categoryForm.patchValue({ description: category.description });
    this.categoryForm.patchValue({ status: category.status });
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

  openModal(content: any): void {
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
