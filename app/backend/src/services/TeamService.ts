import Team, { ITeam } from '../database/models/Team';
import NotFoundError from '../utils/errors/NotFoundError';
import { ITeamService } from './utils/types/ServiceTypes';

class TeamService implements ITeamService {
  private _model = Team;

  public async list(): Promise<ITeam[]> {
    const teams = await this._model.findAll();
    return teams;
  }

  public async getByPk(pk: number): Promise<ITeam> {
    const team = await this._model.findByPk(pk);
    if (!team) throw new NotFoundError('Team not found');
    return team;
  }
}

export default TeamService;
