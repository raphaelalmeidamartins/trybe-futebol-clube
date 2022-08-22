import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMatch } from '../database/models/Match';
import MatchService from '../services/MatchService';
import IController from './utils/types/ControllerTypes';

class MatchController implements IController {
  constructor(private _service: MatchService) {
    this.list = this.list.bind(this);
    this.getByPk = this.getByPk.bind(this);
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
}

export default MatchController;
