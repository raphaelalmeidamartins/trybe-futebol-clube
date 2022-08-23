import * as bcrypt from 'bcryptjs';
import { IUser, IUserReturned } from '../../database/models/User';
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

export const validLoginMock2: IAuthBody = {
  email: 'user@user.com',
  password: 'userpassword'
};

export const userMock: IUser = {
  id: 1,
  email: 'rapha@admin.com',
  password: bcrypt.hashSync('raphapassword', 12),
  username: 'rapha',
  role: 'admin'
}

export const userMockReturned: IUserReturned = {
  id: 1,
  email: 'rapha@admin.com',
  username: 'rapha',
  role: 'admin'
}

export const userMock2: IUser = {
  id: 2,
  email: 'user@user.com',
  password: bcrypt.hashSync('userpassword', 12),
  username: 'User',
  role: 'user'
}

export const userMockReturned2: IUserReturned = {
  id: 2,
  email: 'user@user.com',
  username: 'User',
  role: 'user'
}

export const usersMockReturned: IUserReturned[] = [
  {
    id: 1,
    username: 'Admin',
    role: 'admin',
    email: 'admin@admin.com'
  },
  {
    id: 2,
    username: 'User',
    role: 'user',
    email: 'user@user.com'
  }
];

export const usersMockEmpty: IUserReturned[] = [];
