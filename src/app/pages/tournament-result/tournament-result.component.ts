import { Component, ViewChild, TemplateRef, OnInit, inject, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, finalize, forkJoin, of, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
import { IBranch } from 'src/app/model/branch.interface';
import { Location } from '@angular/common';
import { TeamApiService } from 'src/app/services/team-api.service';

// Interfaz para el response de importación
interface IImportResponse {
  created: number;
  skipped: number;
  errors: string[];
  // Opcionales para detallar registros saltados
  skippedDetails?: string[];
  skippedReasons?: string[];
  skippedMessage?: string;
}


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

  @ViewChild('modalTeam', { static: false })
  modalTeamRef!: TemplateRef<unknown>;


  private readonly IMPORT_ENDPOINTS = {
    players: '/files/tournament-registrations',
    teamPerson: '/files/team-person',
    results: '/files/results',
  };


  // Estado general
  isLoading$ = new BehaviorSubject<boolean>(false);
  loading = false;

  // Subida de archivos
  isUploadingPlayers = false;
  isUploadingResults = false;

  // Torneo
  tournamentId: number | null = null;
  selectedTournament: ITournament | null = null;
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  branches: IBranch[] = [];

  // Jugadores registrados
  registrations: ITournamentRegistration[] = [];
  filteredRegistrations: ITournamentRegistration[] = [];

  players: IUser[] = [];
  idPlayer: number | null = null;
  playerForm: FormGroup = new FormGroup({});

  // Equipo
  idTeam: number | null = null;
  teamForm: FormGroup = new FormGroup({});

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

  // ================== FILTROS ==================
  selectedBranch = '';
  selectedRound: number | null = null;

  //  Añadir estas nuevas propiedades:
  selectedBranchPlayer = '';

  // Extras
  readonly estados = [
    { valor: true, etiqueta: 'Activo' },
    { valor: false, etiqueta: 'Inactivo' },
  ];

  // Inyecciones
  private readonly apiUrl = environment.apiUrl;
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(NgbModal);
  private readonly userApiService = inject(UserApiService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly resultsService = inject(ResultsService);
  private readonly teamApi = inject(TeamApiService);
  private readonly location = inject(Location);

  // ================== CICLO DE VIDA ==================
  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('tournamentId');
    this.tournamentId = idFromRoute ? Number(idFromRoute) : null;

    if (this.tournamentId) {
      this.loadTournamentById(this.tournamentId);
    }

    this.initPlayerForm();
    this.initTeamForm();
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
    this.userApiService.getActiveUsers().subscribe({
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
        next: (res) => {
          this.registrations = res || [];
          this.filteredRegistrations = this.registrations;
          this.onFilterPlayerChange();
        },
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

  get groupedRegistrations() {
    const groups: Record<string, ITournamentRegistration[]> = {};

    for (const reg of this.filteredRegistrations) {
      const key = reg.modalityName || 'Sin modalidad';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(reg);
    }

    // Convertimos a arreglo ordenado
    return Object.entries(groups).map(([modality, players]) => ({
      modality,
      players
    }));
  }

  //  Jugadores únicos por personId
  get uniquePlayers() {
    const seen = new Set<number>();
    const unique: { personId: number; personFullName: string }[] = [];

    for (const reg of this.filteredRegistrations) {
      if (reg.personId && !seen.has(reg.personId)) {
        seen.add(reg.personId);
        unique.push({
          personId: reg.personId,
          personFullName: reg.personFullName || 'N/A',
        });
      }
    }

    return unique;
  }

  //  Equipos únicos por teamId
  get uniqueTeams() {
    const seen = new Set<number>();
    const unique: { teamId: number; nameTeam: string }[] = [];

    for (const reg of this.filteredRegistrations) {
      if (reg.teamId && reg.teamName && !seen.has(reg.teamId)) {
        seen.add(reg.teamId);
        unique.push({
          teamId: reg.teamId,
          nameTeam: reg.teamName,
        });
      }
    }

    return unique;
  }


  get hasRegistrations(): boolean {
    return this.filteredRegistrations?.length > 0;
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

  initTeamForm(): void {
    this.teamForm = this.fb.group({
      nameTeam: ['', [Validators.required]],
      phone: [''],
      playerIds: [[], [Validators.required, Validators.minLength(2)]],
      categoryId: [null, [Validators.required]],
      modalityId: [null, [Validators.required]],
      status: [true, [Validators.required]],
    });
  }

  private fillPlayerForm(reg: ITournamentRegistration): void {
    this.playerForm.patchValue({
      personId: reg.personId ?? null,
      categoryId: reg.categoryId ?? null,
      modalityId: reg.modalityId ?? null,
      branchId: reg.branchId ?? null,
      teamId: reg.teamId ?? null,
      status: reg.status ?? true,
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
      roundNumber: [null, Validators.required],
      laneNumber: [null, Validators.required],
      lineNumber: [null, Validators.required],
      score: [null, Validators.required],
    });
  }

  openModal(content: TemplateRef<unknown>): void {
    if (content === this.modalPlayerRef) {
      if (!this.idPlayer) this.initPlayerForm(); // Solo si es nuevo
    }

    if (content === this.modalResultRef) {
      if (!this.idResult) this.initResultForm(); // Solo si es nuevo
    }

    if (content === this.modalTeamRef) {
      if (!this.idTeam) this.initTeamForm(); // Solo si es nuevo
    }

    this.modalService.open(content, { size: 'lg' });
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.idPlayer = this.idResult = this.idTeam = null;
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

  editTeam(team: ITeam): void {
    this.idTeam = team.teamId;

    this.teamForm.patchValue({
      nameTeam: team.nameTeam,
      phone: team.phone,
      playerIds: team.members?.map(p => p.personId) || [],
      categoryId: team.categoryId || null,
      modalityId: team.modalityId || null,
      status: team.status,
    });

    this.openModal(this.modalTeamRef);
  }


  saveTeam(): void {
    if (this.teamForm.invalid || !this.tournamentId) {
      this.teamForm.markAllAsTouched();
      Swal.fire('Error', 'Formulario inválido o torneo no definido', 'error');
      return;
    }

    const payload = {
      ...this.teamForm.value,
      tournamentId: this.tournamentId,
    };

    const isEdit = !!this.idTeam;
    const request = isEdit
      ? this.http.put(`${this.apiUrl}/teams/${this.idTeam}`, payload)
      : this.http.post(`${this.apiUrl}/teams`, payload);

    this.loading = true;

    request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        Swal.fire(
          'Éxito',
          isEdit ? 'Equipo actualizado correctamente' : 'Equipo creado correctamente',
          'success'
        );
        this.closeModal();
        this.loadRegisteredPlayers();
      },
      error: (err) => {
        console.error('Error al guardar equipo:', err);
        Swal.fire('Error', err.error?.message || 'No se pudo guardar el equipo', 'error');
      },
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

    const selectedBranchId = this.selectedBranch
      ? this.branches.find(b => b.name.toLowerCase() === this.selectedBranch.toLowerCase())?.branchId
      : undefined;

    const selectedRoundNumber = this.selectedRound ?? undefined;

    this.resultsService.getResultsFiltered(this.tournamentId, selectedBranchId, selectedRoundNumber)
      .subscribe({
        next: (res) => {
          this.results = res ?? [];
          this.filteredResults = this.results;
        },
        error: (err) => {
          console.error('Error al cargar resultados:', err);
          Swal.fire('Error', 'No se pudieron cargar los resultados', 'error');
        }
      });
  }


  editResult(result: IResults): void {
    this.idResult = result.resultId ?? null;
    this.resultForm.patchValue({
      personId: result.personId ?? null,
      teamId: result.teamId ?? null,
      tournamentId: result.tournamentId,
      categoryId: result.categoryId,
      modalityId: result.modalityId,
      branchId: result.branchId ?? null,
      roundNumber: result.roundNumber ?? null,
      laneNumber: result.laneNumber,
      lineNumber: result.lineNumber,
      score: result.score,
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

    // VALIDACIÓN SEGÚN NUEVA LÓGICA DE NEGOCIO (igual que el backend)
    if (!payload.personId && !payload.teamId) {
      Swal.fire('Error', 'Debe seleccionar al menos un jugador o un equipo.', 'error');
      return;
    }

    if (!payload.personId && payload.teamId) {
      Swal.fire('Error', 'Debe seleccionar un jugador cuando se elige un equipo.', 'error');
      return;
    }

    //  Si pasa las validaciones, se envía al backend
    const isEdit = !!this.idResult;
    const request$ = isEdit
      ? this.http.put(`${this.apiUrl}/results/${this.idResult}`, payload)
      : this.http.post(`${this.apiUrl}/results`, payload);

    this.loading = true;

    request$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
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

  onTeamPersonFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadFile(
      this.IMPORT_ENDPOINTS.teamPerson,
      file,
      () => (this.loading = true),
      () => (this.loading = false),
      () => {
        this.loadRegisteredPlayers();
      }
    );
  }

  onResultFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadFile(
      this.IMPORT_ENDPOINTS.results,
      file,
      () => (this.isUploadingResults = true),
      () => (this.isUploadingResults = false),
      () => {
        this.loadResults();
      }
    );
  }



  onFilterChange(): void {
    this.loadResults();
  }

  clearFilters(): void {
    this.selectedBranch = '';
    this.selectedRound = null;
    this.onFilterChange();
  }

  onFilterPlayerChange(): void {
    const branch = (this.selectedBranchPlayer || '').toLowerCase().trim();

    this.filteredRegistrations = this.registrations.filter(p => {
      const matchBranch = !branch || (p.branchName || '').toLowerCase().includes(branch);
      return matchBranch;
    });
  }

  clearPlayerFilters(): void {
    this.selectedBranchPlayer = '';
    this.onFilterPlayerChange();
  }

  private uploadFile(
    endpoint: string,
    file: File,
    onStart: () => void,
    onFinish: () => void,
    onSuccess: () => void
  ): void {

    const validExtensions = ['xlsx', 'xls', 'csv'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !validExtensions.includes(extension)) {
      Swal.fire('Error', 'Solo se permiten archivos Excel o CSV', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const params = {
      skipHeader: 'true',
      userId: '1', // luego lo puedes sacar del token
    };

    onStart();

    this.http
      .post<IImportResponse>(`${this.apiUrl}${endpoint}`, formData, { params })
      .pipe(finalize(() => onFinish()))
      .subscribe({
        next: (response) => {
          this.handleImportResponse(response, onSuccess, endpoint);
        },
        error: (err) => {
          console.error('Error importando archivo:', err);
          Swal.fire(
            'Error',
            err?.error?.message || 'No se pudo importar el archivo',
            'error'
          );
        },
      });
  }

  private handleImportResponse(response: IImportResponse, onSuccess: () => void, sourceEndpoint?: string): void {
    const { created, skipped, errors } = response;
    const skippedDetails = response.skippedDetails ?? response.skippedReasons ?? [];
    const skippedMessage = response.skippedMessage;
    const total = created + skipped + errors.length;
    const hasErrors = errors && errors.length > 0;

    // Detectar equipos faltantes sólo para importación de team-person
    const isTeamPerson = sourceEndpoint === this.IMPORT_ENDPOINTS.teamPerson;
    const missingTeams = isTeamPerson ? this.extractMissingTeams(errors) : [];

    // Construir HTML para el modal (estilos embebidos para consistencia)
    let htmlContent = `
      <style>
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat-card { padding: 14px; border-radius: 12px; min-height: 110px; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: default; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04); }
        .stat-card.clickable { cursor: pointer; transition: transform 120ms ease, box-shadow 120ms ease; }
        .stat-card.clickable:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        .stat-number { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .stat-label { font-size: 13px; margin: 0; color: #6c757d; }
        .created { background: #e8f7ee; color: #198754; }
        .skipped { background: #fff5e5; color: #f59f00; }
        .errors { background: #ffe5e9; color: #d6336c; }
      </style>
      <div class="import-summary text-start">
        <div class="summary-stats mb-4">
          <div class="stat-grid">
            <div class="stat-card created">
              <div class="stat-number">${created}</div>
              <p class="stat-label">Registros creados</p>
            </div>
            <div class="stat-card skipped ${skipped > 0 ? 'clickable' : ''}" ${skipped > 0 ? 'data-target="skipped-section"' : ''}>
              <div class="stat-number">${skipped}</div>
              <p class="stat-label">Registros saltados</p>
            </div>
            <div class="stat-card errors ${hasErrors ? 'clickable' : ''}" ${hasErrors ? 'data-target="errors-section"' : ''}>
              <div class="stat-number">${errors.length}</div>
              <p class="stat-label">Errores encontrados</p>
            </div>
          </div>
        </div>
    `;

    // Sección de detalle para registros saltados
    if (skipped > 0) {
      const hasSkippedDetails = skippedDetails.length > 0;
      htmlContent += `
        <hr>
        <div id="skipped-section">
          <h4 class="text-warning fw-bold mb-3">⚠️ Registros saltados</h4>
          <div class="text-muted small mb-2">
            ${skippedMessage || 'Generalmente se omiten porque ya existen en el sistema.'}
          </div>
        </div>
      `;

      if (hasSkippedDetails) {
        htmlContent += `
          <div class="skipped-list" style="max-height: 240px; overflow-y: auto;">
            <ul class="list-group list-group-flush">
        `;
        skippedDetails.forEach((detail) => {
          htmlContent += `
              <li class="list-group-item px-0 py-2 border-0 text-warning small">
                <i class="bi bi-info-circle me-2"></i>${this.escapeHtml(detail)}
              </li>
          `;
        });
        htmlContent += `
            </ul>
          </div>
        `;
      }
    }

    // Agregar sección de errores si existen
    if (hasErrors) {
      htmlContent += `
        <hr>
        <div id="errors-section">
          <h6 class="text-danger fw-bold mb-3">📋 Detalle de Errores:</h6>
          <div class="error-list" style="max-height: 300px; overflow-y: auto;">
            <ul class="list-group list-group-flush">
      `;
      errors.forEach((error) => {
        htmlContent += `
          <li class="list-group-item px-0 py-2 border-0 text-danger small">
            <i class="bi bi-exclamation-circle me-2"></i>${this.escapeHtml(error)}
          </li>
        `;
      });
      htmlContent += `
            </ul>
          </div>
        </div>
      `;
    }

    htmlContent += `</div>`;

    // Mostrar modal con SweetAlert2
    Swal.fire({
      title: `📊 Resultado de Importación`,
      html: htmlContent,
      icon: hasErrors && created === 0 ? 'error' : (hasErrors ? 'warning' : 'success'),
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Aceptar',
      width: '600px',
      showDenyButton: missingTeams.length > 0,
      denyButtonText: 'Crear equipos faltantes',
      didOpen: (el) => {
        const cards = el.querySelectorAll<HTMLElement>('.stat-card.clickable');
        cards.forEach((card) => {
          card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            if (!targetId) return;
            const target = el.querySelector<HTMLElement>(`#${targetId}`);
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      },
    }).then(async (result) => {
      if (result.isDenied && missingTeams.length > 0) {
        await this.createMissingTeams(missingTeams);
      }
      if (result.isConfirmed && created > 0) {
        onSuccess();
      }
    });
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Extrae nombres de equipos faltantes desde mensajes de error
  private extractMissingTeams(errors: string[]): string[] {
    const teamNames = new Set<string>();
    const patterns = [
      /no\s+existe\s+team\s+con\s+nombre\s*=\s*(.+)$/i,
      /no\s+existe\s+equipo\s+con\s+nombre\s*=\s*(.+)$/i
    ];
    errors.forEach((msg) => {
      const cleaned = msg.replace(/^\s*L[ií]nea\s*\d+\s*:\s*/i, '').trim();
      for (const re of patterns) {
        const m = cleaned.match(re);
        if (m && m[1]) {
          teamNames.add(m[1].trim());
          break;
        }
      }
    });
    return Array.from(teamNames);
  }

  // Crea equipos faltantes contra el endpoint de equipos
  private async createMissingTeams(names: string[]): Promise<void> {
    if (!names.length) return;
    Swal.fire({
      title: 'Creando equipos…',
      html: '<div class="text-muted">Esto puede tardar unos segundos.</div>',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const requests = names.map((name) =>
      this.teamApi.createTeam({ nameTeam: name, status: true }).pipe(catchError(() => of(null)))
    );

    try {
      const results = await lastValueFrom(forkJoin(requests));
      const createdCount = (results || []).filter(Boolean).length;
      await Swal.fire({
        icon: 'success',
        title: 'Equipos creados',
        html: `<div class="text-start"><b>${createdCount}</b> de <b>${names.length}</b> equipos fueron creados.<br><small>Si deseas, vuelve a importar para vincular jugadores.</small></div>`,
        confirmButtonText: 'Aceptar'
      });
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'Error creando equipos', text: 'No se pudieron crear los equipos.' });
    }
  }



  onPlayersFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadFile(
      this.IMPORT_ENDPOINTS.players,
      file,
      () => (this.isUploadingPlayers = true),
      () => (this.isUploadingPlayers = false),
      () => {
        this.loadPlayers();
        this.loadRegisteredPlayers();
      }
    );
  }

  onImgError(event: Event, fallback: string): void {
    (event.target as HTMLImageElement).src = fallback;
  }

  goBack(): void {
    this.location.back();
  }
}
