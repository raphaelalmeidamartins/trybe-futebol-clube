import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import * as sinon from 'sinon';
// @ts-ignore
import chaiHttp = require('chai-http');

import { StatusCodes } from 'http-status-codes';
import { app } from '../app';
import User from '../database/models/User';
import { authService } from '../msc';
import {
  badLoginEmailMock,
  badLoginPasswordMock,
  mockToken, userMock,
  userMock2,
  userMockReturned,
  userMockReturned2, usersMockEmpty, usersMockReturned, validLoginMock,
  validLoginMock2
} from './mocks/loginUserMocks';

chai.use(chaiHttp);

const { expect } = chai;

describe('Check /login routes', () => {
  describe('POST', () => {
    afterEach(() => sinon.restore());

    it('should return a token if the credentials are valid', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);
      sinon.stub(jwt, 'sign').resolves(mockToken);

      const response = await chai
        .request(app)
        .post('/login').send(validLoginMock);
  
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body.token).to.be.eq(mockToken);
    });

    it('should return an error message if the password is invalid', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginPasswordMock[0]);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Incorrect email or password');
    });

    it('should return an error message if there is no user with the corresponding email', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginEmailMock[0]);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Incorrect email or password');
    });

    it('should return an error message if the email has an invalid format', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginEmailMock[1]);
  
      expect(response.status).to.be.eq(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(response.body.message).to.be.eq('Incorrect email or password');
    });

    it('should return an error message if the email is empty', async () => {
      sinon.stub(User, 'findOne').resolves(null);

      const response = await chai
        .request(app)
        .post('/login').send(badLoginEmailMock[2]);
  
      expect(response.status).to.be.eq(StatusCodes.BAD_REQUEST);
      expect(response.body.message).to.be.eq('All fields must be filled');
    });

    it('should return an error message if the password has an invalid format or empty', async () => {
      sinon.stub(User, 'findOne').resolves(null);

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
      sinon.stub(User, 'findOne').resolves(userMock as User);

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
      sinon.stub(User, 'findOne').resolves(userMock as User);

      const response = await chai
        .request(app)
        .get('/login/validate')
        .set('authorization', 'anything');
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Token must be a valid token');
    });

    it('should return the an error if there is no request.headers.authorization', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);

      const response = await chai
        .request(app)
        .get('/login/validate');
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Token not found');
    });

    it('should return the an error if there is no user with the corresponding request.headers.authorization', async () => {
      sinon.stub(User, 'findByPk').resolves(null);
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

describe('Check /users routes', () => {
  describe('GET', () => {
    afterEach(() => sinon.restore());

    it('should list all registered users', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);
      
      sinon.stub(User, 'findAll')
        .resolves(usersMockReturned as User[]);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .get('/users')
        .set('authorization', token);
  
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(usersMockReturned);
    });

    it('should return an empy array if there is no registered user', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);

      sinon.stub(User, 'findAll')
        .resolves(usersMockEmpty as User[]);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .get('/users')
        .set('authorization', token);
  
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(usersMockEmpty);
    });

    it('should return an error if the user does not have the permissions', async () => {
      sinon.stub(User, 'findOne').resolves(userMock2 as User);

      sinon.stub(User, 'findAll')
        .resolves(usersMockReturned as User[]);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock2);

      const response = await chai
        .request(app)
        .get('/users')
        .set('authorization', token);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Only admin users can access this route');
    });
  });

  describe('GET /:id', () => {
    afterEach(() => sinon.restore());

    it('should return the user corresponding to the id in the req.params', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);
      sinon.stub(User, 'findByPk').resolves(userMock as User);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      sinon.restore();
        sinon.stub(User, 'findOne').resolves(userMockReturned as User);

      const response = await chai
        .request(app)
        .get(`/users/${userMock.id}`)
        .set('authorization', token);
  
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(userMockReturned);
    });

    it('should return an error if there is no user with the id in the req.params', async () => {
      sinon.stub(User, 'findOne').resolves(userMock as User);
      
      sinon.stub(User, 'findByPk')
        .onFirstCall()
        .resolves(userMock as User)
        .onSecondCall()
        .resolves(null);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .get('/users/9999')
        .set('authorization', token);

      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('User not found');
    });

    it('should return an error if the user does not have permission to access this route', async () => {
      sinon.stub(User, 'findOne').resolves(userMock2 as User);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock2);

      const response = await chai
        .request(app)
        .get('/users/9999')
        .set('authorization', token);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Only admin users can access this route');
    });
  });
});
