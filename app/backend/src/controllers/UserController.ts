import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserService from '../services/UserService';

class UserController implements UserController {
  constructor(private _service: UserService) {
    this.login = this.login.bind(this);
    this.getRole = this.getRole.bind(this);
    this.list = this.list.bind(this);
    this.getByPk = this.getByPk.bind(this);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const token = await this._service.login(req.body);

    res.status(StatusCodes.OK).json({ token });
  }

  public async getRole(req: Request, res: Response): Promise<void> {
    const role = await this._service.getRole(req.headers.authorization);

    res.status(StatusCodes.OK).json({ role });
  }

  public async list(req: Request, res: Response): Promise<void> {
    const users = await this._service.list(req.headers.authorization);

    res.status(StatusCodes.OK).json(users);
  }

  public async getByPk(req: Request, res: Response): Promise<void> {
    const user = await this._service.getByPk(+req.params.id, req.headers.authorization);

    res.status(StatusCodes.OK).json(user);
  }
}

export default UserController;
