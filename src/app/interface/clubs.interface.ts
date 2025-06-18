import { IUser } from "../model/user.interface";

export interface Clubs {
  clubId: number;
  name: string;
  foundationDate: string;
  city: string;
  description: string;
  imageUrl?: string;
  status: boolean;
  members: IUser[];
}
