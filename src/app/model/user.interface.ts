import { IRole } from "./role.interface";


export interface IUser {
  userId: number;
  document: string;
  photoUrl?: string | null;
  nickname: string;
  firstname: string;
  secondname?: string | null;
  lastname: string;
  secondlastname?: string | null;
  email: string;
  roleDescription: string;
  roleId: number;
  phone: string;
  gender: string;
}

