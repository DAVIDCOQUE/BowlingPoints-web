export interface BowlingCenter {
  bowlingCenterId: number;
  name: string;
  address: string;
  openDays: string;
  openHours: string;
  socialLinks?: string;
  status?: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
