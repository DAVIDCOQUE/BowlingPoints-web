export interface IModality {
  modalityId: number;
  name: string;
  description?: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
