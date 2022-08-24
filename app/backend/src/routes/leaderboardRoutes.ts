import { Router } from 'express';
import 'express-async-errors';
import { matchController } from '../msc';

const leaderboardRoutes = Router();

leaderboardRoutes.get('/', matchController.getLeaderboardGeneral);
leaderboardRoutes.get('/home', matchController.getLeaderboardHome);
leaderboardRoutes.get('/away', matchController.getLeaderboardAway);

export default leaderboardRoutes;
