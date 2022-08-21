import * as Sequelize from 'sequelize';
import db from '.';
import Team from './Team';

interface IMatch {
  id: number;
  homeTeam: number,
  homeTeamGoals: number,
  awayTeam: number,
  awayTeamGoals: number,
  inProgress: number,
}

type IMatchCreation = Omit<IMatch, 'id'>;

class Match extends Sequelize.Model<IMatch, IMatchCreation> {
  declare id: number;
  declare homeTeam: number;
  declare homeTeamGoals: number;
  declare awayTeam: number;
  declare awayTeamGoals: number;
  declare inProgress: number;
}

Match.init({
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
}, {
  sequelize: db,
  tableName: 'matches',
  timestamps: false,
  underscored: true,
});

Match.belongsTo(Team, { foreignKey: 'homeTeam' });
Match.belongsTo(Team, { foreignKey: 'awayTeam' });
Team.hasMany(Match, { foreignKey: 'id', as: 'matches' });

export default Match;
export { IMatch, IMatchCreation };
