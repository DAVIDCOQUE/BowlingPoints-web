export interface IAuthToken {
  permissions: string[];
  roles: string[];
  email: string;
  sub: string;
  iat: number;
  exp: number;
}
