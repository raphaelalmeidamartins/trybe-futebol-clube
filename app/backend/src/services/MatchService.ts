import Match, { IMatch } from '../database/models/Match';
import Team from '../database/models/Team';
import BadRequestError from '../utils/errors/BadRequestError';
import NotFoundError from '../utils/errors/NotFoundError';
import { IMatchService } from './utils/types/ServiceTypes';

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

    const matches = await this._model.findAll({ ...INCLUDE_OPTIONS, where: { inProgress } });
    return matches;
  }

  public async getByPk(pk: number): Promise<IMatch> {
    const match = await this._model.findByPk(pk, { ...INCLUDE_OPTIONS });
    if (!match) throw new NotFoundError('Match not found');
    return match;
  }
}

export default MatchService;
