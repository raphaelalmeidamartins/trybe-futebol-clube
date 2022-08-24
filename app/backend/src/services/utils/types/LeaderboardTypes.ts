interface ITeamScore {
  name: string;
  totalPoints: number;
  totalGames: number,
  totalVictories: number;
  totalDraws: number;
  totalLosses: number;
  goalsFavor: number;
  goalsOwn: number;
  goalsBalance: number;
  efficiency: string;
}

type ILeaderboard = ITeamScore[];

export default ILeaderboard;
export { ITeamScore };
