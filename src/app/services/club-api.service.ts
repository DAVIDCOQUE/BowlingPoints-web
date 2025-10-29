import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { IClubs } from '../model/clubs.interface';

@Injectable({
  providedIn: 'root'
})
export class ClubApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los clubes con sus miembros
   */
  /**
    * Obtiene todos los clubes con sus miembros
    */
  getClubs(): Observable<IClubs[]> {
    return this.http
      .get<{ success: boolean; message: string; data: any[] }>(`${this.baseUrl}/clubs`)
      .pipe(map(res => (res?.data ?? []).map(c => this.mapClub(c))));
  }

  /**
   * Obtiene un club específico por su ID
   */
  getClubById(id: number): Observable<IClubs> {
    return this.http
      .get<{ success: boolean; message: string; data: any }>(`${this.baseUrl}/clubs/${id}`)
      .pipe(map(res => this.mapClub(res?.data)));
  }

  /**
   * Mapea el objeto club desde la API normalizando propiedades
   */
  private mapClub(c: any): IClubs {
    return {
      clubId: c?.clubId,
      name: c?.name,
      foundationDate: c?.foundationDate ?? c?.FoundationDate ?? null,
      city: c?.city,
      description: c?.description,
      imageUrl: c?.imageUrl ?? c?.imageURL ?? c?.image ?? null,
      status: c?.status,
      members: (c?.members ?? []).map((m: any) => ({
        ...m,
        photoUrl: m?.photoUrl ?? m?.photourl ?? m?.photoURL ?? null
      }))
    } as IClubs;
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
    return this.http.post(`${this.baseUrl}/clubs`, payload);
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
