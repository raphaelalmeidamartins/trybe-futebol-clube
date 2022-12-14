import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMatch } from '../database/models/Match';
import LeaderboardService from '../services/LeaderboardService';
import MatchService from '../services/MatchService';
import { IMatchController } from './utils/types/ControllerTypes';

class MatchController implements IMatchController {
  constructor(
    private _service: MatchService,
    private _leaderboardService: LeaderboardService,
  ) {
    this.list = this.list.bind(this);
    this.getByPk = this.getByPk.bind(this);
    this.register = this.register.bind(this);
    this.update = this.update.bind(this);
    this.finish = this.finish.bind(this);
    this.getLeaderboardGeneral = this.getLeaderboardGeneral.bind(this);
    this.getLeaderboardHome = this.getLeaderboardHome.bind(this);
    this.getLeaderboardAway = this.getLeaderboardAway.bind(this);
  }

  public async list(req: Request, res: Response): Promise<void> {
    let matches: IMatch[] = [];

    const { inProgress } = req.query;

    if (inProgress) {
      matches = await this._service.listByProgress(inProgress as string);
    } else {
      matches = await this._service.list();
    }

    res.status(StatusCodes.OK).json(matches);
  }

  public async getByPk(req: Request, res: Response): Promise<void> {
    const match = await this._service.getByPk(+req.params.id);

    res.status(StatusCodes.OK).json(match);
  }

  public async register(req: Request, res: Response): Promise<void> {
    const match = await this._service.register(
      req.body,
      req.headers.authorization,
    );

    res.status(StatusCodes.CREATED).json(match);
  }

  public async update(req: Request, res: Response): Promise<void> {
    await this._service.update(req.headers.authorization, req.body, +req.params.id);

    res.status(StatusCodes.OK).json({ message: 'Updated' });
  }

  public async finish(req: Request, res: Response): Promise<void> {
    await this._service.finish(req.headers.authorization, +req.params.id);

    res.status(StatusCodes.OK).json({ message: 'Finished' });
  }

  public async getLeaderboardGeneral(_req: Request, res: Response): Promise<void> {
    const leaderboard = await this._leaderboardService.getLeaderboard('general');

    res.status(StatusCodes.OK).json(leaderboard);
  }

  public async getLeaderboardHome(_req: Request, res: Response): Promise<void> {
    const leaderboard = await this._leaderboardService.getLeaderboard('home');

    res.status(StatusCodes.OK).json(leaderboard);
  }

  public async getLeaderboardAway(_req: Request, res: Response): Promise<void> {
    const leaderboard = await this._leaderboardService.getLeaderboard('away');

    res.status(StatusCodes.OK).json(leaderboard);
  }
}

export default MatchController;
