import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import LeaderboardService from '../services/LeaderboardService';
import { IMatch } from '../database/models/Match';
import MatchService from '../services/MatchService';
import IController from './utils/types/ControllerTypes';

class MatchController implements IController {
  constructor(
    private _service: MatchService,
    private _leaderboardService: LeaderboardService,
  ) {
    this.list = this.list.bind(this);
    this.getByPk = this.getByPk.bind(this);
    this.register = this.register.bind(this);
    this.update = this.update.bind(this);
    this.finish = this.finish.bind(this);
    this.getLeaderBoardGeneral = this.getLeaderBoardGeneral.bind(this);
    this.getLeaderBoardHome = this.getLeaderBoardHome.bind(this);
    this.getLeaderBoardAway = this.getLeaderBoardAway.bind(this);
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
      req.headers.authorization,
      req.body,
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

  public async getLeaderBoardGeneral(_req: Request, res: Response): Promise<void> {
    const leaderboard = await this._leaderboardService.getLeaderBoard('general');

    res.status(StatusCodes.OK).json(leaderboard);
  }

  public async getLeaderBoardHome(_req: Request, res: Response): Promise<void> {
    const leaderboard = await this._leaderboardService.getLeaderBoard('home');

    res.status(StatusCodes.OK).json(leaderboard);
  }

  public async getLeaderBoardAway(_req: Request, res: Response): Promise<void> {
    const leaderboard = await this._leaderboardService.getLeaderBoard('away');

    res.status(StatusCodes.OK).json(leaderboard);
  }
}

export default MatchController;
