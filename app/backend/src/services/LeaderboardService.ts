import Team, { ITeam } from '../database/models/Team';
import ILeaderBoard, { ITeamScore } from './utils/types/LeaderboardTypes';
import { IMatchService } from './utils/types/ServiceTypes';

const sortCompareFunction = (prev: ITeamScore, curr: ITeamScore) => {
  let comparison = curr.totalPoints - prev.totalPoints;
  if (!comparison) comparison = curr.totalVictories - prev.totalVictories;
  if (!comparison) comparison = curr.goalsBalance - prev.goalsBalance;
  if (!comparison) comparison = curr.goalsFavor - prev.goalsFavor;
  if (!comparison) comparison = curr.goalsOwn - prev.goalsOwn;
  return comparison;
};

class LeaderboardService {
  private _teamModel = Team;

  constructor(private _matchService: IMatchService) {}

  private async getTeamMatchesDataGeneral(teamId: number): Promise<number[]> {
    const [
      homeDraws, homeLosses, homeVictories, homeMatches,
    ] = await this.getTeamMatchesDataHome(teamId);

    const [
      awayDraws, awayLosses, awayVictories, awayMatches,
    ] = await this.getTeamMatchesDataAway(teamId);

    return [
      homeDraws + awayDraws,
      homeLosses + awayLosses,
      homeVictories + awayVictories,
      homeMatches + awayMatches,
    ];
  }

  private async getTeamMatchesDataHome(teamId: number): Promise<number[]> {
    const matches = await this._matchService.listByProgress('false');
    const teamMatches = matches.filter(({ homeTeam }) => homeTeam === teamId);

    const totalDraws = [...teamMatches.filter((m) => m.homeTeamGoals === m.awayTeamGoals)].length;
    const totalLosses = [...teamMatches.filter((m) => m.homeTeamGoals < m.awayTeamGoals)].length;
    const totalVictories = [...teamMatches.filter((m) => m.homeTeamGoals > m.awayTeamGoals)].length;

    return [
      totalDraws, totalLosses, totalVictories, teamMatches.length,
    ];
  }

  private async getTeamMatchesDataAway(teamId: number): Promise<number[]> {
    const matches = await this._matchService.listByProgress('false');
    const teamMatches = matches.filter(({ awayTeam }) => awayTeam === teamId);

    const totalDraws = [...teamMatches.filter((m) => m.homeTeamGoals === m.awayTeamGoals)].length;
    const totalLosses = [...teamMatches.filter((m) => m.homeTeamGoals > m.awayTeamGoals)].length;
    const totalVictories = [...teamMatches.filter((m) => m.homeTeamGoals < m.awayTeamGoals)].length;

    return [
      totalDraws, totalLosses, totalVictories, teamMatches.length,
    ];
  }

  private async getTeamGoalsGeneral(teamId: number): Promise<number[]> {
    const [goalsFavorHome, goalsOwnHome] = await this.getTeamGoalsHome(teamId);
    const [goalsFavorAway, goalsOwnAway] = await this.getTeamGoalsAway(teamId);

    return [
      goalsFavorHome + goalsFavorAway,
      goalsOwnHome + goalsOwnAway,
    ];
  }

  private async getTeamGoalsHome(teamId: number): Promise<number[]> {
    const matches = await this._matchService.listByProgress('false');

    const goalsFavor = matches.reduce((acc, currMatch) => {
      if (currMatch.homeTeam === teamId) return acc + currMatch.homeTeamGoals;
      return acc;
    }, 0);

    const goalsOwn = matches.reduce((acc, currMatch) => {
      if (currMatch.homeTeam === teamId) return acc + currMatch.awayTeamGoals;
      return acc;
    }, 0);

    return [goalsFavor, goalsOwn];
  }

  private async getTeamGoalsAway(teamId: number): Promise<number[]> {
    const matches = await this._matchService.listByProgress('false');

    const goalsFavor = matches.reduce((acc, currMatch) => {
      if (currMatch.awayTeam === teamId) return acc + currMatch.awayTeamGoals;
      return acc;
    }, 0);

    const goalsOwn = matches.reduce((acc, currMatch) => {
      if (currMatch.awayTeam === teamId) return acc + currMatch.homeTeamGoals;
      return acc;
    }, 0);

    return [goalsFavor, goalsOwn];
  }

  private async generateTeamScoresGeneral(team: ITeam): Promise<ITeamScore> {
    const [
      totalDraws, totalLosses, totalVictories, totalGames,
    ] = await this.getTeamMatchesDataGeneral(team.id);
    const totalPoints = totalVictories * 3 + totalDraws * 1;
    const [goalsFavor, goalsOwn] = await this.getTeamGoalsGeneral(team.id);

    const teamScore: ITeamScore = {
      name: team.teamName,
      totalPoints,
      totalGames,
      totalVictories,
      totalDraws,
      totalLosses,
      goalsFavor,
      goalsOwn,
      goalsBalance: goalsFavor - goalsOwn,
      efficiency: ((totalPoints / (totalGames * 3)) * 100).toFixed(2),
    };

    return teamScore;
  }

  private async generateTeamScoresHome(team: ITeam): Promise<ITeamScore> {
    const [
      totalDraws, totalLosses, totalVictories, totalGames,
    ] = await this.getTeamMatchesDataHome(team.id);
    const totalPoints = totalVictories * 3 + totalDraws * 1;
    const [goalsFavor, goalsOwn] = await this.getTeamGoalsHome(team.id);

    const teamScore: ITeamScore = {
      name: team.teamName,
      totalPoints,
      totalGames,
      totalVictories,
      totalDraws,
      totalLosses,
      goalsFavor,
      goalsOwn,
      goalsBalance: goalsFavor - goalsOwn,
      efficiency: ((totalPoints / (totalGames * 3)) * 100).toFixed(2),
    };

    return teamScore;
  }

  private async generateTeamScoresAway(team: ITeam): Promise<ITeamScore> {
    const [
      totalDraws, totalLosses, totalVictories, totalGames,
    ] = await this.getTeamMatchesDataAway(team.id);
    const totalPoints = totalVictories * 3 + totalDraws * 1;
    const [goalsFavor, goalsOwn] = await this.getTeamGoalsAway(team.id);

    const teamScore: ITeamScore = {
      name: team.teamName,
      totalPoints,
      totalGames,
      totalVictories,
      totalDraws,
      totalLosses,
      goalsFavor,
      goalsOwn,
      goalsBalance: goalsFavor - goalsOwn,
      efficiency: ((totalPoints / (totalGames * 3)) * 100).toFixed(2),
    };

    return teamScore;
  }

  public async getLeaderBoard(filter: string) {
    const teams = await this._teamModel.findAll();
    const results: Promise<ITeamScore>[] = [];

    for (let i = 0; i < teams.length; i += 1) {
      if (filter === 'general') {
        const teamScore: Promise<ITeamScore> = this.generateTeamScoresGeneral(teams[i]);
        results.push(teamScore);
      }
      if (filter === 'home') {
        const teamScore: Promise<ITeamScore> = this.generateTeamScoresHome(teams[i]);
        results.push(teamScore);
      }
      if (filter === 'away') {
        const teamScore: Promise<ITeamScore> = this.generateTeamScoresAway(teams[i]);
        results.push(teamScore);
      }
    }

    const board: ILeaderBoard = await Promise.all(results);

    return board.sort(sortCompareFunction);
  }
}

export default LeaderboardService;
