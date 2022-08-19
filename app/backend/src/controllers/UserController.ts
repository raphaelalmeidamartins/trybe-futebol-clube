import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserService from '../services/UserService';

class UserController {
  constructor(private _service: UserService) {
    this.login = this.login.bind(this);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const token = await this._service.login(req.body);
    console.log(token);

    res.status(StatusCodes.OK).json({ token });
  }
}

export default UserController;
