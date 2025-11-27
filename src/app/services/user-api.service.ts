import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IUser } from '../model/user.interface';

@Injectable({
  providedIn: 'root'
})

export class UserApiService {
  private readonly usersUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtiene todos los usuarios
   */
  getUsers(): Observable<IUser[]> {
    return this.http.get<{ success: boolean; message: string; data: IUser[] }>(this.usersUrl)
      .pipe(map(res => res.data));
  }

  /**
 * Obtiene todos los usuarios activos (sin importar rol)
 */
  getActiveUsers(): Observable<IUser[]> {
    const url = `${this.usersUrl}/actives`;
    return this.http
      .get<{ success: boolean; message: string; data: IUser[] }>(url)
      .pipe(
        map(res => res.data)
      );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(payload: Partial<IUser>): Observable<any> {
    return this.http.post(this.usersUrl, payload);
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, payload: Partial<IUser>): Observable<any> {
    return this.http.put(`${this.usersUrl}/${id}`, payload);
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.usersUrl}/${id}`);
  }


}
