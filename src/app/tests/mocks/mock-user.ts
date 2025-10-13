import { IUser } from "src/app/model/user.interface";
import { IRole } from 'src/app/model/role.interface';

export const mockUser: IUser = {
  sub: 'abc123',
  userId: 1,
  personId: 1,
  clubId: 1,
  document: '1234567890',
  photoUrl: '',
  nickname: 'jperez',
  fullName: 'Juan',
  fullSurname: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '3001234567',
  gender: 'Masculino',
  roles: [{ roleId: 2, description: 'Entrenador' }] as IRole[],
  password: 'dummy-password',
  roleInClub: 'ENTRENADOR',
};
