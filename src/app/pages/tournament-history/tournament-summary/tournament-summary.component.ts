import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { BehaviorSubject, finalize } from 'rxjs';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { TournamentsService } from 'src/app/services/tournaments.service';

import { ICategory } from 'src/app/model/category.interface';
import { IModality } from 'src/app/model/modality.interface';
import { IBranch } from 'src/app/model/branch.interface';
import { ITournamentRegistration } from 'src/app/model/tournament-registration.interface';
import { ITournament } from 'src/app/model/tournament.interface';

@Component({
  selector: 'app-tournament-summary',
  templateUrl: './tournament-summary.component.html',
  styleUrls: ['./tournament-summary.component.css']
})
export class TournamentSummaryComponent implements OnInit {

  // Estado de carga
  isLoading$ = new BehaviorSubject<boolean>(false);

  // ID del torneo obtenido por ruta
  tournamentId: number | null = null;

  // Datos del torneo
  selectedTournament: ITournament | null = null;
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  branches: IBranch[] = [];

  // Jugadores registrados en el torneo
  players: ITournamentRegistration[] = [];

  // Inyección de dependencias
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly tournamentsService = inject(TournamentsService);

  ngOnInit(): void {
    // Obtener ID desde la URL
    this.tournamentId = +this.route.snapshot.paramMap.get('tournamentId')!;

    // Cargar los datos del torneo
    this.loadTournamentById(this.tournamentId);
  }

  /**
   * Carga el torneo y sus relaciones por ID
   */
  loadTournamentById(id: number): void {
    this.isLoading$.next(true);

    this.tournamentsService.getTournamentById(id)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (response) => {
          this.selectedTournament = response.data ?? null;
          this.categories = response.data?.categories ?? [];
          this.modalities = response.data?.modalities ?? [];
          this.branches = response.data?.branches ?? [];
          this.players = response.data?.tournamentRegistrations ?? [];

          if (!this.selectedTournament) {
            Swal.fire('Atención', 'No se encontró el torneo solicitado', 'info');
          }
        },
        error: (err) => {
          console.error('Error al cargar torneo:', err);
          Swal.fire('Error', 'No se pudo cargar el torneo', 'error');
        }
      });
  }

  getPlayersCountByCategory(categoryId: number): number {
    return this.players.filter(p => p.categoryId === categoryId).length;
  }

  /**
   * Volver a la página anterior
   */
  goBack(): void {
    this.location.back();
  }
}
