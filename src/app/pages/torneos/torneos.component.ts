import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

// Interfaces
import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { ICategory } from 'src/app/model/category.interface';

// Validator
import { dateRangeValidator } from 'src/app/shared/validators/date-range.validator';

@Component({
  selector: 'app-torneos',
  templateUrl: './torneos.component.html',
  styleUrls: ['./torneos.component.css'],
})
export class TorneosComponent implements OnInit {

  /** Refs a modales */
  @ViewChild('modalTournament') modalTournamentRef!: unknown;
  @ViewChild('modalSetResultTournament') modalSetResultTournamentRef!: unknown;

  /** Inyecciones modernas */
  public readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly modalService = inject(NgbModal);

  /** API base */
  readonly apiUrl = environment.apiUrl;

  /** Estado general */
  filter = '';
  idTournament: number | null = null;
  selectedTournament: ITournament | null = null;

  tournaments: ITournament[] = [];
  modalities: IModality[] = [];
  categories: ICategory[] = [];
  ambits: IAmbit[] = [];
  departments: { id: number; name: string }[] = [];

  tournamentForm: FormGroup = new FormGroup({});

  /** Estados de torneo */
  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' },
  ];

  /** Causas de estado */
  causes = [
    { causeId: 1, name: 'Programado' },
    { causeId: 2, name: 'En curso' },
    { causeId: 3, name: 'Aplazado' },
    { causeId: 4, name: 'Finalizado' },
    { causeId: 5, name: 'Cancelado' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.getTournaments();
    this.getModalitys();
    this.getCategories();
    this.getDepartments();
    this.getAmbits();
  }

  /** Inicializa el formulario reactivo con validaciones */
  initForm(): void {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      organizer: ['', Validators.required],
      modalityIds: ['', Validators.required],
      categoryIds: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      ambitId: ['', Validators.required],
      location: [''],
      stage: ['', Validators.required],
      status: ['', Validators.required],
    }, {
      validators: dateRangeValidator('startDate', 'endDate', { allowEqual: true })
    });
  }

  /** Carga torneos desde la API */
  getTournaments(): void {
    this.http.get<{ success: boolean; message: string; data: ITournament[] }>(`${this.apiUrl}/tournaments`)
      .subscribe({
        next: res => this.tournaments = res.data,
        error: err => console.error('Error al cargar torneos:', err)
      });
  }

  /** Carga departamentos desde API externa */
  getDepartments(): void {
    this.http.get<{ id: number; name: string }[]>(`https://api-colombia.com/api/v1/Department`)
      .subscribe({
        next: res => this.departments = res,
        error: err => console.error('Error al cargar departamentos:', err)
      });
  }

  /** Carga modalidades disponibles */
  getModalitys(): void {
    this.http.get<{ success: boolean; message: string; data: IModality[] }>(`${this.apiUrl}/modalities`)
      .subscribe({
        next: res => this.modalities = res.data,
        error: err => console.error('Error al cargar modalidades:', err)
      });
  }

  /** Carga categorías disponibles */
  getCategories(): void {
    this.http.get<{ success: boolean; message: string; data: ICategory[] }>(`${this.apiUrl}/categories`)
      .subscribe({
        next: res => this.categories = res.data,
        error: err => console.error('Error al cargar categorías:', err)
      });
  }

  /** Carga ámbitos disponibles */
  getAmbits(): void {
    this.http.get<{ success: boolean; message: string; data: IAmbit[] }>(`${this.apiUrl}/ambits`)
      .subscribe({
        next: res => this.ambits = res.data,
        error: err => console.error('Error al cargar ámbitos:', err)
      });
  }

  /** Devuelve torneos filtrados por término de búsqueda */
  get filteredTournaments(): ITournament[] {
    const term = this.filter.toLowerCase().trim();
    return term
      ? this.tournaments.filter(t => t.tournamentName.toLowerCase().includes(term))
      : this.tournaments;
  }

  /** Abre el modal para editar torneo */
  editTournament(tournament: ITournament): void {
    this.idTournament = tournament.tournamentId;

    const categoryIds = tournament.categories?.map(c => c.categoryId) ?? [];
    const modalityIds = tournament.modalities?.map(m => m.modalityId) ?? [];

    this.tournamentForm.patchValue({
      name: tournament.tournamentName,
      organizer: tournament.organizer,
      categoryIds,
      modalityIds,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      ambitId: tournament.ambit,
      location: tournament.location,
      stage: tournament.stage,
      status: tournament.status
    });

    this.tournamentForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });
    this.openModal(this.modalTournamentRef);
  }

  /** Guarda un torneo nuevo o actualizado */
  saveForm(): void {
    if (this.tournamentForm.invalid) {
      this.tournamentForm.markAllAsTouched();
      return;
    }

    const payload = this.tournamentForm.value;
    const isEdit = !!this.idTournament;

    const request = isEdit
      ? this.http.put(`${this.apiUrl}/tournaments/${this.idTournament}`, payload)
      : this.http.post(`${this.apiUrl}/tournaments`, payload);

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Torneo actualizado' : 'Torneo creado', 'success');
        this.getTournaments();
        this.closeModal();
      },
      error: err => {
        console.error('Error al guardar torneo:', err);
        Swal.fire('Error', err.error?.message || 'Algo salió mal', 'error');
      }
    });
  }

  /** Elimina un torneo con confirmación */
  deleteTournament(id: number): void {
    Swal.fire({
      title: '¿Eliminar torneo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/tournaments/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Torneo eliminado correctamente', 'success');
            this.getTournaments();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el torneo', 'error');
          }
        });
      }
    });
  }

  /** Abre modal para asignar resultados */
  openModalSetResultTournament(tournament: ITournament): void {
    this.selectedTournament = tournament;
    this.modalService.open(this.modalSetResultTournamentRef, { size: 'xl' });
  }

  /** Abre modal y limpia formulario si es nuevo */
  openModal(content: unknown): void {
    if (!this.idTournament) {
      this.tournamentForm.reset();
    }
    this.modalService.open(content);
  }

  /** Cierra el modal activo y reinicia el formulario */
  closeModal(): void {
    this.modalService.dismissAll();
    this.tournamentForm.reset();
    this.idTournament = null;
  }

  /** Limpia el término del filtro */
  clear(): void {
    this.filter = '';
  }

  /** Retorna string de modalidades */
  getModalitiesString(tournament: ITournament): string {
    return tournament?.modalities?.map(m => m.name).join(', ') || '-';
  }

  /** Retorna string de categorías */
  getCategoriesString(tournament: ITournament): string {
    return tournament?.categories?.map(c => c.name).join(', ') || '-';
  }

  /**
   * Formatea fechas a YYYY-MM-DD
   */
  toYMDStrict(value: unknown): string | null {
    if (!value) return null;

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return null;
    }

    if (isNaN(date.getTime())) return null;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
  }
}
