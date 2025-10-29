import {
  Component,
  ViewChild,
  TemplateRef,
  OnInit,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, finalize } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../../environments/environment';

import { ITournament } from '../../model/tournament.interface';
import { IUser } from 'src/app/model/user.interface';
import { IResults } from '../../model/result.interface';
import { ICategory } from '../../model/category.interface';
import { IModality } from '../../model/modality.interface';
import { ITournamentRegistration } from 'src/app/model/tournament-registration.interface';

import { TournamentsService } from 'src/app/services/tournaments.service';
import { UserApiService } from 'src/app/services/user-api.service';
import { ITeam } from 'src/app/model/team.interface';
import { ResultsService } from 'src/app/services/results.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-tournament-result',
  templateUrl: './tournament-result.component.html',
  styleUrls: ['./tournament-result.component.css'],
})
export class TournamentResultComponent implements OnInit {
  @ViewChild('modalResult', { static: false })
  modalResultRef!: TemplateRef<unknown>;
  @ViewChild('modalPlayer', { static: false })
  modalPlayerRef!: TemplateRef<unknown>;

  // Estado general
  isLoading$ = new BehaviorSubject<boolean>(false);
  loading = false;

  // Torneo
  tournamentId: number | null = null;
  selectedTournament: ITournament | null = null;
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  branches: any[] = [];
  teams: ITeam[] = [];

  // Jugadores registrados
  players: IUser[] = [];
  registrations: ITournamentRegistration[] = [];
  idPlayer: number | null = null;
  playerForm: FormGroup = new FormGroup({});

  // Resultados
  results: IResults[] = [];
  filteredResults: IResults[] = [];
  resultForm: FormGroup = new FormGroup({});
  idResult: number | null = null;

  public readonly laneNumbers = Array.from({ length: 12 }, (_, i) => ({
    laneNumber: i + 1,
  }));
  public readonly lineNumbers = Array.from({ length: 12 }, (_, i) => ({
    lineNumber: i + 1,
  }));
  roundNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Filtros resultados
  selectedCategory = '';
  selectedModality = '';

  // ================== FILTROS ==================
  selectedBranch = '';
  selectedRound: number | null = null;

  //  Añadir estas nuevas propiedades:
  selectedBranchPlayer = '';
  filteredRegistrations: ITournamentRegistration[] = [];

  // Extras
  readonly estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' },
  ];
  selectedFile: File | null = null;

  // Inyecciones
  private readonly apiUrl = environment.apiUrl;
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(NgbModal);
  private readonly userApiService = inject(UserApiService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly resultsService = inject(ResultsService);
  private readonly location = inject(Location);

  // ================== CICLO DE VIDA ==================
  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('tournamentId');
    this.tournamentId = idFromRoute ? Number(idFromRoute) : null;

    if (this.tournamentId) {
      this.loadTournamentById(this.tournamentId);
    }

    this.initPlayerForm();
    this.initResultForm();
    this.loadRegisteredPlayers();
    this.loadPlayers();
    this.loadResults();
  }

  // ================== TORNEO ==================

  loadTournamentById(id: number): void {
    this.isLoading$.next(true);
    this.tournamentsService
      .getTournamentById(id)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (tournament) => {
          this.selectedTournament = tournament.data;
          this.categories = tournament.data?.categories || [];
          this.modalities = tournament.data?.modalities || [];
          this.branches = tournament.data?.branches || [];

          if (!this.selectedTournament) {
            Swal.fire(
              'Atención',
              'No se encontró el torneo solicitado',
              'info'
            );
          }
        },
        error: (err) => {
          console.error('Error al cargar torneo:', err);
          Swal.fire('Error', 'No se pudo cargar el torneo', 'error');
        },
      });
  }

  // ================== JUGADORES REGISTRADOS ==================

  loadPlayers(): void {
    this.userApiService.getUsers().subscribe({
      next: (res) => (this.players = res ?? []),
      error: (err) => console.error('Error al cargar jugadores:', err),
    });
  }

  loadRegisteredPlayers(): void {
    if (!this.tournamentId) return;

    this.http
      .get<ITournamentRegistration[]>(
        `${this.apiUrl}/registrations/tournament/${this.tournamentId}`
      )
      .subscribe({
        next: (res) => (this.registrations = res || []),
        error: (err) => {
          console.error('Error al cargar jugadores registrados:', err);
          Swal.fire(
            'Error',
            'No se pudieron cargar los jugadores registrados',
            'error'
          );
        },
      });
  }

  initPlayerForm(): void {
    this.playerForm = this.fb.group({
      personId: [null, Validators.required],
      categoryId: [null, Validators.required],
      modalityId: [null, Validators.required],
      branchId: [null, Validators.required],
      teamId: [null],
      status: [true, Validators.required],
    });
  }

  initResultForm(): void {
    this.resultForm = this.fb.group({
      personId: [null],
      teamId: [null],
      tournamentId: [this.tournamentId, Validators.required],
      categoryId: [null, Validators.required],
      modalityId: [null, Validators.required],
      branchId: [null, Validators.required],
      roundId: [null, Validators.required],
      laneNumber: [null, Validators.required],
      lineNumber: [null, Validators.required],
      score: [null, Validators.required],
    });
  }

  openModal(content: TemplateRef<unknown>): void {
    if (!content) return;

    switch (content) {
      case this.modalPlayerRef:
        if (!this.idPlayer) this.initPlayerForm();
        break;

      case this.modalResultRef:
        if (!this.idResult) this.initResultForm();
        break;
    }

    this.modalService.open(content, { size: 'lg' });
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.idPlayer = this.idResult = null;
  }

  editPlayer(reg: ITournamentRegistration): void {
    this.idPlayer = reg.registrationId;
    this.fillPlayerForm(reg);
    this.openModal(this.modalPlayerRef);
  }

  savePlayer(): void {
    const INVALID_FORM_MSG = 'Formulario inválido o torneo no definido';

    if (!this.tournamentId || this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      Swal.fire('Error', INVALID_FORM_MSG, 'error');
      return;
    }

    const payload = {
      tournamentId: this.tournamentId,
      ...this.playerForm.value,
    };

    const isEdit = !!this.idPlayer;
    const request = isEdit
      ? this.http.put(`${this.apiUrl}/registrations/${this.idPlayer}`, payload)
      : this.http.post(`${this.apiUrl}/registrations`, payload);

    this.loading = true;
    request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => this.handlePlayerSuccess(isEdit),
      error: (err) => this.handlePlayerError(err),
    });
  }

  private handlePlayerSuccess(isEdit: boolean): void {
    Swal.fire(
      'Éxito',
      isEdit ? 'Jugador actualizado' : 'Jugador agregado',
      'success'
    );
    this.closeModal();
    this.loadRegisteredPlayers();
  }

  private handlePlayerError(err: any): void {
    console.error('Error al guardar jugador:', err);
    const msg = err.error?.message || 'No se pudo guardar el jugador';
    Swal.fire('Error', msg, 'error');
  }

  deletePlayer(registrationId: number): void {
    Swal.fire({
      title: '¿Eliminar jugador del torneo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((dlg) => {
      if (dlg.isConfirmed) {
        this.http
          .delete(`${this.apiUrl}/registrations/${registrationId}`)
          .subscribe({
            next: () => {
              Swal.fire(
                'Eliminado',
                'Jugador eliminado correctamente',
                'success'
              );
              this.loadRegisteredPlayers();
            },
            error: () =>
              void Swal.fire(
                'Error',
                'No se pudo eliminar el jugador',
                'error'
              ),
          });
      }
    });
  }

  // ================== RESULTADOS ==================

  loadResults(): void {
    if (!this.tournamentId) return;

    const selectedBranchId = this.getSelectedBranchId();
    const selectedRoundNumber = this.selectedRound ?? undefined;

    this.resultsService
      .getResultsFiltered(
        this.tournamentId,
        selectedBranchId,
        selectedRoundNumber
      )
      .subscribe({
        next: (res) => this.handleResultsSuccess(res),
        error: (err) => this.handleResultsError(err),
      });
  }

  private getSelectedBranchId(): number | undefined {
    if (!this.selectedBranch) return undefined;
    const branch = this.branches.find(
      (b) => b.name.toLowerCase() === this.selectedBranch.toLowerCase()
    );
    return branch?.branchId;
  }

  private handleResultsSuccess(res: any): void {
    this.results = res ?? [];
    this.filteredResults = this.results;
  }

  private handleResultsError(err: any): void {
    console.error('Error al cargar resultados:', err);
    void Swal.fire('Error', 'No se pudieron cargar los resultados', 'error');
  }

  editResult(result: IResults): void {
    if (!result) {
      Swal.fire('Error', 'No se encontró información del resultado', 'error');
      return;
    }

    // Extraer valores con defaults legibles
    const {
      resultId,
      personId,
      teamId,
      tournamentId,
      categoryId,
      modalityId,
      branchId,
      roundNumber,
      laneNumber,
      lineNumber,
      score,
    } = result;

    this.idResult = resultId ?? null;

    this.resultForm.patchValue({
      personId: personId ?? null,
      teamId: teamId ?? null,
      tournamentId: tournamentId ?? null,
      categoryId: categoryId ?? null,
      modalityId: modalityId ?? null,
      branchId: branchId ?? null,
      roundNumber: roundNumber ?? null,
      laneNumber: laneNumber ?? null,
      lineNumber: lineNumber ?? null,
      score: score ?? null,
    });

    this.openModal(this.modalResultRef);
  }

  saveResult(): void {
    if (this.resultForm.invalid || !this.tournamentId) {
      this.resultForm.markAllAsTouched();
      Swal.fire('Error', 'Formulario inválido o torneo no definido', 'error');
      return;
    }

    const payload = {
      ...this.resultForm.value,
      tournamentId: this.tournamentId,
    };

    const isEdit = !!this.idResult;
    const request$ = isEdit
      ? this.http.put(`${this.apiUrl}/results/${this.idResult}`, payload)
      : this.http.post(`${this.apiUrl}/results`, payload);

    this.loading = true;

    request$.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => this.handleResultSuccess(isEdit),
      error: (err) => this.handleResultError(err),
    });
  }

  /** Maneja la respuesta exitosa */
  private handleResultSuccess(isEdit: boolean): void {
    const message = isEdit ? 'Resultado actualizado' : 'Resultado creado';
    Swal.fire('Éxito', message, 'success');
    this.closeModal();
    this.loadResults();
  }

  /** Maneja los errores */
  private handleResultError(err: any): void {
    const msg = err?.error?.message || 'No se pudo guardar el resultado';
    Swal.fire('Error', msg, 'error');
  }

  deleteResult(id?: number): void {
    if (!id) {
      Swal.fire('Error', 'ID de resultado no válido', 'error');
      return;
    }

    Swal.fire({
      title: '¿Eliminar resultado?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((dlg) => {
      if (dlg.isConfirmed) {
        this.executeDeleteResult(id);
      }
    });
  }

  /** Función privada que ejecuta la eliminación */
  private executeDeleteResult(id: number): void {
    this.http
      .delete(`${this.apiUrl}/results/${id}`)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => this.handleDeleteSuccess(),
        error: () => this.handleDeleteError(),
      });
  }

  /** Maneja éxito de eliminación */
  private handleDeleteSuccess(): void {
    Swal.fire('Eliminado', 'Resultado eliminado correctamente', 'success');
    this.loadResults();
  }

  /** Maneja error de eliminación */
  private handleDeleteError(): void {
    Swal.fire('Error', 'No se pudo eliminar el resultado', 'error');
  }

  // ================== FILTROS ==================

  onFilterChange(): void {
    this.loadResults();
  }

  /** Limpia filtros de resultados */
  clearFilters(): void {
    this.selectedBranch = '';
    this.selectedRound = null;
    this.triggerFilterReload();
  }

  /** Limpia filtros de jugadores */
  clearPlayerFilters(): void {
    this.selectedBranchPlayer = '';
    this.triggerPlayerFilterReload();
  }

  /** Centraliza recarga de filtros de resultados */
  private triggerFilterReload(): void {
    this.onFilterChange();
  }

  /** Centraliza recarga de filtros de jugadores */
  private triggerPlayerFilterReload(): void {
    this.onFilterPlayerChange();
  }

  /** Aplica filtro a registros */
  onFilterPlayerChange(): void {
    const branch = (this.selectedBranchPlayer ?? '').toLowerCase().trim();

    this.filteredRegistrations = this.registrations.filter(
      this.matchesBranch(branch)
    );
  }

  /** Función pura para mejorar legibilidad */
  private matchesBranch(branch: string) {
    return (p: any) => {
      const branchName = (p.branchName ?? '').toLowerCase();
      return !branch || branchName.includes(branch);
    };
  }

  // ================== UTILIDADES ==================

  // ================== UTILIDADES ==================

  openFileInputResults(): void {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (event: Event) => this.onFileSelected(event);
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    Swal.fire({
      icon: 'info',
      title: 'Archivo seleccionado',
      text: `Archivo: ${file.name}`,
      confirmButtonText: 'Aceptar',
    });
  }

  onImgError(event: Event, fallback: string): void {
    (event.target as HTMLImageElement).src = fallback;
  }

  goBack(): void {
    this.location.back();
  }

  private fillPlayerForm(reg: ITournamentRegistration): void {
    this.playerForm.patchValue({
      personId: reg.personId,
      categoryId: reg.categoryId,
      modalityId: reg.modalityId,
      branchId: reg.branchId,
      teamId: reg.teamId ?? null,
      status: reg.status,
    });
  }
}
