import { Router } from 'express';
import 'express-async-errors';
import { teamController } from '../msc';

const teamRoutes = Router();

teamRoutes.get('/', teamController.list);
teamRoutes.get('/:id', teamController.getByPk);

export default teamRoutes;
