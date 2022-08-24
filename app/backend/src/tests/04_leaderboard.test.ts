import * as bcrypt from 'bcryptjs';
import * as chai from 'chai';
import * as sinon from 'sinon';
// @ts-ignore
import chaiHttp = require('chai-http');

import { StatusCodes } from 'http-status-codes';
import { app } from '../app';
import Match, { IMatchReturned } from '../database/models/Match';
import Team from '../database/models/Team';
import { matchesMockFinished } from './mocks/matchesMocks';
import { teamsMock } from './mocks/teamsMocks';
import { mockLeaderboardAway, mockLeaderboardGeneral, mockLeaderboardHome } from './mocks/leaderboardMocks';

chai.use(chaiHttp);

const { expect } = chai;

describe('Check the /leaderboard routes', () => {
  beforeEach(() => {
    sinon.stub(Match, 'findAll').resolves(matchesMockFinished as unknown as Match[]);
    sinon.stub(Team, 'findAll').resolves(teamsMock as Team[]);
  });

  afterEach(() => sinon.restore());

  describe('GET /leaderboard', () => {
    it('should return the leaderboard with both home and away scores combined', async () => {
      const response = await chai
        .request(app)
        .get('/leaderboard');
      
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(mockLeaderboardGeneral);
    });
  });

  describe('GET /leaderboard/home', () => {
    it('should return the leaderboard with only home scores', async () => {
      const response = await chai
        .request(app)
        .get('/leaderboard/home');
      
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(mockLeaderboardHome);
    });
  });

  describe('GET /leaderboard/away', () => {
    it('should return the leaderboard with only away scores', async () => {
      const response = await chai
        .request(app)
        .get('/leaderboard/away');
      
      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(mockLeaderboardAway);
    });
  });
});
