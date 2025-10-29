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
  getTorneosJugados(userId: number): Observable<IUserTournament[]> {
    return this.http.get<{ success: boolean; message: string; data: IUserTournament[] }>(
      `${this.apiUrl}/user-tournaments/${userId}/played`
    ).pipe(map(res => res.data));
  }

  /**
   * Obtiene los torneos inscritos por un usuario (revisar si es diferente al anterior)
   */
  getTorneosInscriptos(userId: number): Observable<IUserTournament[]> {
    return this.http.get<{ success: boolean; message: string; data: IUserTournament[] }>(
      `${this.apiUrl}/user-tournaments/${userId}/played` // <-- cambiar si el endpoint es diferente
    ).pipe(map(res => res.data));
  }
}
