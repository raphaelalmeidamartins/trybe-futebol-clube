import * as Sequelize from 'sequelize';
import db from '.';
import Team from './Team';

interface IMatchUpdate {
  homeTeamGoals: number;
  awayTeamGoals: number;
}

interface IMatch extends IMatchUpdate {
  id: number;
  homeTeam: number;
  awayTeam: number;
  inProgress?: boolean;
}

type IMatchCreation = Omit<IMatch, 'id'>;

interface IMatchReturned {
  id: number;
  homeTeam: number;
  homeTeamGoals: number;
  awayTeam: number;
  awayTeamGoals: number;
  inProgress: boolean;
  teamHome: {
    teamName: string;
  };
  teamAway: {
    teamName: string;
  };
}

class Match extends Sequelize.Model<IMatch, IMatchCreation> {
  declare id: number;
  declare homeTeam: number;
  declare homeTeamGoals: number;
  declare awayTeam: number;
  declare awayTeamGoals: number;
  declare inProgress: boolean;
}

Match.init(
  {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    homeTeam: Sequelize.INTEGER,
    homeTeamGoals: Sequelize.INTEGER,
    awayTeam: Sequelize.INTEGER,
    awayTeamGoals: Sequelize.INTEGER,
    inProgress: Sequelize.BOOLEAN,
  },
  {
    sequelize: db,
    tableName: 'matches',
    timestamps: false,
    underscored: true,
  },
);

Match.belongsTo(Team, { foreignKey: 'homeTeam', as: 'teamHome' });
Match.belongsTo(Team, { foreignKey: 'awayTeam', as: 'teamAway' });
Team.hasMany(Match, { foreignKey: 'id', as: 'matches' });

export default Match;
export { IMatch, IMatchUpdate, IMatchCreation, IMatchReturned };
