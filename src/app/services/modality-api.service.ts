import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IModality } from '../model/modality.interface';

@Injectable({
  providedIn: 'root'
})
export class ModalityApiService {
  private readonly apiUrl = `${environment.apiUrl}/modalities`;

  constructor(private readonly http: HttpClient) { }

  /**
   * Consulta todas las modalidades
   */
  getModalities(): Observable<IModality[]> {
    return this.http.get<{ success: boolean; message: string; data: IModality[] }>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  /**
   *
   * Consulta todas las modalidades activas
   */
  getActiveModalities(): Observable<{ success: boolean; message: string; data: IModality[] }> {
    return this.http.get<{ success: boolean; message: string; data: IModality[] }>(
      `${this.apiUrl}/actives`
    );
  }

  /**
   * Crea una nueva modalidad
   */
  createModality(payload: Partial<IModality>): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  /**
   * Actualiza una modalidad existente
   */
  updateModality(id: number, payload: Partial<IModality>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  /**
   * Elimina una modalidad por su ID
   */
  deleteModality(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
