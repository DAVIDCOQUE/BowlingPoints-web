import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IEstadisticas {
  tournamentsWon: number;
  totalTournaments: number;
  totalStrikes: number;
  avgScore: number;
  bestGame: number;
}

export interface ITorneoResumen {
  tournamentId: number;
  name: string;
  startDate: string;
  lugar: string;
  modalidad: string;
  categoria: string;
  bestScore: number;
  imageUrl: string;
  resultados: number;
}


@Injectable({ providedIn: 'root' })
export class UserStatsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** Obtiene estadísticas generales del usuario */
  getResumenEstadisticas(userId: number): Observable<IEstadisticas> {
    return this.http.get<{ success: boolean; data: IEstadisticas }>(
      `${this.apiUrl}/api/user-stats/summary?userId=${userId}`
    ).pipe(
      map(res => res.data)
    );
  }

  /** Obtiene los torneos más destacados del usuario */
  getTopTorneos(userId: number): Observable<ITorneoResumen[]> {
    return this.http.get<{ success: boolean; data: ITorneoResumen[] }>(
      `${this.apiUrl}/api/user-stats/top-tournaments?userId=${userId}`
    ).pipe(
      map(res => res.data)
    );
  }

}
