import * as bcrypt from 'bcryptjs';
import { IUser } from '../../database/models/User';
import { IAuthBody } from '../../services/utils/types/AuthTypes';

export const mockToken: string = 'mock-token';

export const badLoginPasswordMock: IAuthBody[] = [
  {
    email: 'rapha@admin.com',
    password: 'secret_rapha'
  },
  {
    email: 'rapha@admin.com',
    password: ''
  },
];

export const badLoginEmailMock: IAuthBody[] = [
  {
    email: 'rapha@user.com',
    password: 'raphapassword'
  },
  {
    email: 'rapha@admin',
    password: 'secret_rapha'
  },
  {
    email: '',
    password: 'secret_rapha'
  },
];

export const validLoginMock: IAuthBody = {
  email: 'rapha@admin.com',
  password: 'raphapassword'
};

export const userMock: IUser = {
  id: 1,
  email: 'rapha@admin.com',
  password: bcrypt.hashSync('raphapassword', 12),
  username: 'rapha',
  role: 'admin'
}
