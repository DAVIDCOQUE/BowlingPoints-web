export interface IAmbit {
  ambitId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  status?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
