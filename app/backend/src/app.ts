import * as express from 'express';
import loginRoutes from './routes/loginRoutes';
import teamRoutes from './routes/teamRoutes';
import authErrorMiddleware from './utils/middlewares/authErrorMiddleware';
import errorMiddleware from './utils/middlewares/errorMiddleware';
import validationErrorMiddleware from './utils/middlewares/validationErrorMiddleware';

class App {
  public app: express.Express;

  constructor() {
    this.app = express();

    this.config();

    // Não remover essa rota
    this.app.get('/', (req, res) => res.json({ ok: true }));
  }

  private config():void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    };

    this.app.use(express.json());
    this.app.use(accessControl);

    this.app.use('/login', loginRoutes);
    this.app.use('/teams', teamRoutes);

    this.app.use(authErrorMiddleware);
    this.app.use(validationErrorMiddleware);
    this.app.use(errorMiddleware);
  }

  public start(PORT: string | number):void {
    this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
  }
}

export { App };

// A execução dos testes de cobertura depende dessa exportação
export const { app } = new App();
