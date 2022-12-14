import * as Sequelize from 'sequelize';
import db from '.';

interface IUser {
  id: number;
  username: string;
  role: string;
  email: string;
  password: string;
}

type IUserCreation = Omit<IUser, 'id'>;

type IUserReturned = Omit<IUser, 'password'>;

class User extends Sequelize.Model<IUser, IUserCreation> {
  declare id: number;
  declare username: string;
  declare role: string;
  declare email: string;
  declare password: string;
}

User.init({
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  username: Sequelize.STRING,
  role: Sequelize.STRING,
  email: Sequelize.STRING,
  password: Sequelize.STRING,
}, {
  sequelize: db,
  tableName: 'users',
  timestamps: false,
  underscored: true,
});

export default User;
export { IUser, IUserCreation, IUserReturned };
