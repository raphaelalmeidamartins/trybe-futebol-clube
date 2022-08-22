import { Router } from 'express';
import 'express-async-errors';
import { matchController } from '../msc';

const leaderboardRoutes = Router();

leaderboardRoutes.get('/', matchController.getLeaderBoard);

export default leaderboardRoutes;
