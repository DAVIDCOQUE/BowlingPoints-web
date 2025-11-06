// jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { JwtUtilsService } from '../auth/jwt-utils.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private jwtUtils: JwtUtilsService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jwt_token');

    if (token) {
      try {
        const decoded: any = this.jwtUtils.decode(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp && decoded.exp < now) {
          console.warn('Token expirado');
          localStorage.removeItem('jwt_token');
          window.location.assign('/login');
          return throwError(() => new Error('Token expirado'));
        }

        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });

        return next.handle(cloned);
      } catch (e) {
        console.error('Token inválido', e);
        localStorage.removeItem('jwt_token');
        window.location.assign('/login');
        return throwError(() => new Error('Token inválido'));
      }
    }

    return next.handle(req);
  }
}
