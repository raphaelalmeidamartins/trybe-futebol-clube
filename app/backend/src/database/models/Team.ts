import * as Sequelize from 'sequelize';
import db from '.';

interface ITeam {
  id: number;
  teamName: string;
}

type ITeamCreation = Omit<ITeam, 'id'>;

class TeamRepository extends Sequelize.Model<ITeam, ITeamCreation> {
  declare id: number;
  declare teamName: string;
}

TeamRepository.init({
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  teamName: Sequelize.STRING,
}, {
  sequelize: db,
  tableName: 'teams',
  timestamps: false,
  underscored: true,
});

export default TeamRepository;
export { ITeam, ITeamCreation };
