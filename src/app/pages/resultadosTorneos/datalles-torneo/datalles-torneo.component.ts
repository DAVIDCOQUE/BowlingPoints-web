import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

interface ITournamentSummary {
  tournamentId: number;
  tournamentName: string;
  // Agrega más propiedades si existen en la respuesta
}

interface IPlayerScore {
  personId: number;
  playerName: string;
  clubName: string;
  scores: number[];
  total: number;
  promedio: number;
}

@Component({
  selector: 'app-datalles-torneo',
  templateUrl: './datalles-torneo.component.html',
  styleUrls: ['./datalles-torneo.component.css']
})
export class DatallesTorneoComponent implements OnInit {

  // Inyecciones modernas
  public readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  // Parámetros extraídos desde la URL
  public readonly tournamentId: number = Number(inject(ActivatedRoute).snapshot.paramMap.get('tournamentId'));
  public readonly modalityId: number = Number(inject(ActivatedRoute).snapshot.paramMap.get('modalityId'));

  // Datos del torneo
  public resumenTorneo: ITournamentSummary | null = null;
  public players: IPlayerScore[] = [];
  public maxJuegos: number = 0;

  ngOnInit(): void {
    this.getResumenTorneo();
    this.getDetalleTorneo();
  }

  /**
   * Consulta el resumen del torneo
   */
  getResumenTorneo(): void {
    this.http.get<{ success: boolean; data: ITournamentSummary }>(
      `${environment.apiUrl}/results/tournament-summary?tournamentId=${this.tournamentId}`
    ).subscribe({
      next: (res) => this.resumenTorneo = res.data,
      error: err => console.error('Error cargando resumen del torneo:', err)
    });
  }

  /**
   * Consulta los resultados por modalidad y calcula el máximo de juegos
   */
  getDetalleTorneo(): void {
    this.http.get<{ success: boolean; data: IPlayerScore[] }>(
      `${environment.apiUrl}/results/table?tournamentId=${this.tournamentId}&modalityId=${this.modalityId}`
    ).subscribe({
      next: res => {
        this.players = Array.isArray(res.data) ? res.data : [];
        this.maxJuegos = this.getMaxJuegos(this.players);
      },
      error: err => console.error('Error cargando detalle del torneo:', err)
    });
  }

  /**
   * Consulta los resultados generales del torneo (por género)
   */
  getDetalleTorenoTodoEvento(): void {
    this.http.get<{ success: boolean; data: IPlayerScore[] }>(
      `${environment.apiUrl}/results/by-gender?tournamentId=${this.tournamentId}`
    ).subscribe({
      next: res => {
        this.players = Array.isArray(res.data) ? res.data : [];
        this.maxJuegos = this.getMaxJuegos(this.players);
      },
      error: err => console.error('Error cargando detalle por género:', err)
    });
  }

  /**
   * Calcula el número máximo de juegos jugados por cualquier jugador
   */
  private getMaxJuegos(players: IPlayerScore[]): number {
    return players.reduce((max, p) =>
      Math.max(max, Array.isArray(p.scores) ? p.scores.length : 0), 0
    );
  }

  /**
   * Navega hacia atrás
   */
  goBack(): void {
    this.location.back();
  }
}
