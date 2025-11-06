import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface UserDashboardStats {
  avgScoreGeneral: number;
  bestLine: number;
  totalTournaments: number;
  totalLines: number;
  bestTournamentAvg: TournamentAvg;
  avgPerTournament: TournamentAvg[];
  avgPerModality: ModalityAvg[];
  scoreDistribution: ScoreRange[];
}
export interface TournamentAvg {
  tournamentId: number;
  tournamentName: string;
  imageUrl: string;
  average: number;
  startDate: string;
}
export interface ModalityAvg {
  modalityName: string;
  average: number;
}
export interface ScoreRange {
  label: string; // Ejemplo: "130–160"
  count: number;
}
@Injectable({ providedIn: 'root' })
export class UserStatsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**  Obtiene todas las estadísticas del dashboard del usuario */
  getDashboardStats(userId: number): Observable<UserDashboardStats> {
    return this.http
      .get<{ success: boolean; data: UserDashboardStats }>(
        `${this.apiUrl}/api/user-stats/dashboard?userId=${userId}`
      )
      .pipe(map(res => res.data));
  }
}
