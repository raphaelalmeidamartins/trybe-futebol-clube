import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserService from '../services/UserService';

class UserController {
  constructor(private _service: UserService) {
    this.login = this.login.bind(this);
    this.getRole = this.getRole.bind(this);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const token = await this._service.login(req.body);

    res.status(StatusCodes.OK).json({ token });
  }

  public async getRole(req: Request, res: Response): Promise<void> {
    const role = await this._service.getRole(req.headers.authorization);

    res.status(StatusCodes.OK).json({ role });
  }
}

export default UserController;
