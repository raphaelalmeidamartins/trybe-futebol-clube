import * as bcrypt from 'bcryptjs';
import * as Joi from 'joi';
import UserRepository, { IUser, IUserReturned } from '../database/models/User';
import NotFoundError from '../utils/errors/NotFoundError';
import UnauthorizedError from '../utils/errors/UnauthorizedError';
import IAuthService, { IAuthBody } from './utils/types/AuthTypes';
import { IUserService, IValidatorFunction } from './utils/types/ServiceTypes';
import validator from './utils/validator';

const REQUIRED_MSG = 'All fields must be filled';
const INVALID_FIELDS_MSG = 'Incorrect email or password';

class UserService implements IUserService {
  private _model = UserRepository;

  constructor(private _tokenService: IAuthService) {}

  public validate = {
    body: {
      login: validator(
        Joi.object({
          email: Joi.string().email().required().messages({
            'string.empty': REQUIRED_MSG,
            'string.email': INVALID_FIELDS_MSG,
            'any.required': REQUIRED_MSG,
          }),
          password: Joi.string().required().messages({
            'string.empty': REQUIRED_MSG,
            'any.required': REQUIRED_MSG,
          }),
        }),
      ) as IValidatorFunction<IAuthBody>,
    },
    username: async (email: string): Promise<IUser> => {
      const user: IUser | null = await this._model.findOne({
        where: { email },
      });
      if (!user) throw new UnauthorizedError(INVALID_FIELDS_MSG);
      return user;
    },
    password: async (user: IUser, password: string): Promise<void> => {
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedError(INVALID_FIELDS_MSG);
      }
    },
  };

  public async login(data: IAuthBody): Promise<string> {
    this.validate.body.login(data);
    const user = await this.validate.username(data.email);
    await this.validate.password(user, data.password);
    const token = await this._tokenService.generate(user.id);
    return token;
  }

  public async getRole(authorization: string | undefined): Promise<string> {
    const { id } = await this._tokenService.validate(authorization);
    const user = await this._model.findByPk(id);
    if (!user) throw new UnauthorizedError('User not found');
    return user.role;
  }

  public async list(authorization: string | undefined): Promise<IUserReturned[]> {
    const role = await this.getRole(authorization);
    if (role !== 'admin') {
      throw new UnauthorizedError('Only admin users can access this route');
    }
    const users = await this._model.findAll({ attributes: { exclude: ['password'] } });
    return users;
  }

  public async getByPk(pk: number, authorization: string | undefined): Promise<IUserReturned> {
    const role = await this.getRole(authorization);
    if (role !== 'admin') {
      throw new UnauthorizedError('Only admin users can access this route');
    }
    const user = await this._model.findByPk(pk, { attributes: { exclude: ['password'] } });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}

export default UserService;
