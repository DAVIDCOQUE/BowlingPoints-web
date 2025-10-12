import { IUser } from './user.interface';
export interface IClubs {
  clubId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  foundationDate?: Date;
  city?: string;
  status?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  members?: IUser[];
}
