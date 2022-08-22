import { Router } from 'express';
import 'express-async-errors';
import { matchController } from '../msc';

const leaderboardRoutes = Router();

leaderboardRoutes.get('/', matchController.getLeaderBoardGeneral);
leaderboardRoutes.get('/home', matchController.getLeaderBoardHome);
leaderboardRoutes.get('/away', matchController.getLeaderBoardAway);

export default leaderboardRoutes;
