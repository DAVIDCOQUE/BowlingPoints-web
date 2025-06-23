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
}
