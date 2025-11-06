import { Component, OnInit, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { ITournament } from 'src/app/model/tournament.interface';
import { ICategory } from 'src/app/model/category.interface';
import { IModality } from 'src/app/model/modality.interface';
import { ActivatedRoute } from '@angular/router';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { BehaviorSubject, finalize } from 'rxjs';
import { ITournamentRegistration } from 'src/app/model/tournament-registration.interface';
import { IBranch } from 'src/app/model/branch.interface';

@Component({
  selector: 'app-tournament-participants',
  templateUrl: './tournament-participants.component.html',
  styleUrls: ['./tournament-participants.component.css']
})
export class TournamentParticipantsComponent implements OnInit {

  // Estado general
  isLoading$ = new BehaviorSubject<boolean>(false);

  tournamentId: number | null = null;

  selectedTournament: ITournament | null = null;
  categories: ICategory[] = [];
  modalities: IModality[] = [];
  branches: IBranch[] = [];
  players: ITournamentRegistration[] = [];

  // Cards para mostrar catálogos
  cards: { title: string; items: any[] }[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly tournamentsService = inject(TournamentsService);

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('tournamentId');
    this.tournamentId = idFromRoute ? Number(idFromRoute) : null;
    if (this.tournamentId) {
      this.loadTournamentById(this.tournamentId);
    }
  }
  //CARGA DE INFORMACIÓN
  loadTournamentById(id: number): void {
    this.isLoading$.next(true);
    this.tournamentsService
      .getTournamentById(id)
      .pipe(finalize(() => this.isLoading$.next(false)))
      .subscribe({
        next: (tournament) => {
          this.selectedTournament = tournament.data || null;
          this.categories = tournament.data?.categories || [];
          this.modalities = tournament.data?.modalities || [];
          this.branches = tournament.data?.branches || [];
          this.players = tournament.data?.tournamentRegistrations || [];

          this.buildCards();

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

  private buildCards(): void {
    this.cards = [
      { title: 'Modalidades', items: this.modalities || [] },
      { title: 'Categorías', items: this.categories || [] },
      { title: 'Ramas', items: this.branches || [] },
    ];
  }

  getStatusLabel(status: any): string {
    if (status === true) return 'Activo';
    if (status === false) return 'Inactivo';
    return 'N/D';
  }

  onImgError(event: Event, fallback: string): void {
    (event.target as HTMLImageElement).src = fallback;
  }
}
