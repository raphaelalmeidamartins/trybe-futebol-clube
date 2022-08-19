import * as bcrypt from 'bcryptjs';
import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import * as sinon from 'sinon';
// @ts-ignore
import chaiHttp = require('chai-http');

import { app } from '../app';

// import { Response } from 'superagent';
import { IAuthBody } from '../services/utils/types/AuthTypes';
import UserRepository, { IUser } from '../database/models/User';
import { StatusCodes } from 'http-status-codes';
import { authService } from '../msc';

chai.use(chaiHttp);

const { expect } = chai;

const mockToken: string = 'mock-token'

const badLoginPasswordMock: IAuthBody[] = [
  {
    email: 'rapha@admin.com',
    password: 'secret_rapha'
  },
  {
    email: 'rapha@admin.com',
    password: ''
  },
];

const badLoginEmailMock: IAuthBody[] = [
  {
    email: 'rapha@user.com',
    password: 'raphapassword'
  },
  {
    email: 'rapha@admin',
    password: 'secret_rapha'
  },
  {
    email: '',
    password: 'secret_rapha'
  },
];

const validLoginMock: IAuthBody = {
  email: 'rapha@admin.com',
  password: 'raphapassword'
};

const userMock: IUser = {
  id: 1,
  email: 'rapha@admin.com',
  password: bcrypt.hashSync('raphapassword', 12),
  username: 'rapha',
  role: 'admin'
}

describe('Check /login routes', () => {
  describe('POST', () => {
    afterEach(() => sinon.restore());

    it('should return a token if the credentials are valid', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(userMock as UserRepository);
      sinon.stub(jwt, 'sign').resolves(mockToken);

      const response = await chai
        .request(app)
        .post('/login').send(validLoginMock);
  
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body.token).to.be.eq(mockToken);
    });

    it('should return an error message if the password is invalid', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(userMock as UserRepository);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginPasswordMock[0]);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Incorrect email or password');
    });

    it('should return an error message if there is no user with the corresponding email', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginEmailMock[0]);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Incorrect email or password');
    });

    it('should return an error message if the email has an invalid format', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginEmailMock[1]);
  
      expect(response.status).to.be.eq(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(response.body.message).to.be.eq('Incorrect email or password');
    });

    it('should return an error message if the email is empty', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginEmailMock[2]);
  
      expect(response.status).to.be.eq(StatusCodes.BAD_REQUEST);
      expect(response.body.message).to.be.eq('All fields must be filled');
    });

    it('should return an error message if the password has an invalid format or empty', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginPasswordMock[1]);
  
      expect(response.status).to.be.eq(StatusCodes.BAD_REQUEST);
      expect(response.body.message).to.be.eq('All fields must be filled');
    });
  });

  describe('GET /validate', () => {
    afterEach(() => sinon.restore());

    it('should return the role of the user according to the request.headers.authorization', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(userMock as UserRepository);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .get('/login/validate')
        .set('authorization', token);
  
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body.role).to.be.eq(userMock.role);
    });

    it('should return the an error if the request.headers.authorization is invalid', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(userMock as UserRepository);

      const response = await chai
        .request(app)
        .get('/login/validate')
        .set('authorization', 'anything');
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Invalid token');
    });

    it('should return the an error if there is no request.headers.authorization', async () => {
      sinon.stub(UserRepository, 'findOne').resolves(userMock as UserRepository);

      const response = await chai
        .request(app)
        .get('/login/validate');
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Token not found');
    });

    it('should return the an error if there is no user with the corresponding request.headers.authorization', async () => {
      sinon.stub(UserRepository, 'findByPk').resolves(null);
      sinon.stub(authService, 'validate').resolves({ id: 9999 });

      const response = await chai
        .request(app)
        .get('/login/validate')
        .set('authorization', 'anything');
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('User not found');
    });
  });
});
