export interface IUser {
  userId: number;
  personId: number;
  roleId: number;
  clubId: number;
  document: string;
  photoUrl?: string | null;
  nickname: string;
  fullName: string;
  fullSurname: string;
  email: string;
  roleDescription: string;
  phone: string;
  gender: string;
  roles?: string[];


  createdAt?: string;
  updatedAt?: string;
  status?: boolean;
  sub?: string;
  roleInClub?: string;
  joinjoinedAt?: string;
  averageScore?: number;
  bestGame?: string;


}
