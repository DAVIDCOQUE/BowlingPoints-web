// src/app/utils/jwt-utils.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class JwtUtilsService {
  decode<T = any>(token: string): T {
    return jwtDecode<T>(token);
  }
}
