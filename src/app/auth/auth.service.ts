import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<any | null>(this.loadUserFromStorage());

  constructor(private http: HttpClient) {}

  /** Cargar usuario de localStorage */
  private loadUserFromStorage(): any | null {
    const str = localStorage.getItem('user');
    return str ? JSON.parse(str) : null;
  }

  /** Retorna el usuario actual (observable) */
  get user$(): Observable<any | null> {
    return this.userSubject.asObservable();
  }

  /** Retorna el usuario actual (sincrónico) */
  get user(): any | null {
    return this.userSubject.value;
  }

  /** Guarda usuario y token */
  setAuthData(token: string, user: any) {
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
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /** Obtiene el correo */
  getCorreo(): string | null {
    const decoded = this.decodeToken();
    return decoded?.correo || null;
  }

  /** Obtiene el nombre de usuario */
  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.sub || null;
  }

  /** Devuelve roles */
  getRoles(): string[] {
    const decoded = this.decodeToken();
    return decoded?.roles || ['INVITADO'];
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  isGuest(): boolean {
    const roles = this.getRoles();
    return !roles || roles.length === 0 || (roles.length === 1 && roles[0] === 'INVITADO');
  }

  /** Refresca el usuario desde la API */
  fetchUser(): Observable<any | null> {
    const token = this.getToken();
    if (!token) {
      this.userSubject.next(null);
      return of(null);
    }
    return this.http.get<{ data: any }>(`${environment.apiUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(res => {
        localStorage.setItem('user', JSON.stringify(res.data));
        this.userSubject.next(res.data);
      })
    );
  }
}
