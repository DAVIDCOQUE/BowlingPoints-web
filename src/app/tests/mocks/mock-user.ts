import { IUser } from "src/app/model/user.interface";
import { IRole } from 'src/app/model/role.interface';
import { ICategory } from 'src/app/model/category.interface';
import { MOCK_USER_PASSWORD } from '../constants/mock-user.constants';

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
  roles: [{ roleId: 2, name: 'Entrenador' }] as IRole[],
  categories: [] as ICategory[],
  password: MOCK_USER_PASSWORD,
  roleInClub: 'ENTRENADOR',
};
