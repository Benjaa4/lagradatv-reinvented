import { GlobalTeam, Match } from '../types';

export const getTeamDisplayName = (teamId: string | undefined, teams: GlobalTeam[]): string => {
  if (!teamId || teamId.toLowerCase() === 'tbd') return 'Por definir';
  const team = teams.find(t => t.id === teamId || t.name === teamId);
  if (team) return team.name;
  if (teamId.length > 20 && teamId.includes('-')) return 'Por definir';
  return teamId;
};

export const getMatchDisplayName = (match: Partial<Match>, teams: GlobalTeam[]): string => {
  const t = match.title || match.description;
  if (t && !t.match(/^[0-9a-f]{8}-[0-9a-f]{4}/i)) return t;
  return `${getTeamDisplayName(match.home_team_id, teams)} vs ${getTeamDisplayName(match.away_team_id, teams)}`;
};
