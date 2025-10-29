import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Interfaces
import { ITournament } from '../model/tournament.interface';
import { IModality } from '../model/modality.interface';
import { ICategory } from '../model/category.interface';
import { IAmbit } from '../model/ambit.interface';

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

  getModalities(): Observable<{ success: boolean; message: string; data: IModality[] }> {
    return this.http.get<{ success: boolean; message: string; data: IModality[] }>(
      `${this.apiUrl}/modalities`
    );
  }

  getCategories(): Observable<{ success: boolean; message: string; data: ICategory[] }> {
    return this.http.get<{ success: boolean; message: string; data: ICategory[] }>(
      `${this.apiUrl}/categories`
    );
  }

  getAmbits(): Observable<{ success: boolean; message: string; data: IAmbit[] }> {
    return this.http.get<{ success: boolean; message: string; data: IAmbit[] }>(
      `${this.apiUrl}/ambits`
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
