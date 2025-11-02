import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Interfaces
import { ITournament } from '../model/tournament.interface';

@Injectable({
  providedIn: 'root',
})
export class TournamentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTournaments(): Observable<{ success: boolean; message: string; data: ITournament[] }> {
    return this.http.get<{ success: boolean; message: string; data: ITournament[] }>(
      `${this.apiUrl}/tournaments`
    );
  }

  getTournamentById(id: number): Observable<{ success: boolean; message: string; data: ITournament | null }> {
    return this.http.get<{ success: boolean; message: string; data: ITournament | null }>(
      `${this.apiUrl}/tournaments/${id}`
    );
  }

  getDepartments(): Observable<{ id: number; name: string }[]> {
    return this.http.get<{ id: number; name: string }[]>(
      `https://api-colombia.com/api/v1/Department`
    );
  }

  createTournament(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tournaments`, payload);
  }

  updateTournament(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tournaments/${id}`, payload);
  }

  deleteTournament(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tournaments/${id}`);
  }
}
