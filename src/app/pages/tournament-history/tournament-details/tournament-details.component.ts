import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import {
  IPlayerScore,
  IModality,
  IRound,
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

  ngOnInit(): void {
    this.loadResultsTable();
    this.loadResultsTable2();
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
        this.modalities = data.modalities || [];

        const modalidadActual = this.modalities.find(m => m.modalityId === this.modalityId);
        this.nombreModalidad = modalidadActual?.name || 'Sin modalidad';

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


   loadResultsTable2(): void {
    const url = `${environment.apiUrl}/results/by-modality?tournamentId=${this.tournamentId}&roundNumber=${this.roundNumber}`;

    this.http.get<IResultsResponse>(url).subscribe({
      next: data => {
        console.log(' Datos cargados correctamente:', data);

        this.resumenTorneo = data.tournament || null;
        this.players = data.results || [];
        this.modalities = data.modalities || [];

        const modalidadActual = this.modalities.find(m => m.modalityId === this.modalityId);
        this.nombreModalidad = modalidadActual?.name || 'Sin modalidad';

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
