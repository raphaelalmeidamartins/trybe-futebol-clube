import * as bcrypt from 'bcryptjs';
import * as chai from 'chai';
import * as sinon from 'sinon';
// @ts-ignore
import chaiHttp = require('chai-http');

import { app } from '../app';
import { StatusCodes } from 'http-status-codes';
import TeamRepository, { ITeam } from '../database/models/Team';

chai.use(chaiHttp);

const { expect } = chai;

const teamMock = {
  id: 1,
  teamName: 'Avaí/Kindermann',
};

const teamsMock = [
  {
    id: 1,
    teamName: 'Avaí/Kindermann',
  },
  {
    id: 2,
    teamName: 'Bahia',
  },
  {
    id: 3,
    teamName: 'Botafogo',
  },
  {
    id: 4,
    teamName: 'Corinthians',
  },
  {
    id: 5,
    teamName: 'Cruzeiro',
  },
  {
    id: 6,
    teamName: 'Ferroviária',
  },
  {
    id: 7,
    teamName: 'Flamengo',
  },
  {
    id: 8,
    teamName: 'Grêmio',
  },
  {
    id: 9,
    teamName: 'Internacional',
  },
  {
    id: 10,
    teamName: 'Minas Brasília',
  },
  {
    id: 11,
    teamName: 'Napoli-SC',
  },
  {
    id: 12,
    teamName: 'Palmeiras',
  },
  {
    id: 13,
    teamName: 'Real Brasília',
  },
  {
    id: 14,
    teamName: 'Santos',
  },
  {
    id: 15,
    teamName: 'São José-SP',
  },
  {
    id: 16,
    teamName: 'São Paulo',
  },
];

const teamsEmpty: ITeam[] = [];

describe('Check /teams routes', () => {
  describe('GET', () => {
    afterEach(() => sinon.restore());

    it('should list all registered teams', async () => {
      sinon
        .stub(TeamRepository, 'findAll')
        .resolves(teamsMock as TeamRepository[]);

      const response = await chai.request(app).get('/teams');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(teamsMock);
    });

    it('should an empty array if there is no registered tems', async () => {
      sinon
        .stub(TeamRepository, 'findAll')
        .resolves(teamsEmpty as TeamRepository[]);

      const response = await chai.request(app).get('/teams');

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(teamsEmpty);
    });
  });

  describe('GET /:id', () => {
    afterEach(() => sinon.restore());

    it('should return the team corresponding to the id in the req.params', async () => {
      sinon
        .stub(TeamRepository, 'findByPk')
        .resolves(teamMock as TeamRepository);

      const response = await chai
        .request(app)
        .get(`/teams/${teamMock.id}`);

      expect(response.status).to.be.eq(StatusCodes.OK);
      expect(response.body).to.be.deep.eq(teamMock);
    });

    it('should throw not found error if there is no team with the corresponding id in the req.params', async () => {
      sinon
        .stub(TeamRepository, 'findByPk')
        .resolves(null);

      const response = await chai
        .request(app)
        .get('/teams/99999');

      expect(response.status).to.be.eq(StatusCodes.NOT_FOUND);
      expect(response.body.message).to.be.eq('Team not found');
    });
  });
});
