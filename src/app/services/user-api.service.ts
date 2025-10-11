import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IUser } from '../model/user.interface';
import { IRole } from '../model/role.interface';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private readonly usersUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los usuarios
   */
  getUsers(): Observable<IUser[]> {
    return this.http.get<{ success: boolean; message: string; data: IUser[] }>(this.usersUrl)
      .pipe(map(res => res.data));
  }

  /**
   * Crea un nuevo usuario
   * @param payload Datos del usuario
   */
  createUser(payload: Partial<IUser>): Observable<any> {
    return this.http.post(this.usersUrl, payload);
  }

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario
   * @param payload Datos modificados
   */
  updateUser(id: number, payload: Partial<IUser>): Observable<any> {
    return this.http.put(`${this.usersUrl}/${id}`, payload);
  }

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.usersUrl}/${id}`);
  }

  /**
   * Obtiene todos los roles
   */
  getRoles(): Observable<IRole[]> {
    return this.http.get<{ success: boolean; message: string; data: IRole[] }>(this.rolesUrl)
      .pipe(map(res => res.data));
  }

}
