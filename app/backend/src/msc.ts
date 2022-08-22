import * as jwt from 'jsonwebtoken';
import MatchController from './controllers/MatchController';
import TeamController from './controllers/TeamController';
import UserController from './controllers/UserController';
import AuthService from './services/AuthService';
import MatchService from './services/MatchService';
import TeamService from './services/TeamService';
import UserService from './services/UserService';

const authService = new AuthService(jwt);

const userService = new UserService(authService);
const userController = new UserController(userService);

const teamService = new TeamService();
const teamController = new TeamController(teamService);

const matchService = new MatchService(authService);
const matchController = new MatchController(matchService);

export {
  authService,
  userService,
  userController,
  teamService,
  teamController,
  matchService,
  matchController,
};
