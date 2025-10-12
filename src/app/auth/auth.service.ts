import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { IUser } from '../model/user.interface';
import { IAuthToken } from '../model/auth-token.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<IUser | null>(this.loadUserFromStorage());

  /** Cargar usuario de localStorage */
  private loadUserFromStorage(): IUser | null {
    const str = localStorage.getItem('user');
    return str ? (JSON.parse(str) as IUser) : null;
  }

  /** Base URL de la API */
  get baseUrl(): string {
    return environment.apiUrl;
  }

  /** Retorna el usuario actual (observable) */
  get user$(): Observable<IUser | null> {
    return this.userSubject.asObservable();
  }

  /** Retorna el usuario actual (sincrónico) */
  get user(): IUser | null {
    return this.userSubject.value;
  }

  /** Guarda el token y sincroniza usuario desde la API */
  setAuthData(token: string): void {
    localStorage.setItem('jwt_token', token);

    // ✅ Se obtiene el usuario real desde el backend
    this.fetchUser().subscribe({
      next: (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        }
      },
      error: (err) => {
        console.error('Error al obtener usuario tras login:', err);
      },
    });
  }

  /** Cierra sesión */
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    // Opcional: redirigir
    // window.location.href = '/login';
  }

  /** Obtiene el token JWT almacenado */
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  /** ¿Está logueado el usuario? */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Decodifica el token JWT */
  decodeToken(): IAuthToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded) as IAuthToken;
    } catch {
      return null;
    }
  }

  /** Obtiene el correo desde el token */
  getEmail(): string | null {
    const decoded = this.decodeToken();
    return decoded?.email || null;
  }

  /** Obtiene el identificador del usuario (sub del token) */
  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.sub || null;
  }

  /** Obtiene los roles desde el token */
  getRoles(): string[] {
    const decoded = this.decodeToken();
    return decoded?.roles ?? ['INVITADO'];
  }

  /** Verifica si el usuario tiene un rol específico */
  hasRole(role: string): boolean {
    const decoded = this.decodeToken();
    const roles = decoded?.roles ?? [];
    const result = roles.includes(role);
    console.log(`Checking role: ${role}`, '→', result ? '✅ permitido' : '❌ no permitido');
    return result;
  }

  /** Verifica si es un invitado */
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

    return this.http
      .get<{ data: IUser }>(`${environment.apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((res) => {
          localStorage.setItem('user', JSON.stringify(res.data));
          this.userSubject.next(res.data);
        }),
        map((res) => res.data)
      );
  }

  /** Actualiza el perfil del usuario */
  updateUserProfile(id: number, payload: Partial<IUser>): Observable<IUser> {
    return this.http
      .put<{ data: IUser }>(`${environment.apiUrl}/users/${id}`, payload)
      .pipe(
        tap((res) => {
          localStorage.setItem('user', JSON.stringify(res.data));
          this.userSubject.next(res.data);
        }),
        map((res) => res.data)
      );
  }
}
