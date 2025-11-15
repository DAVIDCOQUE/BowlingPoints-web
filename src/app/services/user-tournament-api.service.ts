import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IUserTournament } from '../model/UserTournament.interface';

@Injectable({ providedIn: 'root' })
export class UserTournamentApiService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene los torneos jugados por un usuario
   */
  getTorneosAgrupados(userId: number): Observable<{ active: IUserTournament[], finished: IUserTournament[] }> {
    return this.http.get<{ success: boolean; message: string; data: { active: IUserTournament[], finished: IUserTournament[] } }>(
      `${this.apiUrl}/user-tournaments/player/${userId}/grouped`
    ).pipe(map(res => res.data));
  }
}
