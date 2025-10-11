import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { IClubs } from '../model/clubs.interface';
import { IUser } from '../model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class ClubApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los clubes con sus miembros
   */
  getClubs(): Observable<IClubs[]> {
    return this.http.get<IClubs[]>(`${this.baseUrl}/clubs/with-members`);
  }

  /**
   * Elimina un club por su ID
   */
  deleteClub(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clubs/${id}`);
  }

  /**
   * Crea un nuevo club con sus miembros
   */
  createClub(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/clubs/create-with-members`, payload);
  }

  /**
   * Actualiza un club existente
   */
  updateClub(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/clubs/${id}`, payload);
  }

  /**
   * Devuelve la URL base (por si se necesita en componentes)
   */
  get apiUrl(): string {
    return this.baseUrl;
  }
}
