import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { IUser } from '../model/user.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<IUser | null>(this.loadUserFromStorage());

  /** Cargar usuario de localStorage */
  private loadUserFromStorage(): IUser | null {
    const str = localStorage.getItem('user');
    return str ? JSON.parse(str) as IUser : null;
  }

  /** Retorna el usuario actual (observable) */
  get user$(): Observable<IUser | null> {
    return this.userSubject.asObservable();
  }

  /** Retorna el usuario actual (sincrónico) */
  get user(): IUser | null {
    return this.userSubject.value;
  }

  /** Guarda usuario y token */
  setAuthData(token: string, user: IUser): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Borra todo */
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  /** Obtiene el token JWT */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /** ¿Está logueado? */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Decodifica el token */
  decodeToken(): Partial<IUser> | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as Partial<IUser>;
    } catch {
      return null;
    }
  }

  /** Obtiene el correo */
  getEmail(): string | null {
    const decoded = this.decodeToken();
    return decoded?.email || null;
  }

  /** Obtiene el nombre de usuario */
  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.fullName || null;
  }

  /** Devuelve roles */
  getRoles(): string[] {
    const decoded = this.decodeToken();
    return decoded?.roles || ['INVITADO'];
  }

  hasRole(role: string): boolean {
    if (!this.user || !this.user.roles) return false;
    return this.user.roles.includes(role);
  }

  isGuest(): boolean {
    const roles = this.getRoles();
    return !roles || roles.length === 0 || (roles.length === 1 && roles[0] === 'INVITADO');
  }

  /** Refresca el usuario desde la API */
  fetchUser(): Observable<IUser | null> {
    const token = this.getToken();
    if (!token) {
      this.userSubject.next(null);
      return of(null);
    }

    return this.http.get<{ data: IUser }>(`${environment.apiUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(res => {
        localStorage.setItem('user', JSON.stringify(res.data));
        this.userSubject.next(res.data);
      }),
      map(res => res.data)
    );
  }
}
