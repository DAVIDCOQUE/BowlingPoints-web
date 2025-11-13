import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import {
  IPlayerScore,
  IModality,
  ITournamentSummary,
  IHighestLine,
  IResultsResponse
} from 'src/app/model/result-details.interface';

@Component({
  selector: 'app-tournament-details',
  templateUrl: './tournament-details.component.html',
  styleUrls: ['./tournament-details.component.css']
})
export class TournamentDetailsComponent implements OnInit {

  // Inyecciones
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  // Parámetros de ruta
  public readonly tournamentId: number = Number(this.route.snapshot.paramMap.get('tournamentId'));
  public modalityId: number = Number(this.route.snapshot.paramMap.get('modalityId'));
  public roundNumber: number = 1;

  public groupedResults: (IPlayerScore | { isTeam: true, teamName: string, total: number })[] = [];

  // Datos
  public players: IPlayerScore[] = [];
  public modalities: IModality[] = [];
  public rounds: number[] = [];
  public resumenTorneo: ITournamentSummary | null = null;

  public promedioRonda: number = 0;
  public promediosPorLinea: Record<string, number> = {};
  public mayorLinea: IHighestLine | null = null;

  public nombreModalidad: string = '';

  public maxJuegos: number = 0;

  public isTeamModality = false;

  ngOnInit(): void {
    this.loadResultsTable();
  }

  /**
   * Carga los resultados desde la API
   */
  loadResultsTable(): void {
    const url = `${environment.apiUrl}/results/tournament-table?tournamentId=${this.tournamentId}&modalityId=${this.modalityId}&roundNumber=${this.roundNumber}`;

    this.http.get<IResultsResponse>(url).subscribe({
      next: data => {
        console.log(' Datos cargados correctamente:', data);

        this.resumenTorneo = data.tournament || null;
        this.players = data.results || [];
        this.organizeResultsByTeam();
        this.modalities = data.modalities || [];

        const modalidadActual = this.modalities.find(m => m.modalityId === this.modalityId);
        this.nombreModalidad = modalidadActual?.name || 'Sin modalidad';
        this.isTeamModality = this.nombreModalidad.toLowerCase().includes('equipo');

        this.rounds = data.rounds || [];

        this.promedioRonda = data.avgByRound || 0;
        this.promediosPorLinea = data.avgByLine || {};
        this.mayorLinea = data.highestLine || null;

        this.maxJuegos = this.getMaxJuegos(this.players);
      },
      error: err => {
        console.error(' Error cargando datos:', err);
      }
    });
  }

  organizeResultsByTeam(): void {
    const teamMap = new Map<number, {
      teamName: string;
      members: IPlayerScore[];
      total: number;
    }>();

    this.groupedResults = [];

    for (let player of this.players) {
      if (player.teamId) {
        if (!teamMap.has(player.teamId)) {
          teamMap.set(player.teamId, {
            teamName: player.teamName || '',
            members: [],
            total: 0
          });
        }

        const group = teamMap.get(player.teamId)!;
        group.members.push(player);
        group.total += player.total || 0;

      } else {
        // Jugadores sin equipo
        this.groupedResults.push(player);
      }
    }

    for (let group of teamMap.values()) {
      this.groupedResults.push(...group.members);
      this.groupedResults.push({
        isTeam: true,
        teamName: group.teamName,
        total: group.total
      });
    }
  }

  isTeamEntry(entry: IPlayerScore | { isTeam: true; teamName: string; total: number }): entry is { isTeam: true; teamName: string; total: number } {
    return 'isTeam' in entry;
  }

  /**
   * Retorna el número máximo de juegos por jugador
   */
  private getMaxJuegos(players: IPlayerScore[]): number {
    return players.reduce((max, p) =>
      Math.max(max, Array.isArray(p.scores) ? p.scores.length : 0), 0
    );
  }

  /**
   * Imagen fallback
   */
  onImgError(event: any, fallbackUrl: string): void {
    event.target.src = fallbackUrl;
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.location.back();
  }
}
