import { Router } from 'express';
import 'express-async-errors';
import { userController } from '../msc';

const loginRoutes = Router();

loginRoutes.post('/', userController.login);
loginRoutes.get('/validate', userController.getRole);

export default loginRoutes;
