// src/app/auth/jwt-utils.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { JwtUtilsService } from './jwt-utils.service';

interface Payload {
  sub: string;
  name?: string;
}

// helpers para construir un JWT válido (solo a efectos de decode)
function b64url(str: string): string {
  // base64URL: reemplaza +/ por -_ y elimina '='
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function buildJwt(payload: object): string {
  const header = { alg: 'none', typ: 'JWT' };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  return `${h}.${p}.sig`;
}

describe('JwtUtilsService', () => {
  let service: JwtUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JwtUtilsService],
    });
    service = TestBed.inject(JwtUtilsService);
  });

  it('decode() retorna el payload cuando el token está bien formado (happy path)', () => {
    const payload: Payload = { sub: '123', name: 'Sara' };
    const token = buildJwt(payload);

    const result = service.decode<Payload>(token);

    expect(result.sub).toBe('123');
    expect(result.name).toBe('Sara');
  });

  it('decode() lanza error cuando el token NO es un JWT (error path)', () => {
    // sin puntos => no es un JWT; jwt-decode debe lanzar "Invalid token specified"
    const bad = 'not-a-jwt';
    expect(() => service.decode(bad)).toThrow();
  });
});
