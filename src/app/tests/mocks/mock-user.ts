import { IUser } from "src/app/model/user.interface";

export const mockUser: IUser = {
  sub: 'abc123',
  userId: 1,
  personId: 1,
  roleId: 2,
  clubId: 1,
  document: '1234567890',
  photoUrl: null,
  nickname: 'jperez',
  fullName: 'Juan',
  fullSurname: 'Pérez',
  email: 'juan.perez@example.com',
  roleDescription: 'Entrenador',
  phone: '3001234567',
  gender: 'Masculino',
  roles: ['Entrenador'],
  roleInClub: 'ENTRENADOR',
  joinjoinedAt: '2022-01-01',
  averageScore: 180,
  bestGame: '250'
};
