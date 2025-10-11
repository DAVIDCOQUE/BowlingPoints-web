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
   * @returns Observable con un arreglo de roles
   */
  getAll(): Observable<IRole[]> {
    return this.http.get<{ success: boolean; message: string; data: IRole[] }>(`${this.apiUrl}/roles`)
      .pipe(map(res => res.data));
  }

  /**
   * Obtiene un rol por su ID
   * @param id Identificador del rol
   * @returns Observable con un rol
   */
  getById(id: number): Observable<IRole> {
    return this.http.get<{ success: boolean; message: string; data: IRole }>(`${this.apiUrl}/roles/${id}`)
      .pipe(map(res => res.data));
  }

  /**
   * Crea un nuevo rol
   * @param payload Datos del nuevo rol
   * @returns Observable con el rol creado
   */
  create(payload: Partial<IRole>): Observable<IRole> {
    return this.http.post<{ success: boolean; message: string; data: IRole }>(`${this.apiUrl}/roles`, payload)
      .pipe(map(res => res.data));
  }

  /**
   * Actualiza un rol existente
   * @param id ID del rol a actualizar
   * @param payload Datos actualizados
   * @returns Observable con el rol actualizado
   */
  update(id: number, payload: Partial<IRole>): Observable<IRole> {
    return this.http.put<{ success: boolean; message: string; data: IRole }>(`${this.apiUrl}/roles/${id}`, payload)
      .pipe(map(res => res.data));
  }

  /**
   * Elimina un rol
   * @param id ID del rol a eliminar
   * @returns Observable vacío
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }
}
