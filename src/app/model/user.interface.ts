import { IRole } from "./role.interface";


export interface IUser {
  userId: number;
  personId: number;
  roleId: number;
  document: string;
  photoUrl?: string | null;
  nickname: string;
  fullName: string;
  fullSurname: string;
  email: string;
  roleDescription: string;
  phone: string;
  gender: string;


  roleInClub?: string;
  joinjoinedAt?: string;
  averageScore?: number;


}

