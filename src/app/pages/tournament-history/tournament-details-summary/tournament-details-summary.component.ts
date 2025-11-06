import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tournament-details-summary',
  templateUrl: './tournament-details-summary.component.html',
  styleUrls: ['./tournament-details-summary.component.css']
})
export class TournamentDetailsSummaryComponent implements OnInit {

  // Inyecciones
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  // Parámetros de ruta
  public readonly tournamentId: number = Number(this.route.snapshot.paramMap.get('tournamentId'));
  public readonly branchId: number = Number(this.route.snapshot.paramMap.get('branchId'));

  // Datos
  public resumenTorneo: any = null;
  public modalities: any[] = [];
  public rounds: number[] = [];
  public resultsByModality: any[] = [];

  public visibleModalities: any[] = [];

  public nombreModalidad: string = '';

  // Control de ronda actual
  public roundNumber: number = 1;

  ngOnInit(): void {
    this.loadGeneralResults();
  }

  /**
   * Carga los resultados generales del torneo desde la API
   */
  loadGeneralResults(): void {
    let url = `${environment.apiUrl}/results/by-modality?tournamentId=${this.tournamentId}&roundNumber=${this.roundNumber}&branchId=${this.branchId}`;

    this.http.get<any>(url).subscribe({
      next: res => {
        console.log('✅ Datos del resumen general cargados correctamente:', res);
        this.resumenTorneo = res.tournament || null;
        this.modalities = res.modalities || [];

        this.rounds = res.rounds || [];
        this.resultsByModality = res.resultsByModality || [];
        this.filterVisibleModalities();
      },
      error: err => {
        console.error('❌ Error cargando resumen general:', err);
      }
    });
  }


  /**
 * Filtra las modalidades que tienen datos para mostrar solo las necesarias
 */
  filterVisibleModalities(): void {
    if (!this.resultsByModality || !Array.isArray(this.resultsByModality)) return;

    this.visibleModalities = this.modalities.filter(modality => {
      return this.resultsByModality.some(player =>
        player.modalityScores?.hasOwnProperty(modality.name) &&
        player.modalityScores[modality.name] != null
      );
    });
  }

  /**
   * Devuelve la diferencia respecto al promedio 200
   */
  getPlusMinus200(score: number): string {
    const diff = Math.round(score - 200);
    return diff >= 0 ? `+${diff}` : `${diff}`;
  }

  /**
   * Se ejecuta al cambiar la ronda
   */
  onRoundChange(): void {
    this.loadGeneralResults();
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
