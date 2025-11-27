import { ICategory } from "./category.interface";
import { IClubs } from "./clubs.interface";
import { IRole } from './role.interface';
import { ITeam } from "./team.interface";

export interface IUserResult {
  userId: number;
  nickname: string;
  password: string;
  attemptsLogin?: number;
  lastLoginAt?: Date;
  categories?: ICategory[];
  teams?: ITeam[];
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
  club?: IClubs;
  roleInClub?: string;
  averageScore: string;
  bestGame: string;
  joinjoinedAt: string;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  rama: string;
  titlesWon?: number;

  sub: string;
}
