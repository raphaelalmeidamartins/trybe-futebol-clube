import {
  IMatch,
  IMatchCreation,
  IMatchUpdate,
} from '../../../database/models/Match';
import { ITeam, ITeamCreation } from '../../../database/models/Team';
import {
  IUser,
  IUserCreation,
  IUserReturned,
} from '../../../database/models/User';
import { IAuthBody } from './AuthTypes';
import ILeaderboard from './LeaderboardTypes';

interface IService<Entity, EntityCreation, Pk> {
  list(authorization?: string | undefined): Promise<Entity[]>;
  getByPk(pk: Pk, authorization?: string | undefined): Promise<Entity>;
  register?(
    data: EntityCreation,
    authorization?: string | undefined
  ): Promise<Entity>;
  update?(
    authorization: string | undefined,
    data: IMatchUpdate,
    pk: number
  ): Promise<void>;
}

type IValidatorFunction<Body> = (data: Body) => Body;

interface IUserService extends IService<IUserReturned, IUserCreation, number> {
  validate: {
    body: {
      login: IValidatorFunction<IAuthBody>;
    };
    username(email: string): Promise<IUser>;
    password(user: IUser, password: string): Promise<void>;
  };
  login(data: IAuthBody): Promise<string>;
  getRole(authorization: string | undefined): Promise<string>;
}

interface IMatchService extends IService<IMatch, IMatchCreation, number> {
  validate: {
    body: {
      register: IValidatorFunction<IMatchCreation>;
      update: IValidatorFunction<IMatchUpdate>;
    };
    team(pk: number): Promise<void>;
  };
  listByProgress(param: string): Promise<IMatch[]>;
  finish(authorization: string | undefined, id: number): Promise<void>;
}

type ITeamService = IService<ITeam, ITeamCreation, number>;

interface ILeaderboardService {
  getLeaderboard(filter: 'general' | 'home' | 'away'): Promise<ILeaderboard>;
}

export default IService;
export {
  IValidatorFunction,
  IUserService,
  IMatchService,
  ITeamService,
  ILeaderboardService,
};
