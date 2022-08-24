import { Request, Response } from 'express';

interface IController {
  list(req: Request, res: Response): Promise<void>;
  getByPk(req: Request, res: Response): Promise<void>;
  register?(req: Request, res: Response): Promise<void>;
  update?(req: Request, res: Response): Promise<void>;
}

interface IUserController extends IController {
  login(req: Request, res: Response): Promise<void>;
  getRole(req: Request, res: Response): Promise<void>;
}

interface IMatchController extends IController {
  finish(req: Request, res: Response): Promise<void>;
  getLeaderboardGeneral(_req: Request, res: Response): Promise<void>;
  getLeaderboardHome(_req: Request, res: Response): Promise<void>;
  getLeaderboardAway(_req: Request, res: Response): Promise<void>;
}

type ITeamController = IController;

export default IController;
export { IUserController, ITeamController, IMatchController };
