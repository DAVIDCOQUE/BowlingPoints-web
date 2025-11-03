export interface ICategory {
  categoryId: number;
  name: string;
  description?: string;
  status?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
