import { Component, ViewChild, TemplateRef, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-tournament-result',
  templateUrl: './tournament-result.component.html',
  styleUrls: ['./tournament-result.component.css']
})
export class TournamentResultComponent implements OnInit {
  @ViewChild('modalResult', { static: false }) modalResultRef!: TemplateRef<unknown>;
  @ViewChild('modalPlayer', { static: false }) modalPlayerRef!: TemplateRef<unknown>;

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

  public readonly laneNumbers = Array.from({ length: 12 }, (_, i) => ({ laneNumber: i + 1 }));
  public readonly lineNumbers = Array.from({ length: 12 }, (_, i) => ({ lineNumber: i + 1 }));
  roundNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Filtros resultados
  selectedCategory = '';
  selectedModality = '';
  selectedBranch = '';

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
        next: tournament => {
          this.selectedTournament = tournament.data;
          this.categories = tournament.data?.categories || [];
          this.modalities = tournament.data?.modalities || [];
          this.branches = tournament.data?.branches || [];

          if (!this.selectedTournament) {
            Swal.fire('Atención', 'No se encontró el torneo solicitado', 'info');
          }
        },
        error: err => {
          console.error('Error al cargar torneo:', err);
          Swal.fire('Error', 'No se pudo cargar el torneo', 'error');
        }
      });
  }

  // ================== JUGADORES REGISTRADOS ==================

  loadPlayers(): void {
    this.userApiService.getUsers().subscribe({
      next: res => (this.players = res ?? []),
      error: err => console.error('Error al cargar jugadores:', err)
    });
  }

  loadRegisteredPlayers(): void {
    if (!this.tournamentId) return;

    this.http
      .get<ITournamentRegistration[]>(`${this.apiUrl}/registrations/tournament/${this.tournamentId}`)
      .subscribe({
        next: (res) => (this.registrations = res || []),
        error: (err) => {
          console.error('Error al cargar jugadores registrados:', err);
          Swal.fire('Error', 'No se pudieron cargar los jugadores registrados', 'error');
        }
      });
  }

  initPlayerForm(): void {
    this.playerForm = this.fb.group({
      personId: [null, Validators.required],
      categoryId: [null, Validators.required],
      modalityId: [null, Validators.required],
      branchId: [null, Validators.required],
      teamId: [null],
      status: [true, Validators.required]
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
    if (content === this.modalPlayerRef) {
      this.initPlayerForm();
      this.idPlayer = null;
    }
    if (content === this.modalResultRef) {
      this.initResultForm();
      this.idResult = null;
    }
    this.modalService.open(content, { size: 'lg' });
  }

  closeModal(): void {
    this.modalService.dismissAll();
    this.idPlayer = null;
    this.idResult = null;
  }

  editPlayer(reg: ITournamentRegistration): void {
    this.idPlayer = reg.registrationId;
    this.playerForm.patchValue({
      personId: reg.personId,
      categoryId: reg.categoryId,
      modalityId: reg.modalityId,
      branchId: reg.branchId,
      teamId: reg.teamId ?? null,
      status: reg.status
    });
    this.openModal(this.modalPlayerRef);
  }

  savePlayer(): void {
    if (this.playerForm.invalid || !this.tournamentId) {
      this.playerForm.markAllAsTouched();
      Swal.fire('Error', 'Formulario inválido o torneo no definido', 'error');
      return;
    }

    const payload = {
      tournamentId: this.tournamentId,
      ...this.playerForm.value
    };

    const isEdit = !!this.idPlayer;
    const request = isEdit
      ? this.http.put(`${this.apiUrl}/registrations/${this.idPlayer}`, payload)
      : this.http.post(`${this.apiUrl}/registrations`, payload);

    this.loading = true;
    request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Jugador actualizado' : 'Jugador agregado', 'success');
        this.closeModal();
        this.loadRegisteredPlayers();
      },
      error: err => {
        console.error('Error al guardar jugador:', err);
        const msg = err.error?.message || 'No se pudo guardar el jugador';
        Swal.fire('Error', msg, 'error');
      }
    });
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
        this.http.delete(`${this.apiUrl}/registrations/${registrationId}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Jugador eliminado correctamente', 'success');
            this.loadRegisteredPlayers();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el jugador', 'error'),
        });
      }
    });
  }

  // ================== RESULTADOS ==================

  loadResults(): void {
    if (!this.tournamentId) return;

    this.http
      .get<{ success: boolean; data: IResults[] }>(`${this.apiUrl}/results/tournament/${this.tournamentId}`)
      .subscribe({
        next: res => {
          this.results = res.data ?? [];
          this.filteredResults = this.results;
        },
        error: err => console.error('Error al cargar resultados:', err)
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
      roundId: result.roundId,
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
      tournamentId: this.tournamentId
    };

    const isEdit = !!this.idResult;
    const request = isEdit
      ? this.http.put(`${this.apiUrl}/results/${this.idResult}`, payload)
      : this.http.post(`${this.apiUrl}/results`, payload);

    this.loading = true;
    request.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => {
        Swal.fire('Éxito', isEdit ? 'Resultado actualizado' : 'Resultado creado', 'success');
        this.closeModal();
        this.loadResults();
      },
      error: err => {
        console.error('Error al guardar resultado:', err);
        const msg = err.error?.message || 'No se pudo guardar el resultado';
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  deleteResult(id?: number): void {
    if (!id) return;
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
        this.http.delete(`${this.apiUrl}/results/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Resultado eliminado correctamente', 'success');
            this.loadResults();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el resultado', 'error'),
        });
      }
    });
  }

  // ================== FILTROS ==================

  onFilterChange(): void {
    const branch = (this.selectedBranch || '').toLowerCase();

    this.filteredResults = this.results.filter(r =>
      (!branch || (r.branch || '').toLowerCase() === branch)
    );
  }

  // ================== UTILIDADES ==================

  openFileInputResults(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (event) => this.onFileSelected(event as Event);
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
}
