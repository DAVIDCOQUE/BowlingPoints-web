import { ICategory } from "./category.interface";
import { IClubs } from "./clubs.interface";
import { IRole } from './role.interface';

export interface IUser {
  userId: number;
  nickname: string;
  password: string;
  attemptsLogin?: number;
  lastLoginAt?: Date;
  categories: ICategory[];
  roles: IRole[];
  personId: number;
  document?: string;
  fullName: string;
  fullSurname: string;
  email: string;
  phone: string;
  gender: string;
  birthDate?: Date;
  photoUrl?: string;
  clubId?: number
  club?: IClubs;
  roleInClub?: string;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  sub: string;
}
