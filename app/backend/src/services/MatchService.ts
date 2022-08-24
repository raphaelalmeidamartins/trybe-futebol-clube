import * as Joi from 'joi';
import Match, {
  IMatch,
  IMatchCreation,
  IMatchUpdate,
} from '../database/models/Match';
import Team from '../database/models/Team';
import BadRequestError from '../utils/errors/BadRequestError';
import NotFoundError from '../utils/errors/NotFoundError';
import UnauthorizedError from '../utils/errors/UnauthorizedError';
import IAuthService from './utils/types/AuthTypes';
import { IMatchService, IValidatorFunction } from './utils/types/ServiceTypes';
import validator from './utils/validator';

const INCLUDE_OPTIONS = {
  include: [
    {
      model: Team,
      as: 'teamHome',
      attributes: ['teamName'],
    },
    {
      model: Team,
      as: 'teamAway',
      attributes: ['teamName'],
    },
  ],
};

class MatchService implements IMatchService {
  private _model = Match;

  constructor(private _tokenService: IAuthService) {}

  public validate = {
    body: {
      register: validator(
        Joi.object({
          homeTeam: Joi.number().positive().required(),
          awayTeam: Joi.number().positive().required(),
          homeTeamGoals: Joi.number().min(0).required(),
          awayTeamGoals: Joi.number().min(0).required(),
          inProgress: Joi.boolean().optional(),
        }),
      ) as IValidatorFunction<IMatchCreation>,
      update: validator(
        Joi.object({
          homeTeamGoals: Joi.number().min(0).required(),
          awayTeamGoals: Joi.number().min(0).required(),
        }),
      ) as IValidatorFunction<IMatchUpdate>,
    },
    async team(pk: number): Promise<void> {
      const team = await Team.findByPk(pk);
      if (!team) throw new NotFoundError('There is no team with such id!');
    },
  };

  public async list(): Promise<IMatch[]> {
    const matches = await this._model.findAll({ ...INCLUDE_OPTIONS });
    return matches;
  }

  public async listByProgress(query: string): Promise<IMatch[]> {
    let inProgress = false;
    if (query !== 'true' && query !== 'false') {
      throw new BadRequestError('Invalid query');
    }
    inProgress = query === 'true';

    const matches = await this._model.findAll({
      ...INCLUDE_OPTIONS,
      where: { inProgress },
    });
    return matches;
  }

  public async getByPk(pk: number): Promise<IMatch> {
    const match = await this._model.findByPk(pk, { ...INCLUDE_OPTIONS });
    if (!match) throw new NotFoundError('Match not found');
    return match;
  }

  public async register(
    data: IMatchCreation,
    authorization: string | undefined,
  ): Promise<IMatch> {
    await this._tokenService.validate(authorization);
    this.validate.body.register(data);

    if (data.homeTeam === data.awayTeam) {
      throw new UnauthorizedError(
        'It is not possible to create a match with two equal teams',
      );
    }

    await this.validate.team(data.homeTeam);
    await this.validate.team(data.awayTeam);

    const match = await this._model.create({
      ...data,
      inProgress: true,
    });
    return match;
  }

  public async update(
    authorization: string | undefined,
    data: IMatchUpdate,
    id: number,
  ): Promise<void> {
    this.validate.body.update(data);
    await this._tokenService.validate(authorization);
    await this.getByPk(id);
    await this._model.update(data, { where: { id } });
  }

  public async finish(
    authorization: string | undefined,
    id: number,
  ): Promise<void> {
    await this._tokenService.validate(authorization);
    await this.getByPk(id);
    await this._model.update({ inProgress: false }, { where: { id } });
  }
}

export default MatchService;
