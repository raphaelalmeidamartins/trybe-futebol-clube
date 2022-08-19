import * as jwt from 'jsonwebtoken';
import UserController from './controllers/UserController';
import AuthService from './services/AuthService';
import UserService from './services/UserService';

const authService = new AuthService(jwt);

const userService = new UserService(authService);
const userController = new UserController(userService);

export default userController;
