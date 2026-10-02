export type MatchModality = 'f5' | 'f7' | 'f11';
export type MatchStatus = 'scheduled' | 'live' | 'played' | 'suspended' | 'postponed' | 'cancelled';
export type TournamentType = 'league' | 'knockout';

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  season?: string;
  description?: string;
  image?: string;
  match_type: MatchModality;
  standings?: TeamStanding[];
  show_standings?: boolean;
  show_brackets?: boolean;
  show_scorers?: boolean;
  show_discipline?: boolean;
  team_ids?: string[];
  is_featured?: boolean;
}

export interface TeamStanding {
  id: string;
  tournament_id: string;
  team_id?: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference?: number;
  points: number;
  fouls: number;
  yellow_cards?: number;
  red_cards?: number;
  points_penalty?: number;
  disqualified: boolean;
  logo?: string;
}

export interface Match {
  id: string;
  title?: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  date: string; // Formato DD/MM/YYYY o similar
  time: string; // Formato HH:MM
  location_id?: string;
  status: MatchStatus;
  current_minute?: string;
  home_score: number;
  away_score: number;
  has_penalties?: boolean;
  stream_url?: string;
  video_id?: string;
  round?: string;
  match_order?: number;
  bracket_code?: string;
  next_match_id?: string;
  home_penalties?: number | null;
  away_penalties?: number | null;
  winner_id?: string;
  description?: string;
  match_type: MatchModality;
  lineups?: string | LineupsData;
  is_featured?: boolean;
}

export interface LineupPlayer {
  id: string;
  name?: string;
  fullName?: string;
  number: number;
  role: string; // 'Goalkeeper', 'Defender', etc.
  isCaptain?: boolean;
  yellowCards: number;
  redCards: number;
  priorYellowCount: number;
  goals?: number;
}

export interface TeamLineup {
  formation: string; // e.g., '4-3-3'
  formationName?: string;
  coach?: string;
  starting: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface LineupsData {
  home: TeamLineup;
  away: TeamLineup;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  type: 'live' | 'recording' | 'Transmisión Completa' | 'Resumen' | 'Mejores Jugadas' | string;
  date: string;
  views: number;
  album_id?: string;
  match_id?: string;
}

export interface Album {
  id: string;
  title: string;
  thumbnail?: string;
  date: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  map_url?: string;
}

export interface PlayerStats {
  games_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  stats?: PlayerStats;
}

export interface GlobalTeam {
  id: string;
  name: string;
  shortName?: string;
  acronym?: string;
  logo?: string;
  roster_image?: string;
  description?: string;
  is_global: boolean;
  players?: Player[];
}

export type Team = GlobalTeam;
