import { Component, ViewChild, TemplateRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { IModality } from '../../model/modality.interface';
import { ModalityApiService } from 'src/app/services/modality-api.service';

@Component({
  selector: 'app-modality',
  templateUrl: './modality.component.html',
  styleUrls: ['./modality.component.css']
})
export class ModalityComponent implements OnInit {

  /** Referencia al modal */
  @ViewChild('modalModality') modalModalityRef!: TemplateRef<unknown>;

  /** Lista de modalidades */
  modalitys: IModality[] = [];

  /** ID de la modalidad en edición */
  idModality: number | null = null;

  /** Filtro de búsqueda */
  filter = '';

  /** Formulario reactivo */
  modalityForm: FormGroup = new FormGroup({});

  /** Estados posibles para una modalidad */
  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  /** Inyecciones con inject() */
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly api = inject(ModalityApiService); // ✅ usamos el servicio refactorizado

  /**
   * Hook de inicialización
   */
  ngOnInit(): void {
    this.initForm();
    this.getModalitys();
  }

  /**
   * Inicializa el formulario reactivo
   */
  initForm(): void {
    this.modalityForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  /**
   * Consulta las modalidades desde la API
   */
  getModalitys(): void {
    this.api.getModalities().subscribe({
      next: res => this.modalitys = res,
      error: err => console.error('Error al cargar modalidades:', err)
    });
  }

  /**
   * Retorna la lista filtrada de modalidades
   */
  get filteredModalitys(): IModality[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.modalitys.filter(m => m.name.toLowerCase().includes(term))
      : this.modalitys;
  }

  /**
   * Carga una modalidad en el formulario para edición
   */
  editModality(modality: IModality): void {
    this.idModality = modality.modalityId;
    this.modalityForm.patchValue({
      name: modality.name,
      description: modality.description,
      status: modality.status
    });
    this.openModal(this.modalModalityRef);
  }

  /**
   * Guarda o actualiza una modalidad
   */
  saveForm(): void {
    if (this.modalityForm.invalid) {
      this.modalityForm.markAllAsTouched();
      return;
    }

    const payload = this.modalityForm.value;
    const isEdit = !!this.idModality;

    const request = isEdit
      ? this.api.updateModality(this.idModality!, payload)
      : this.api.createModality(payload);

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

  /**
   * Elimina una modalidad con confirmación
   */
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
        this.api.deleteModality(id).subscribe({
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

  /**
   * Abre el modal y limpia el formulario si es nueva modalidad
   */
  openModal(content: TemplateRef<unknown>): void {
    if (!this.idModality) {
      this.modalityForm.reset();
    }
    this.modalService.open(content);
  }

  /**
   * Cierra el modal y limpia el formulario
   */
  closeModal(): void {
    this.modalService.dismissAll();
    this.modalityForm.reset();
    this.idModality = null;
  }

  /**
   * Limpia el campo de búsqueda
   */
  clear(): void {
    this.filter = '';
  }
}
