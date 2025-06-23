import { IRole } from "./role.interface";


export interface IUser {
  userId: number;
  personId: number;
  roleId: number;
  document: string;
  photoUrl?: string | null;
  nickname: string;
  firstname: string;
  secondname?: string | null;
  lastname: string;
  secondlastname?: string | null;
  email: string;
  roleDescription: string;
  phone: string;
  gender: string;

  fullName?: string;
  roleInClub?: string;
  joinjoinedAt?: string;
  averageScore?: number;


}

