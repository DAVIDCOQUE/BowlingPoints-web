import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

// Interfaces
import { ITournament } from '../../model/tournament.interface';
import { IModality } from '../../model/modality.interface';
import { IAmbit } from 'src/app/model/ambit.interface';
import { ICategory } from 'src/app/model/category.interface';

// Servicios
import { TournamentsService } from 'src/app/services/tournaments.service';

// Validator
import { dateRangeValidator } from 'src/app/shared/validators/date-range.validator';
import { BranchesService } from 'src/app/services/branch-api.service';
import { IBranch } from 'src/app/model/branch.interface';

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css'],
})
export class TournamentsComponent implements OnInit {
  @ViewChild('modalTournament') modalTournamentRef!: unknown;
  @ViewChild('modalSetResultTournament') modalSetResultTournamentRef!: unknown;

  private readonly tournamentsService = inject(TournamentsService);
  private readonly branchesService = inject(BranchesService);
  private readonly modalService = inject(NgbModal);
  public readonly fb = inject(FormBuilder);

  filter = '';
  idTournament: number | null = null;
  selectedTournament: ITournament | null = null;

  tournaments: ITournament[] = [];
  modalities: IModality[] = [];
  categories: ICategory[] = [];
  branches: IBranch[] = [];
  ambits: IAmbit[] = [];
  departments: { id: number; name: string }[] = [];

  tournamentForm: FormGroup = new FormGroup({});

  estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' },
  ];

  causes = [
    { causeId: 1, name: 'Programado' },
    { causeId: 2, name: 'En curso' },
    { causeId: 3, name: 'Aplazado' },
    { causeId: 4, name: 'Finalizado' },
    { causeId: 5, name: 'Cancelado' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  loadData(): void {
    this.getTournaments();
    this.getModalitys();
    this.getBranches();
    this.getCategories();
    this.getDepartments();
    this.getAmbits();
  }

  initForm(): void {
    this.tournamentForm = this.fb.group(
      {
        name: ['', Validators.required],
        organizer: ['', Validators.required],
        modalityIds: ['', Validators.required],
        categoryIds: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        ambitId: ['', Validators.required],
        branchIds: ['', Validators.required],
        location: [''],
        stage: ['', Validators.required],
        status: ['', Validators.required],
      },
      {
        validators: dateRangeValidator('startDate', 'endDate', {
          allowEqual: true,
        }),
      }
    );
  }

  getTournaments(): void {
    this.tournamentsService.getTournaments().subscribe({
      next: (res) => {
        console.log('Respuesta de getTournaments:', res);
        this.tournaments = res.data;
        console.log('this.tournaments después de asignar:', this.tournaments);
      },
      error: (err) => console.error('Error al cargar torneos:', err),
    });
  }

  getModalitys(): void {
    this.tournamentsService.getModalities().subscribe({
      next: (res) => (this.modalities = res.data),
      error: (err) => console.error('Error al cargar modalidades:', err),
    });
  }

  getCategories(): void {
    this.tournamentsService.getCategories().subscribe({
      next: (res) => (this.categories = res.data),
      error: (err) => console.error('Error al cargar categorías:', err),
    });
  }

  getAmbits(): void {
    this.tournamentsService.getAmbits().subscribe({
      next: (res) => (this.ambits = res.data),
      error: (err) => console.error('Error al cargar ámbitos:', err),
    });
  }

  getBranches(): void {
    this.branchesService.getAll().subscribe({
      next: (res) => {
        console.log('Respuesta de getBranches - data:', res);
        this.branches = res;
      },
      error: (err) => console.error('Error al cargar ramas:', err),
    });
  }

  getDepartments(): void {
    this.tournamentsService.getDepartments().subscribe({
      next: (res) => (this.departments = res),
      error: (err) => console.error('Error al cargar departamentos:', err),
    });
  }

  /** Devuelve tournaments filtrados por término de búsqueda */
  get filteredTournaments(): ITournament[] {
    const term = (this.filter || '').toLowerCase().trim();
    if (!term) return this.tournaments || [];

    return (this.tournaments || []).filter((t) => {
      const displayName = (t as any)?.name ?? (t as any)?.tournamentName ?? '';
      return String(displayName).toLowerCase().includes(term);
    });
  }

  /** Abre el modal para editar torneo */
  editTournament(tournament: ITournament): void {
    this.idTournament = tournament?.tournamentId ?? null;

    // Normalizar ids (si vienen como objetos, extraerlos; si ya son ids, dejarlos)
    const categoryIds = (tournament as any)?.categories
      ? (tournament as any).categories.map((c: any) => c?.categoryId ?? c)
      : (tournament as any)?.categoryIds ?? [];

    const modalityIds = (tournament as any)?.modalities
      ? (tournament as any).modalities.map((m: any) => m?.modalityId ?? m)
      : (tournament as any)?.modalityIds ?? [];

    // Ambit puede venir como objeto o como id
    const ambitId =
      (tournament as any)?.ambit?.ambitId ??
      (tournament as any)?.ambitId ??
      (tournament as any)?.ambit ??
      '';

    // Branch puede venir como objeto o como id
    const branchIds = (tournament as any)?.branches
      ? (tournament as any).branches.map((b: any) => b?.branchId ?? b)
      : (tournament as any)?.branchIds ?? [];

    // name puede venir como name o tournamentName
    const name =
      (tournament as any)?.name ?? (tournament as any)?.tournamentName ?? '';

    this.tournamentForm.patchValue({
      name,
      organizer: tournament?.organizer ?? '',
      categoryIds,
      modalityIds,
      startDate: this.toYMDStrict((tournament as any)?.startDate) ?? '',
      endDate: this.toYMDStrict((tournament as any)?.endDate) ?? '',
      ambitId,
      branchIds,
      location: tournament?.location ?? '',
      stage: tournament?.stage ?? '',
      status: tournament?.status ?? false,
    });

    this.tournamentForm.updateValueAndValidity({
      onlySelf: false,
      emitEvent: false,
    });

    this.openModal(this.modalTournamentRef);
  }

  saveForm(): void {
    if (this.tournamentForm.invalid) {
      this.tournamentForm.markAllAsTouched();
      return;
    }

    const raw = this.tournamentForm.value;

    const payload = {
      ...raw,
      ambitId: this.isAmbitValid(raw.ambitId)
        ? Number(raw.ambitId)
        : raw.ambitId,
      branchIds: raw.branchIds?.map(Number) ?? [],
    };

    const isEdit = !!this.idTournament;
    const request = isEdit
      ? this.tournamentsService.updateTournament(this.idTournament!, payload)
      : this.tournamentsService.createTournament(payload);

    request.subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          isEdit ? 'Torneo actualizado' : 'Torneo creado',
          'success'
        );
        this.getTournaments();
        this.closeModal();
      },
      error: (err) => {
        const errorMessage =
          err?.error?.message ??
          (err instanceof Error
            ? err.message
            : 'Error desconocido al guardar torneo');

        // Usa console.warn en lugar de console.error para reducir severidad y cumplir Sonar
        console.warn('Error al guardar torneo:', errorMessage);

        // Muestra el mensaje al usuario con contexto más claro
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar torneo',
          text: errorMessage,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  /** Valida que el ambitId no sea nulo ni vacío */
  private isAmbitValid(value: unknown): boolean {
    return value != null && value !== '';
  }

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
    }).then((result) => {
      if (result.isConfirmed) {
        this.tournamentsService.deleteTournament(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Torneo eliminado correctamente', 'success');
            this.getTournaments();
          },
          error: (err) => {
            const errorMessage =
              err?.error?.message ??
              (err instanceof Error
                ? err.message
                : 'Error desconocido al eliminar el torneo');

            // Registrar en consola de forma controlada
            console.warn('Error al eliminar torneo:', errorMessage);

            // Mostrar alerta clara al usuario
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar torneo',
              text: errorMessage,
              confirmButtonText: 'Aceptar',
            });
          },
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
    try {
      if (!this.idTournament) {
        this.tournamentForm.reset();
      }

      // Validar tipo de contenido antes de abrir el modal
      if (content) {
        this.modalService.open(content);
      } else {
        console.warn('No se proporcionó contenido para abrir el modal.');
      }
    } catch (error) {
      console.error('Error al abrir el modal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al abrir modal',
        text: 'No fue posible abrir el formulario. Inténtalo nuevamente.',
      });
    }
  }

  /** Cierra el modal activo y reinicia el formulario */
  closeModal(): void {
    try {
      this.modalService.dismissAll();
      this.tournamentForm.reset();
      this.idTournament = null;
    } catch (error) {
      console.error('Error al cerrar el modal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar modal',
        text: 'Ocurrió un problema al intentar cerrar el formulario.',
      });
    }
  }

  /** Limpia el término del filtro */
  clear(): void {
    this.filter = '';
  }

  getModalitiesString(tournament: ITournament): string {
    if (!tournament || !Array.isArray(tournament.modalities)) {
      return '-';
    }
    return tournament.modalities.length > 0
      ? tournament.modalities.map((m) => m.name).join(', ')
      : '-';
  }

  getCategoriesString(tournament: ITournament): string {
    if (!tournament || !Array.isArray(tournament.categories)) {
      return '-';
    }
    return tournament.categories.length > 0
      ? tournament.categories.map((c) => c.name).join(', ')
      : '-';
  }

  getBranchesString(tournament: ITournament): string {
    if (!tournament || !Array.isArray(tournament.branches)) {
      return '-';
    }
    return tournament.branches.length > 0
      ? tournament.branches.map((b) => b.name).join(', ')
      : '-';
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

    if (Number.isNaN(date.getTime())) return null;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
  }
}
