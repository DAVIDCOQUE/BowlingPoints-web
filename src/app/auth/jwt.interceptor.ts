import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt_token');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const now = Math.floor(Date.now() / 1000); // Fecha actual en segundos

        if (decoded.exp && decoded.exp < now) {
          console.warn('⚠️ Token expirado');
          localStorage.removeItem('jwt_token');
          window.location.href = '/login'; // Redirige al login
          return throwError(() => new Error('Token expirado'));
        }

        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(cloned);
      } catch (e) {
        console.error('⚠️ Token inválido', e);
        localStorage.removeItem('jwt_token');
        window.location.href = '/login';
        return throwError(() => new Error('Token inválido'));
      }
    }

    return next.handle(req);
  }
}
