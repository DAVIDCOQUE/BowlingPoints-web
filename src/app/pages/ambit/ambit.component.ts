import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAmbit } from 'src/app/model/ambit.interface';
import { AmbitApiService } from 'src/app/services/ambit-api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-ambit',
  templateUrl: './ambit.component.html',
  styleUrls: ['./ambit.component.css']
})
export class AmbitComponent implements OnInit {

  @ViewChild('modalAmbit', { static: true }) modalAmbit!: TemplateRef<unknown>;

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly ambitApi = inject(AmbitApiService); // ✅ inyectar nuevo servicio

  public filter = '';
  public ambits: IAmbit[] = [];
  public idAmbit: number | null = null;

  public ambitForm: FormGroup = new FormGroup({});

  public readonly estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.getAmbits();
  }

  private initForm(): void {
    this.ambitForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  public getAmbits(): void {
    this.ambitApi.getAmbits().subscribe({
      next: ambits => this.ambits = ambits
    });
  }

  get filteredAmbits(): IAmbit[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.ambits.filter(a => a.name.toLowerCase().includes(term))
      : this.ambits;
  }

  public editAmbit(ambit: IAmbit): void {
    this.idAmbit = ambit.ambitId;
    this.ambitForm.patchValue({
      name: ambit.name,
      description: ambit.description,
      status: ambit.status
    });
    this.openModal(this.modalAmbit);
  }

  public saveForm(): void {
    if (this.ambitForm.invalid) {
      this.ambitForm.markAllAsTouched();
      return;
    }

    const payload = this.ambitForm.value;
    const isEdit = !!this.idAmbit;

    const request = isEdit
      ? this.ambitApi.updateAmbit(this.idAmbit!, payload)
      : this.ambitApi.createAmbit(payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Ambito actualizado' : 'Ambito creado', 'success');
        this.getAmbits();
        this.closeModal();
      },
      error: err => {
        console.error('Error al guardar Ambito:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
      }
    });
  }

  public deleteAmbit(id: number): void {
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
        this.ambitApi.deleteAmbit(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Ámbito eliminada correctamente', 'success');
            this.getAmbits()
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar la Ámbito', 'error');
          }
        });
      }
    });
  }

  public openModal(content: TemplateRef<unknown>): void {
    if (!this.idAmbit) {
      this.ambitForm.reset();
    }
    this.modalService.open(content);
  }

  public closeModal(): void {
    this.modalService.dismissAll();
    this.ambitForm.reset();
    this.idAmbit = null;
  }

  public clear(): void {
    this.filter = '';
  }
}
