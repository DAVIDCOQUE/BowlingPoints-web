import { IUser } from './user.interface';

export interface ITeam {
  teamId: number;
  nameTeam: string;
  phone?: string;
  status?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  members?: IUser[];
}
