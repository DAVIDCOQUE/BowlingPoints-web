import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { IAmbit } from 'src/app/model/ambit.interface';


@Component({
  selector: 'app-ambit',
  templateUrl: './ambit.component.html',
  styleUrls: ['./ambit.component.css']
})
export class AmbitComponent {
 @ViewChild('modalAmbit') ambitRef: any;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  filter: string = '';
  ambits: IAmbit[] = [];
  ambitForm: FormGroup = new FormGroup({});
  idAmbit: number | null = null;

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
    this.getAmbits();
  }

  initForm(): void {
    this.ambitForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      status: ['']
    });
  }

  getAmbits(): void {
    this.http.get<{ success: boolean; message: string; data: IAmbit[] }>(`${environment.apiUrl}/ambits`)
      .subscribe({
        next: res => {
          this.ambits = res.data;
          console.log('res:', res);

        },
        error: err => {
          console.error('Error al cargar ambitos:', err);
        }
      });
  }

  get filteredAmbits(): IAmbit[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.ambits.filter(cat => cat.name.toLowerCase().includes(term))
      : this.ambits;
  }

  openModal(content: any): void {
    if (!this.idAmbit) {
      this.ambitForm.reset();
    }
    this.modalService.open(content);
  }

  editAmbit(ambit: IAmbit): void {
    this.idAmbit = ambit.ambitId;
    this.ambitForm.patchValue({ name: ambit.name });
    this.ambitForm.patchValue({ description: ambit.description });
    this.ambitForm.patchValue({ status: ambit.status });
    this.openModal(this.ambitRef);
  }

  saveForm(): void {
    if (this.ambitForm.invalid) {
      this.ambitForm.markAllAsTouched();
      return;
    }

    const payload = this.ambitForm.value;
    const isEdit = !!this.idAmbit;
    this.isLoading$.next(true);

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/ambits/${this.idAmbit}`, payload)
      : this.http.post(`${environment.apiUrl}/ambits`, payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Ambito actualizada' : 'Ambito creada', 'success');
        this.getAmbits();
        this.closeModal();
        this.isLoading$.next(false);
      },
      error: err => {
        console.error('Error al guardar Ambito:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
        this.isLoading$.next(false);
      }
    });
  }

  deleteAmbit(id: number): void {
    Swal.fire({
      title: '¿Eliminar Ambito?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/ambits/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Ambito eliminada correctamente', 'success');
            this.getAmbits();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la Ambito', 'error');
          }
        });
      }
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.ambitForm.reset();
    this.idAmbit = null;
  }

  search(): void {
    console.log('Filtro:', this.filter);
  }

  clear(): void {
    this.filter = '';
  }
}
