import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces
import { IResults } from '../model/result.interface';
import { ITournament } from '../model/tournament.interface';
import { IModality } from '../model/modality.interface';
import { ICategory } from '../model/category.interface';
import { IRound } from '../model/round.interface';
import { ITeam } from '../model/team.interface';
import { IUser } from '../model/user.interface';

@Injectable({
  providedIn: 'root',
})
export class ResultsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** --- Resultados --- */
  getResults(): Observable<{ success: boolean; message: string; data: IResults[] }> {
    return this.http.get<{ success: boolean; message: string; data: IResults[] }>(
      `${this.apiUrl}/results`
    );
  }

  getResultsFiltered(
    tournamentId: number,
    branchId?: number,
    roundNumber?: number
  ): Observable<IResults[]> {
    let params = new HttpParams().set('tournamentId', tournamentId.toString());

    if (branchId !== undefined && branchId !== null) {
      params = params.set('branchId', branchId.toString());
    }

    if (roundNumber !== undefined && roundNumber !== null) {
      params = params.set('roundNumber', roundNumber.toString());
    }

    return this.http.get<IResults[]>(`${this.apiUrl}/results/filter`, { params });
  }


  createResult(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/results`, payload);
  }

  updateResult(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/results/${id}`, payload);
  }

  deleteResult(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/results/${id}`);
  }

  /** --- Catálogos auxiliares --- */
  getTournaments(): Observable<{ success: boolean; message: string; data: ITournament[] }> {
    return this.http.get<{ success: boolean; message: string; data: ITournament[] }>(
      `${this.apiUrl}/tournaments`
    );
  }

  getCategories(): Observable<{ success: boolean; message: string; data: ICategory[] }> {
    return this.http.get<{ success: boolean; message: string; data: ICategory[] }>(
      `${this.apiUrl}/categories`
    );
  }

  getModalities(): Observable<{ success: boolean; message: string; data: IModality[] }> {
    return this.http.get<{ success: boolean; message: string; data: IModality[] }>(
      `${this.apiUrl}/modalities`
    );
  }

  getRounds(): Observable<{ success: boolean; message: string; data: IRound[] }> {
    return this.http.get<{ success: boolean; message: string; data: IRound[] }>(
      `${this.apiUrl}/rounds`
    );
  }

  getUsers(): Observable<{ success: boolean; message: string; data: IUser[] }> {
    return this.http.get<{ success: boolean; message: string; data: IUser[] }>(
      `${this.apiUrl}/users`
    );
  }

  getTeams(): Observable<{ success: boolean; message: string; data: ITeam[] }> {
    return this.http.get<{ success: boolean; message: string; data: ITeam[] }>(
      `${this.apiUrl}/teams`
    );
  }
}
