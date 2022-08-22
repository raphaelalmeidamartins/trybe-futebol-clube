import { Router } from 'express';
import 'express-async-errors';
import { matchController } from '../msc';

const matchRoutes = Router();

matchRoutes.get('/', matchController.list);
matchRoutes.get('/:id', matchController.getByPk);

export default matchRoutes;
