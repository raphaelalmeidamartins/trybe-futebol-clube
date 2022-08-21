import { Router } from 'express';
import 'express-async-errors';
import { userController } from '../msc';

const userRoutes = Router();

userRoutes.get('/', userController.list);
userRoutes.get('/:id', userController.getByPk);

export default userRoutes;
