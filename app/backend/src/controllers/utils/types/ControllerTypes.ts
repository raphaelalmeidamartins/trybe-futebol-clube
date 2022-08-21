import { Request, Response } from 'express';

interface IController {
  list(req: Request, res: Response): Promise<void>;
  getByPk(req: Request, res: Response): Promise<void>;
}

interface IUserController extends IController {
  login(req: Request, res: Response): Promise<void>;
  getRole(req: Request, res: Response): Promise<void>;
}

export default IController;
export { IUserController };
