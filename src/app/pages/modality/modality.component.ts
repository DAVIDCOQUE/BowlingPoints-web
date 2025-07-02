import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { IModality } from '../../model/modality.interface';

@Component({
  selector: 'app-modality',
  templateUrl: './modality.component.html',
  styleUrls: ['./modality.component.css']
})
export class ModalityComponent {

  @ViewChild('modalModality') modalModalityRef: any;

  filter: string = '';
  modalitys: IModality[] = [];
  idModality: number | null = null;

  modalityForm: FormGroup = new FormGroup({});

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
    this.getModalitys();
  }

  initForm(): void {
    this.modalityForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  getModalitys(): void {
    this.http.get<{ success: boolean; message: string; data: IModality[] }>(`${environment.apiUrl}/modalities`)
      .subscribe({
        next: res => {
          this.modalitys = res.data;
        },
        error: err => {
          console.error('Error al cargar modalidades:', err);
        }
      });
  }

  get filteredModalitys(): IModality[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.modalitys.filter(cat => cat.name.toLowerCase().includes(term))
      : this.modalitys;
  }

  editModality(modality: IModality): void {
    this.idModality = modality.modalityId;
    this.modalityForm.patchValue({ name: modality.name });
    this.modalityForm.patchValue({ description: modality.description });
    this.modalityForm.patchValue({ status: modality.status });
    this.openModal(this.modalModalityRef);
  }

  saveForm(): void {
    if (this.modalityForm.invalid) {
      this.modalityForm.markAllAsTouched();
      return;
    }

    const payload = this.modalityForm.value;
    const isEdit = !!this.idModality;

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/modalities/${this.idModality}`, payload)
      : this.http.post(`${environment.apiUrl}/modalities`, payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Modalidad actualizada' : 'Modalidad creada', 'success');
        this.getModalitys();
        this.closeModal();
      },
      error: err => {
        console.error('Error al guardar modalidad:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
      }
    });
  }

  deleteModality(id: number): void {
    Swal.fire({
      title: '¿Eliminar modalidad?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${environment.apiUrl}/modalities/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Modalidad eliminada correctamente', 'success');
            this.getModalitys();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la modalidad', 'error');
          }
        });
      }
    });
  }

  openModal(content: any): void {
    if (!this.idModality) {
      this.modalityForm.reset();
    }
    this.modalService.open(content);
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.modalityForm.reset();
    this.idModality = null;
  }

  clear(): void {
    this.filter = '';
  }
}
