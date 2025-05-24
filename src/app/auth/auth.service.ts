import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.clear();
  }

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

  getCorreo(): string | null {
  const decoded = this.decodeToken();
  return decoded?.correo || null;
}

  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.sub || null;
  }

  getRoles(): string[] {
    const decoded = this.decodeToken();
    return decoded?.roles || ['INVITADO']; // ← Fallback temporal
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  isGuest(): boolean {
    const roles = this.getRoles();
    return !roles || roles.length === 0 || (roles.length === 1 && roles[0] === 'INVITADO');
  }
}
