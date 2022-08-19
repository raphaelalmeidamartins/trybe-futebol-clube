import * as bcrypt from 'bcryptjs';
import * as Joi from 'joi';
import UserRepository, { IUser } from '../database/models/User';
import UnauthorizedError from '../utils/errors/UnauthorizedError';
import IAuthService, { IAuthBody } from './utils/types/AuthTypes';
import validator from './utils/validator';

const REQUIRED_MSG = 'All fields must be filled';
const INVALID_FIELDS_MSG = 'Incorrect email or password';

class UserService {
  constructor(private tokenService: IAuthService) {
    this.tokenService = tokenService;
  }

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
      ),
    },
    username: async (email: string): Promise<IUser> => {
      const user: IUser | null = await UserRepository.findOne({ where: { email } });
      if (!user) throw new UnauthorizedError(INVALID_FIELDS_MSG);
      return user;
    },
    password: async (user: IUser, password: string): Promise<void> => {
      if (bcrypt.compareSync(user.password, password)) {
        throw new UnauthorizedError(INVALID_FIELDS_MSG);
      }
    },
  };

  public async login(data: IAuthBody): Promise<string> {
    await this.validate.body.login(data);
    const user = await this.validate.username(data.email);
    await this.validate.password(user, data.password);
    const token = await this.tokenService.generate(user.id);

    return token;
  }
}

export default UserService;
