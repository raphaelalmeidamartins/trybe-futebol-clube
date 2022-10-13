import express from 'express';
import swaggerUI from 'swagger-ui-express';
import leaderboardRoutes from './routes/leaderboardRoutes';
import loginRoutes from './routes/loginRoutes';
import matchRoutes from './routes/matchRoutes';
import teamRoutes from './routes/teamRoutes';
import userRoutes from './routes/userRoutes';
import swaggerSettingsBr from './swagger-br.json';
import swaggerSettingsEn from './swagger-en.json';
import authErrorMiddleware from './utils/middlewares/authErrorMiddleware';
import errorMiddleware from './utils/middlewares/errorMiddleware';
import validationErrorMiddleware from './utils/middlewares/validationErrorMiddleware';

const options = {};
class App {
  public app: express.Express;

  constructor() {
    this.app = express();

    this.config();

    // Não remover essa rota
    this.app.get('/', (req, res) => res.json({ ok: true }));
  }

  // eslint-disable-next-line max-lines-per-function
  private config():void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    };

    this.app.use(
      '/docs/br',
      swaggerUI.serveFiles(swaggerSettingsBr, options),
      swaggerUI.setup(swaggerSettingsBr),
    );
    this.app.use(
      '/docs/en',
      swaggerUI.serveFiles(swaggerSettingsEn, options),
      swaggerUI.setup(swaggerSettingsEn),
    );

    this.app.use(express.json());
    this.app.use(accessControl);

    this.app.use('/login', loginRoutes);
    this.app.use('/users', userRoutes);
    this.app.use('/teams', teamRoutes);
    this.app.use('/matches', matchRoutes);
    this.app.use('/leaderboard', leaderboardRoutes);

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
