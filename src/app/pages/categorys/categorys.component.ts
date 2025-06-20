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
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  filter: string = '';
  categories: ICategory[] = [];
  categoryForm: FormGroup = new FormGroup({});
  idCategory: number | null = null;

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
      status: ['']
    });
  }

  getCategories(): void {
    this.http.get<{ success: boolean;  message: string;data: ICategory[] }>(`${environment.apiUrl}/categories`)
      .subscribe({
        next: res => {
          this.categories = res.data;
          console.log('res:', res);

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

  openModal(content: any): void {
    if (!this.idCategory) {
      this.categoryForm.reset();
    }
    this.modalService.open(content);
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
    this.isLoading$.next(true);

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/categories/${this.idCategory}`, payload)
      : this.http.post(`${environment.apiUrl}/categories`, payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Categoría actualizada' : 'Categoría creada', 'success');
        this.getCategories();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: err => {
        console.error('Error al guardar categoría:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
        this.isLoading$.next(false);
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

  closeModal(): void {
    this.modalService.dismissAll();
    this.categoryForm.reset();
    this.idCategory = null;
  }

  search(): void {
    console.log('Filtro:', this.filter);
  }

  clear(): void {
    this.filter = '';
  }
}
