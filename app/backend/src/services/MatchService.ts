import * as Joi from 'joi';
import Match, {
  IMatch,
  IMatchCreation,
  IMatchUpdate,
} from '../database/models/Match';
import Team, { ITeam } from '../database/models/Team';
import BadRequestError from '../utils/errors/BadRequestError';
import NotFoundError from '../utils/errors/NotFoundError';
import UnauthorizedError from '../utils/errors/UnauthorizedError';
import IAuthService from './utils/types/AuthTypes';
import ILeaderBoard, { ITeamScore } from './utils/types/LeaderboardTypes';
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

const sortCompareFunction = (prev: ITeamScore, curr: ITeamScore) => {
  const comp = {
    totalPoints: prev.totalPoints === curr.totalPoints,
    totalVictories: prev.totalVictories === curr.totalVictories,
    goalsBalance: prev.goalsBalance === curr.goalsBalance,
  };
  if (
    comp.totalPoints && !comp.totalVictories) {
    return curr.totalVictories - prev.totalVictories;
  }
  if (comp.totalPoints && comp.totalVictories && !comp.goalsBalance) {
    return curr.goalsBalance - prev.goalsBalance;
  }
  return curr.totalPoints - prev.totalPoints;
};

class MatchService implements IMatchService {
  private _model = Match;
  private _teamModel = Team;

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

  private async getTeamMatchesData(teamId: number): Promise<number[]> {
    const matches = await this.listByProgress('false');
    const teamHomeMatches = matches.filter(({ homeTeam }) => homeTeam === teamId);
    const teamAwayMatches = matches.filter(({ awayTeam }) => awayTeam === teamId);
    const allTeamMatches = [...teamHomeMatches, ...teamAwayMatches];

    const totalDraws = allTeamMatches
      .filter((m) => m.homeTeamGoals === m.awayTeamGoals)
      .length;

    const totalLosses = [
      ...teamHomeMatches.filter((m) => m.homeTeamGoals < m.awayTeamGoals),
      ...teamAwayMatches.filter((m) => m.homeTeamGoals > m.awayTeamGoals),
    ].length;

    const totalVictories = [
      ...teamHomeMatches.filter((m) => m.homeTeamGoals > m.awayTeamGoals),
      ...teamAwayMatches.filter((m) => m.homeTeamGoals < m.awayTeamGoals),
    ].length;

    return [totalDraws, totalLosses, totalVictories, allTeamMatches.length];
  }

  private async getTeamGoals(teamId: number) {
    const matches = await this.listByProgress('false');

    const goalsFavor = matches.reduce((acc, currMatch) => {
      if (currMatch.homeTeam === teamId) return acc + currMatch.homeTeamGoals;
      if (currMatch.awayTeam === teamId) return acc + currMatch.awayTeamGoals;
      return acc;
    }, 0);

    const goalsOwn = matches.reduce((acc, currMatch) => {
      if (currMatch.homeTeam === teamId) return acc + currMatch.awayTeamGoals;
      if (currMatch.awayTeam === teamId) return acc + currMatch.homeTeamGoals;
      return acc;
    }, 0);

    return [goalsFavor, goalsOwn];
  }

  private async generateTeamScores(team: ITeam) {
    const [
      totalDraws, totalLosses, totalVictories, totalGames,
    ] = await this.getTeamMatchesData(team.id);
    const totalPoints = totalVictories * 3 + totalDraws * 1;
    const [goalsFavor, goalsOwn] = await this.getTeamGoals(team.id);

    const teamScore: ITeamScore = {
      name: team.teamName,
      totalPoints,
      totalGames,
      totalVictories,
      totalDraws,
      totalLosses,
      goalsFavor,
      goalsOwn,
      goalsBalance: goalsFavor - goalsOwn,
      efficiency: ((totalPoints / (totalGames * 3)) * 100).toFixed(2),
    };

    return teamScore;
  }

  public async getLeaderBoard() {
    const teams = await this._teamModel.findAll();
    const results: Promise<ITeamScore>[] = [];

    for (let i = 0; i < teams.length; i += 1) {
      const teamScore: Promise<ITeamScore> = this.generateTeamScores(teams[i]);
      results.push(teamScore);
    }

    const board: ILeaderBoard = await Promise.all(results);

    return board.sort(sortCompareFunction);
  }

  public async getByPk(pk: number): Promise<IMatch> {
    const match = await this._model.findByPk(pk, { ...INCLUDE_OPTIONS });
    if (!match) throw new NotFoundError('Match not found');
    return match;
  }

  public async register(
    authorization: string | undefined,
    data: IMatchCreation,
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

  public async update(data: IMatchUpdate, id: number): Promise<void> {
    this.validate.body.update(data);
    await this._model.update(data, { where: { id } });
  }

  public async finish(
    authorization: string | undefined,
    id: number,
  ): Promise<void> {
    await this._tokenService.validate(authorization);
    await this._model.update({ inProgress: false }, { where: { id } });
  }
}

export default MatchService;
