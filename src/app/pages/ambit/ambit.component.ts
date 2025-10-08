import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { IAmbit } from 'src/app/model/ambit.interface';

@Component({
  selector: 'app-ambit',
  templateUrl: './ambit.component.html',
  styleUrls: ['./ambit.component.css']
})
export class AmbitComponent implements OnInit {

  @ViewChild('modalAmbit', { static: true }) modalAmbit!: TemplateRef<unknown>;

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  public filter = '';
  public ambits: IAmbit[] = [];
  public idAmbit: number | null = null;

  public ambitForm: FormGroup = new FormGroup({});

  public readonly estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' }
  ];

  /**
   * Lifecycle hook
   */
  ngOnInit(): void {
    this.initForm();
    this.getAmbits();
  }

  /**
   * Inicializa el formulario reactivo para ámbito
   */
  private initForm(): void {
    this.ambitForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    });
  }

  /**
   * Obtiene los ámbitos desde la API
   */
  public getAmbits(): void {
    this.http.get<{ success: boolean; message: string; data: IAmbit[] }>(
      `${environment.apiUrl}/ambits`
    ).subscribe({
      next: res => this.ambits = res.data
    });
  }

  /**
   * Retorna los ámbitos filtrados por el texto del filtro
   */
  get filteredAmbits(): IAmbit[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.ambits.filter(a => a.name.toLowerCase().includes(term))
      : this.ambits;
  }

  /**
   * Carga los datos del ámbito seleccionado para editar
   * @param ambit Ámbito seleccionado
   */
  public editAmbit(ambit: IAmbit): void {
    this.idAmbit = ambit.ambitId;
    this.ambitForm.patchValue({
      name: ambit.name,
      description: ambit.description,
      status: ambit.status
    });
    this.openModal(this.modalAmbit);
  }

  /**
   * Envía el formulario para crear o actualizar un ámbito
   */
  public saveForm(): void {
    if (this.ambitForm.invalid) {
      this.ambitForm.markAllAsTouched();
      return;
    }

    const payload = this.ambitForm.value;
    const isEdit = !!this.idAmbit;

    const request = isEdit
      ? this.http.put(`${environment.apiUrl}/ambits/${this.idAmbit}`, payload)
      : this.http.post(`${environment.apiUrl}/ambits`, payload);

    request.subscribe({
      next: () => {
        this.getAmbits();
        this.closeModal();
      }
    });
  }

  /**
   * Elimina un ámbito por su ID
   * @param id Identificador del ámbito
   */
  public deleteAmbit(id: number): void {
    this.http.delete(`${environment.apiUrl}/ambits/${id}`).subscribe({
      next: () => this.getAmbits()
    });
  }

  /**
   * Abre un modal de creación/edición
   * @param content TemplateRef del modal
   */
  public openModal(content: TemplateRef<unknown>): void {
    if (!this.idAmbit) {
      this.ambitForm.reset();
    }
    this.modalService.open(content);
  }

  /**
   * Cierra todos los modales abiertos y resetea el formulario
   */
  public closeModal(): void {
    this.modalService.dismissAll();
    this.ambitForm.reset();
    this.idAmbit = null;
  }

  /**
   * Limpia el filtro de búsqueda
   */
  public clear(): void {
    this.filter = '';
  }
}
