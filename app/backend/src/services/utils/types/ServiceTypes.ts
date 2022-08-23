import { IMatch } from '../../../database/models/Match';
import { IUser, IUserReturned } from '../../../database/models/User';
import { IAuthBody } from './AuthTypes';

interface IService<Entity, Pk> {
  list(authorization?: string | undefined): Promise<Entity[]>;
  getByPk(pk: Pk, authorization?: string | undefined): Promise<Entity>;
}

type IValidatorFunction<Body> = (data: Body) => Body;

interface IUserService extends IService<IUserReturned, number> {
  validate: {
    body: {
      login: IValidatorFunction<IAuthBody>,
    },
    username(email: string): Promise<IUser>,
    password(user: IUser, password: string): Promise<void>,
  },
  login(data: IAuthBody): Promise<string>;
  getRole(authorization: string | undefined): Promise<string>;
}

interface IMatchService extends IService<IMatch, number> {
  listByProgress(param: string): Promise<IMatch[]>;
}

export default IService;
export { IValidatorFunction, IUserService, IMatchService };
