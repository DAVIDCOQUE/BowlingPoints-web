import { IUser } from "./user.interface";

export interface IClubs {
  clubId: number;
  name: string;
  foundationDate: string;
  city: string;
  description: string;
  imageUrl?: string;
  status: boolean;
  members: IUser[];

  score?: number;
  ranking?: number;
  logros?: string[];
  torneos?: any[];

}
