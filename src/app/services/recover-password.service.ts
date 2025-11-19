import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RecoverPasswordService {
  private readonly authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Envía el correo de recuperación
   */
  recoverPassword(identifier: string): Observable<any> {
    const payload = { identifier };
    const url = `${this.authUrl}/recover-password`;

    return this.http.post(url, payload)
      .pipe(tap(() => console.log('[RecoverPasswordService] Enviando solicitud de recuperación...')));
  }

  /**
   * Cambia la contraseña usando el token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const payload = { token, newPassword };
    const url = `${this.authUrl}/reset-password`;

    return this.http.post(url, payload)
      .pipe(tap(() => console.log('[RecoverPasswordService] Restableciendo contraseña...')));
  }
}
