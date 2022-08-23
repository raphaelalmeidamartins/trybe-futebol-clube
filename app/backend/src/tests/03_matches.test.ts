import * as bcrypt from 'bcryptjs';
import * as chai from 'chai';
import * as sinon from 'sinon';
// @ts-ignore
import chaiHttp = require('chai-http');

import { StatusCodes } from 'http-status-codes';
import { app } from '../app';
import Match, { IMatchReturned } from '../database/models/Match';
import Team from '../database/models/Team';
import User, { IUser } from '../database/models/User';
import { validLoginMock } from './mocks/loginMocks';
import { matchesMock, matchMock, mockCreationBody, mockCreationBodyInvalidAway, mockCreationBodyInvalidBoth, mockCreationBodyInvalidHome, mockCreationReturn, mockUpdateBody } from './mocks/matchesMocks';
import { teamMock } from './mocks/teamsMocks';

chai.use(chaiHttp);

const { expect } = chai;

const INCLUDE_OPTIONS = {
  include: [
    {
      model: Team,
      as: 'teamHome',
      attributes: ['teamName'],
    },
    {
      model: Team,
      as: 'teamAway',
      attributes: ['teamName'],
    },
  ],
};

const userMock: IUser = {
  id: 1,
  email: 'rapha@admin.com',
  password: bcrypt.hashSync('raphapassword', 12),
  username: 'rapha',
  role: 'admin'
}

const matchesEmpty: IMatchReturned[] = [];

describe('Check /matches routes', () => {
  describe('GET', () => {
    afterEach(() => sinon.restore());

    it('should list all registered matches', async () => {
      sinon
        .stub(Match, 'findAll')
        .resolves(matchesMock as unknown[] as Match[])
        .withArgs({ ...INCLUDE_OPTIONS });

      const response = await chai.request(app).get('/matches');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(matchesMock);
    });

    it('should list all registered matches according to the query inProgress=true', async () => {
      const filteredMatches = matchesMock.filter(({ inProgress }) => inProgress);

      sinon
        .stub(Match, 'findAll')
        .resolves(filteredMatches as unknown[] as Match[])
        .withArgs({ ...INCLUDE_OPTIONS });

      const response = await chai.request(app).get('/matches?inProgress=true');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(filteredMatches);
    });

    it('should list all registered matches according to the query inProgress=false', async () => {
      const filteredMatches = matchesMock.filter(({ inProgress }) => !inProgress);

      sinon
        .stub(Match, 'findAll')
        .resolves(filteredMatches as unknown[] as Match[])
        .withArgs({ ...INCLUDE_OPTIONS });

      const response = await chai.request(app).get('/matches?inProgress=false');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(filteredMatches);
    });

    it('should an empty array if there is no registered matches', async () => {
      sinon
        .stub(Match, 'findAll')
        .resolves(matchesEmpty as unknown[] as Match[]);

      const response = await chai.request(app).get('/matches');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(matchesEmpty);
    });
  });

  describe('GET /:id', () => {
    afterEach(() => sinon.restore());

    it('should return the match corresponding to the id in the req.params', async () => {
      sinon
        .stub(Match, 'findByPk')
        .resolves(matchMock as unknown as Match)
        .withArgs(matchMock.id, { ...INCLUDE_OPTIONS });

      const response = await chai
        .request(app)
        .get(`/matches/${matchMock.id}`);

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(matchMock);
    });

    it('should throw not found error if there is no team with the corresponding id in the req.params', async () => {
      sinon
        .stub(Match, 'findByPk')
        .resolves(null);

      const response = await chai
        .request(app)
        .get('/matches/99999');

      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('Match not found');
    });
  });

  describe('POST', () => {
    beforeEach(() => sinon.stub(User, 'findOne').resolves(userMock as User));
    afterEach(() => sinon.restore());

    it('should return the match object after its creation', async () => {
      sinon.stub(Team, 'findByPk')
        .resolves({} as Team);

      sinon
        .stub(Match, 'create')
        .resolves(mockCreationReturn as unknown as Match);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .post('/matches')
        .set('authorization', token)
        .send(mockCreationBody);

      expect(response.status).to.be.eq(StatusCodes.CREATED);
      expect(response.body).to.be.deep.eq(mockCreationReturn);
    });

    it('should return the an error if there is no request.headers.authorization', async () => {
      sinon
        .stub(Match, 'create')
        .resolves(null as unknown as Match);

      const response = await chai
        .request(app)
        .post('/matches')
        .send(mockCreationBody);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Token not found');
    });

    it('should return the an error if there is no team with the provided ids (home)', async () => {
      sinon.stub(Team, 'findByPk').resolves(null);

      sinon
        .stub(Match, 'create')
        .resolves(null as unknown as Match);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .post('/matches')
        .set('authorization', token)
        .send(mockCreationBodyInvalidHome);
  
      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('There is no team with such id!');
    });

    it('should return the an error if there is no team with the provided ids (away)', async () => {
      sinon.stub(Team, 'findByPk').resolves(null);

      sinon
        .stub(Match, 'create')
        .resolves(null as unknown as Match);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .post('/matches')
        .set('authorization', token)
        .send(mockCreationBodyInvalidAway);
  
      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('There is no team with such id!');
    });

    it('should return the an error if both teams ids are identical', async () => {
      sinon.stub(Team, 'findByPk').resolves(teamMock as Team);

      sinon
        .stub(Match, 'create')
        .resolves(null as unknown as Match);

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .post('/matches')
        .set('authorization', token)
        .send(mockCreationBodyInvalidBoth);
  
      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('It is not possible to create a match with two equal teams');
    });
  });

  describe('PATCH /:id', () => {
    beforeEach(() => sinon.stub(User, 'findOne').resolves(userMock as User));
    afterEach(() => sinon.restore());

    it('should return the message "Updated" if the update is successful', async () => {
      sinon
        .stub(Match, 'update');

      sinon
        .stub(Match, 'findByPk')
        .resolves(matchMock as unknown as Match)
        .withArgs(matchMock.id, { ...INCLUDE_OPTIONS });

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .patch(`/matches/${matchMock.id}`)
        .set('authorization', token)
        .send(mockUpdateBody);

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body.message).to.be.eq('Updated');
    });

    it('should return the an error if there is no request.headers.authorization', async () => {
      sinon
        .stub(Match, 'update');

      sinon
        .stub(Match, 'findByPk')
        .resolves(matchMock as unknown as Match)
        .withArgs(matchMock.id, { ...INCLUDE_OPTIONS });

      const response = await chai
        .request(app)
        .patch(`/matches/${matchMock.id}`)
        .send(mockUpdateBody);

      expect(response.status).to.be.eq(StatusCodes.UNAUTHORIZED);
      expect(response.body.message).to.be.eq('Token not found');
    });

    it('should return the an error if there is no match with the id in the req.params', async () => {
      sinon
        .stub(Match, 'update');

      sinon
        .stub(Match, 'findByPk')
        .resolves(null as unknown as Match)
        .withArgs(99999, { ...INCLUDE_OPTIONS });

      const { body: { token } } = await chai
        .request(app)
        .post('/login').send(validLoginMock);

      const response = await chai
        .request(app)
        .patch('/matches/99999')
        .set('authorization', token)
        .send(mockUpdateBody);

      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('Match not found');
    });
  });
});
