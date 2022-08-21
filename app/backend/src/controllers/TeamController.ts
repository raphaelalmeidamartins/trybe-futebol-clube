import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TeamService from '../services/TeamService';
import IController from './utils/types/ControllerTypes';

class TeamController implements IController {
  constructor(private _service: TeamService) {
    this.list = this.list.bind(this);
    this.getByPk = this.getByPk.bind(this);
  }

  public async list(_req: Request, res: Response): Promise<void> {
    const teams = await this._service.list();

    res.status(StatusCodes.OK).json(teams);
  }

  public async getByPk(req: Request, res: Response): Promise<void> {
    const team = await this._service.getByPk(+req.params.id);

    res.status(StatusCodes.OK).json(team);
  }
}

export default TeamController;
