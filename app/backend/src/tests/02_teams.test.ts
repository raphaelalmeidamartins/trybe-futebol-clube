import * as chai from 'chai';
import * as sinon from 'sinon';
// @ts-ignore
import chaiHttp = require('chai-http');

import { app } from '../app';
import { StatusCodes } from 'http-status-codes';
import Team, { ITeam } from '../database/models/Team';
import { teamMock, teamsEmpty, teamsMock } from './mocks/teamsMocks';

chai.use(chaiHttp);

const { expect } = chai;

describe('Check /teams routes', () => {
  describe('GET', () => {
    afterEach(() => sinon.restore());

    it('should list all registered teams', async () => {
      sinon
        .stub(Team, 'findAll')
        .resolves(teamsMock as Team[]);

      const response = await chai.request(app).get('/teams');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(teamsMock);
    });

    it('should an empty array if there is no registered tems', async () => {
      sinon
        .stub(Team, 'findAll')
        .resolves(teamsEmpty as Team[]);

      const response = await chai.request(app).get('/teams');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(teamsEmpty);
    });
  });

  describe('GET /:id', () => {
    afterEach(() => sinon.restore());

    it('should return the team corresponding to the id in the req.params', async () => {
      sinon
        .stub(Team, 'findByPk')
        .resolves(teamMock as Team);

      const response = await chai
        .request(app)
        .get(`/teams/${teamMock.id}`);

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(teamMock);
    });

    it('should throw not found error if there is no team with the corresponding id in the req.params', async () => {
      sinon
        .stub(Team, 'findByPk')
        .resolves(null);

      const response = await chai
        .request(app)
        .get('/teams/99999');

      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('Team not found');
    });
  });
});
