import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IRole } from '../model/role.interface';

@Injectable({
  providedIn: 'root'
})
export class RoleApiService {

  /** Inyección de HttpClient */
  private readonly http = inject(HttpClient);

  /** URL base de la API */
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene todos los roles desde la API
   */
  getAll(): Observable<IRole[]> {
    return this.http.get<{ success: boolean; message: string; data: IRole[] }>(`${this.apiUrl}/roles`)
      .pipe(map(res => res.data));
  }

  /**
   * Obtiene un rol por su ID
   */
  getById(id: number): Observable<IRole> {
    return this.http.get<{ success: boolean; message: string; data: IRole }>(`${this.apiUrl}/roles/${id}`)
      .pipe(map(res => res.data));
  }

  /**
   * Crea un nuevo rol
   */
  create(payload: Partial<IRole>): Observable<IRole> {
    return this.http.post<{ success: boolean; message: string; data: IRole }>(`${this.apiUrl}/roles`, payload)
      .pipe(map(res => res.data));
  }

  /**
   * Actualiza un rol existente
   */
  update(id: number, payload: Partial<IRole>): Observable<IRole> {
    return this.http.put<{ success: boolean; message: string; data: IRole }>(`${this.apiUrl}/roles/${id}`, payload)
      .pipe(map(res => res.data));
  }

  /**
   * Elimina un rol
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }
}
