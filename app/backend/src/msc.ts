import * as jwt from 'jsonwebtoken';
import TeamController from './controllers/TeamController';
import UserController from './controllers/UserController';
import AuthService from './services/AuthService';
import TeamService from './services/TeamService';
import UserService from './services/UserService';

const authService = new AuthService(jwt);

const userService = new UserService(authService);
const userController = new UserController(userService);

const teamService = new TeamService();
const teamController = new TeamController(teamService);

export {
  authService,
  userService,
  userController,
  teamService,
  teamController,
};
