import { IUser } from "./user.interface";

export interface ITeam {
  teamId: number;
  nameTeam: string;
  users: IUser[];
  phone: string;
  status: boolean;
}
