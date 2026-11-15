export type PlayerRole = 'WK' | 'BAT' | 'AR' | 'BOWL';
export type ActualSquadStatus = 'Active' | 'Injured' | 'Withdrawn' | 'Replacement' | 'Available Pool';
export type SquadVisibility = 'private' | 'public';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  role: UserRole;
  favoriteTeamId?: string;
  defaultSeasonId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  impactPlayerEnabled: boolean;
  isActive: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortCode: string;
  primaryColor: string;
  secondaryColor: string;
  city: string;
  titles: number;
  isActive: boolean;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface SeasonTeam {
  id: string;
  seasonId: string;
  teamId: string;
  historicalSquadSize?: number;
}

export interface SeasonRule {
  seasonId: string;
  minSquadSize: number;
  maxSquadSize: number;
  maxOverseas: number;
  playingXiSize: number;
  maxOverseasInXi: number;
  minIndianPlayers: number;
  impactPlayerEnabled: boolean;
  maxSubstitutes: number;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  dob: string | null;
  nationality: string;
  countryFlag: string;
  imageUrl?: string;
  biography: string;
  primaryRole: PlayerRole;
  secondaryRole?: string;
  battingStyle: string;
  bowlingStyle: string;
  isCapped: boolean;
  isWicketkeeper: boolean;
  isOverseas: boolean;
  jerseyNumber?: number;
}

export interface PlayerSeasonEligibility {
  id: string;
  playerId: string;
  seasonId: string;
  actualTeamId?: string | null;
  isAvailable: boolean;
  actualSquadStatus: ActualSquadStatus;
  isOverseasSnapshot: boolean;
}

export interface PlayerStatistics {
  id: string;
  playerId: string;
  seasonId: string; // 'career' or specific seasonId
  scope: 'career' | 'season';
  matches: number;
  inningsBat: number;
  runs: number;
  highestScore: string;
  battingAverage: number;
  strikeRate: number;
  centuries: number;
  halfCenturies: number;
  fours: number;
  sixes: number;
  inningsBowl: number;
  overs: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  bowlingAverage: number;
  bowlingStrikeRate: number;
  bestBowling: string;
  fiveWicketHauls: number;
  catches: number;
  runOuts: number;
  stumpings: number;
}

export interface PlayerRatings {
  playerId: string;
  batting: number;
  powerHitting: number;
  technique: number;
  finishing: number;
  paceBowling: number;
  spinBowling: number;
  wicketkeeping: number;
  fielding: number;
  overall: number;
}

export interface PlayerWithDetails extends Player {
  ratings: PlayerRatings;
  careerStats: PlayerStatistics;
  seasonStats?: PlayerStatistics;
  eligibility?: PlayerSeasonEligibility;
  actualTeam?: Team;
  previousTeams: string[];
}

export interface ImpactPlayerConfig {
  nomineeId: string | null;
  replacesPlayerId: string | null;
}

export interface TeamRatingBreakdown {
  battingStrength: number;
  bowlingStrength: number;
  paceStrength: number;
  spinStrength: number;
  allRounderStrength: number;
  wicketkeepingStrength: number;
  squadDepth: number;
  overallRating: number;
}

export interface CustomSquad {
  id: string;
  ownerId: string;
  seasonId: string;
  teamId: string;
  name: string;
  playerIds: string[];
  playingXiIds: string[]; // ordered 1..11
  substituteIds: string[];
  captainId: string | null;
  viceCaptainId: string | null;
  wicketkeeperId: string | null;
  impactPlayer: ImpactPlayerConfig;
  ratings: TeamRatingBreakdown;
  visibility: SquadVisibility;
  shareSlug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  affectedPlayerId?: string;
  affectedPlayerName?: string;
  suggestedResolution: string;
}

export interface SquadValidationResult {
  status: 'Incomplete' | 'Valid' | 'Invalid' | 'Ready for Playing XI';
  isValidSquad: boolean;
  isValidXi: boolean;
  hardErrors: ValidationIssue[];
  warnings: ValidationIssue[];
  counts: {
    total: number;
    indian: number;
    overseas: number;
    wk: number;
    bat: number;
    ar: number;
    bowl: number;
    xiTotal: number;
    xiOverseas: number;
  };
}

export interface SquadShareSnapshot {
  shareSlug: string;
  squadId: string;
  ownerId: string;
  squadName: string;
  seasonId: string;
  seasonYear: number;
  seasonName: string;
  teamId: string;
  teamName: string;
  teamShortCode: string;
  teamPrimaryColor: string;
  teamSecondaryColor: string;
  playerIds: string[];
  playingXiIds: string[];
  substituteIds: string[];
  captainId: string | null;
  viceCaptainId: string | null;
  wicketkeeperId: string | null;
  impactPlayer: ImpactPlayerConfig;
  ratings: TeamRatingBreakdown;
  players: PlayerWithDetails[];
  updatedAt: string;
}

export interface SquadComparison {
  id: string;
  ownerId: string;
  name: string;
  seasonId: string;
  squadIds: string[];
  combinedXiIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportLog {
  id: string;
  type: 'players' | 'eligibility' | 'statistics';
  fileName: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  importedBy: string;
  createdAt: string;
}
