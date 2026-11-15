import { isSupabaseConfigured, supabase } from './supabase/client';
import type {
  CustomSquad,
  ImportLog,
  Player,
  PlayerRatings,
  PlayerSeasonEligibility,
  PlayerStatistics,
  PlayerWithDetails,
  Season,
  SeasonRule,
  SeasonTeam,
  SquadComparison,
  SquadShareSnapshot,
  Team,
  UserProfile,
} from '../types/ipl';

export interface CatalogBundle {
  seasons: Season[];
  teams: Team[];
  seasonTeams: SeasonTeam[];
  seasonRules: SeasonRule[];
  players: Player[];
  playerSeasons: PlayerSeasonEligibility[];
  playerStats: PlayerStatistics[];
  playerRatings: PlayerRatings[];
  loadError?: string;
}

function emptyCatalog(loadError?: string): CatalogBundle {
  return {
    seasons: [],
    teams: [],
    seasonTeams: [],
    seasonRules: [],
    players: [],
    playerSeasons: [],
    playerStats: [],
    playerRatings: [],
    loadError,
  };
}

function getSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function toDatabaseRow(value: object): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      item,
    ])
  );
}

function fromDatabaseRow<T>(value: Record<string, unknown>): T {
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase()),
      item,
    ])
  ) as T;
}

async function selectRows<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabase().from(table).select('*');
  if (error) throw error;
  return (data ?? []).map((row) => fromDatabaseRow<T>(row as Record<string, unknown>));
}

async function upsertRows(table: string, values: object[], onConflict = 'id'): Promise<void> {
  if (values.length === 0) return;
  const { error } = await getSupabase()
    .from(table)
    .upsert(values.map(toDatabaseRow), { onConflict });
  if (error) throw error;
}

export async function fetchCatalogBundle(): Promise<CatalogBundle> {
  if (!isSupabaseConfigured || !supabase) {
    return emptyCatalog('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  try {
    const [
      seasons,
      teams,
      seasonTeams,
      seasonRules,
      players,
      playerSeasons,
      playerStats,
      playerRatings,
    ] = await Promise.all([
      selectRows<Season>('seasons'),
      selectRows<Team>('teams'),
      selectRows<SeasonTeam>('season_teams'),
      selectRows<SeasonRule>('season_rules'),
      selectRows<Player>('players'),
      selectRows<PlayerSeasonEligibility>('player_seasons'),
      selectRows<PlayerStatistics>('player_statistics'),
      selectRows<PlayerRatings>('player_ratings'),
    ]);

    return {
      seasons: seasons.sort((a, b) => b.year - a.year),
      teams,
      seasonTeams,
      seasonRules,
      players,
      playerSeasons,
      playerStats,
      playerRatings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Supabase catalog read failed:', error);
    return emptyCatalog(`Could not load catalog data from Supabase: ${message}`);
  }
}

export function buildPlayersForSeason(
  catalog: CatalogBundle,
  seasonId: string
): PlayerWithDetails[] {
  const teamsMap = new Map(catalog.teams.map((team) => [team.id, team]));
  const ratingsMap = new Map(catalog.playerRatings.map((rating) => [rating.playerId, rating]));
  const careerStatsMap = new Map(
    catalog.playerStats.filter((stats) => stats.scope === 'career').map((stats) => [stats.playerId, stats])
  );
  const seasonStatsMap = new Map(
    catalog.playerStats
      .filter((stats) => stats.scope === 'season' && stats.seasonId === seasonId)
      .map((stats) => [stats.playerId, stats])
  );
  const eligibilityByPlayer = new Map(
    catalog.playerSeasons
      .filter((entry) => entry.seasonId === seasonId)
      .map((entry) => [entry.playerId, entry])
  );
  const allTeamsByPlayer = new Map<string, string[]>();
  for (const entry of catalog.playerSeasons) {
    if (!entry.actualTeamId) continue;
    const team = teamsMap.get(entry.actualTeamId);
    if (!team) continue;
    const teamCodes = allTeamsByPlayer.get(entry.playerId) ?? [];
    if (!teamCodes.includes(team.shortCode)) teamCodes.push(team.shortCode);
    allTeamsByPlayer.set(entry.playerId, teamCodes);
  }

  return catalog.players.map((player) => {
    const defaultRatings: PlayerRatings = {
      playerId: player.id,
      batting: 0,
      powerHitting: 0,
      technique: 0,
      finishing: 0,
      paceBowling: 0,
      spinBowling: 0,
      wicketkeeping: 0,
      fielding: 0,
      overall: 0,
    };
    const defaultStats: PlayerStatistics = {
      id: `${player.id}_career`,
      playerId: player.id,
      seasonId: 'career',
      scope: 'career',
      matches: 0,
      inningsBat: 0,
      runs: 0,
      highestScore: '0',
      battingAverage: 0,
      strikeRate: 0,
      centuries: 0,
      halfCenturies: 0,
      fours: 0,
      sixes: 0,
      inningsBowl: 0,
      overs: 0,
      runsConceded: 0,
      wickets: 0,
      economy: 0,
      bowlingAverage: 0,
      bowlingStrikeRate: 0,
      bestBowling: '0/0',
      fiveWicketHauls: 0,
      catches: 0,
      runOuts: 0,
      stumpings: 0,
    };
    const eligibility = eligibilityByPlayer.get(player.id);
    return {
      ...player,
      ratings: ratingsMap.get(player.id) ?? defaultRatings,
      careerStats: careerStatsMap.get(player.id) ?? defaultStats,
      seasonStats: seasonStatsMap.get(player.id),
      eligibility,
      actualTeam: eligibility?.actualTeamId ? teamsMap.get(eligibility.actualTeamId) : undefined,
      previousTeams: allTeamsByPlayer.get(player.id) ?? [],
    };
  });
}

export async function fetchUserSquads(uid: string): Promise<CustomSquad[]> {
  const { data, error } = await getSupabase()
    .from('custom_squads')
    .select('*')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromDatabaseRow<CustomSquad>(row as Record<string, unknown>));
}

export async function fetchPublicSquads(): Promise<CustomSquad[]> {
  const { data, error } = await getSupabase()
    .from('custom_squads')
    .select('*')
    .eq('visibility', 'public')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromDatabaseRow<CustomSquad>(row as Record<string, unknown>));
}

export async function fetchAllSquadsAdmin(): Promise<CustomSquad[]> {
  const { data, error } = await getSupabase()
    .from('custom_squads')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromDatabaseRow<CustomSquad>(row as Record<string, unknown>));
}

export async function fetchSquadById(squadId: string): Promise<CustomSquad | null> {
  const { data, error } = await getSupabase()
    .from('custom_squads')
    .select('*')
    .eq('id', squadId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromDatabaseRow<CustomSquad>(data as Record<string, unknown>) : null;
}

export async function saveSquad(squad: CustomSquad): Promise<CustomSquad> {
  const updated = { ...squad, updatedAt: new Date().toISOString() };
  await upsertRows('custom_squads', [updated]);
  return updated;
}

export async function deleteSquad(squadId: string, shareSlug?: string): Promise<void> {
  const client = getSupabase();
  if (shareSlug) {
    const { error: shareError } = await client.from('squad_shares').delete().eq('share_slug', shareSlug);
    if (shareError) throw shareError;
  }
  const { error } = await client.from('custom_squads').delete().eq('id', squadId);
  if (error) throw error;
}

export async function publishSquadShare(snapshot: SquadShareSnapshot): Promise<void> {
  const { error } = await getSupabase().from('squad_shares').upsert(
    { share_slug: snapshot.shareSlug, squad_id: snapshot.squadId, snapshot, is_active: true },
    { onConflict: 'share_slug' }
  );
  if (error) throw error;
}

export async function fetchSharedSquad(shareSlug: string): Promise<SquadShareSnapshot | null> {
  const { data, error } = await getSupabase()
    .from('squad_shares')
    .select('snapshot')
    .eq('share_slug', shareSlug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return (data?.snapshot as SquadShareSnapshot | undefined) ?? null;
}

export async function fetchUserComparisons(uid: string): Promise<SquadComparison[]> {
  const { data, error } = await getSupabase()
    .from('squad_comparisons')
    .select('*')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromDatabaseRow<SquadComparison>(row as Record<string, unknown>));
}

export async function saveComparison(comparison: SquadComparison): Promise<void> {
  await upsertRows('squad_comparisons', [comparison]);
}

export async function upsertSeason(
  season: Season,
  rule?: SeasonRule,
  participatingTeamIds?: string[]
): Promise<void> {
  await upsertRows('seasons', [season]);
  if (rule) await upsertRows('season_rules', [rule], 'season_id');
  if (participatingTeamIds) {
    const client = getSupabase();
    const { error: deleteError } = await client
      .from('season_teams')
      .delete()
      .eq('season_id', season.id);
    if (deleteError) throw deleteError;
    await upsertRows(
      'season_teams',
      participatingTeamIds.map((teamId) => ({
        id: `${season.id}_${teamId}`,
        seasonId: season.id,
        teamId,
        historicalSquadSize: 25,
      }))
    );
  }
}

export async function deleteSeason(seasonId: string): Promise<void> {
  const { error } = await getSupabase().from('seasons').delete().eq('id', seasonId);
  if (error) throw error;
}

export async function upsertTeam(team: Team): Promise<void> {
  await upsertRows('teams', [team]);
}

export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await getSupabase().from('teams').delete().eq('id', teamId);
  if (error) throw error;
}

export async function upsertSeasonRule(rule: SeasonRule): Promise<void> {
  await upsertRows('season_rules', [rule], 'season_id');
}

export async function upsertPlayerFull(
  player: Player,
  ratings?: PlayerRatings,
  careerStats?: PlayerStatistics
): Promise<void> {
  await upsertRows('players', [player]);
  if (ratings) await upsertRows('player_ratings', [ratings], 'player_id');
  if (careerStats) await upsertRows('player_statistics', [careerStats]);
}

export async function deletePlayer(playerId: string): Promise<void> {
  const { error } = await getSupabase().from('players').delete().eq('id', playerId);
  if (error) throw error;
}

export async function upsertPlayerEligibility(entry: PlayerSeasonEligibility): Promise<void> {
  await upsertRows('player_seasons', [entry]);
}

export async function deletePlayerEligibility(id: string): Promise<void> {
  const { error } = await getSupabase().from('player_seasons').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertPlayerRatings(ratings: PlayerRatings): Promise<void> {
  await upsertRows('player_ratings', [ratings], 'player_id');
}

export async function upsertPlayerStatistics(stats: PlayerStatistics): Promise<void> {
  await upsertRows('player_statistics', [stats]);
}

export async function fetchAllUsersAdmin(): Promise<UserProfile[]> {
  const rows = await selectRows<Record<string, unknown>>('profiles');
  return rows.map((row) => ({
    uid: String(row.id),
    displayName: String(row.displayName ?? ''),
    email: typeof row.email === 'string' ? row.email : undefined,
    role: row.role === 'admin' ? 'admin' : 'user',
    favoriteTeamId: typeof row.favoriteTeamId === 'string' ? row.favoriteTeamId : undefined,
    defaultSeasonId: typeof row.defaultSeasonId === 'string' ? row.defaultSeasonId : undefined,
    createdAt: String(row.createdAt ?? ''),
    updatedAt: String(row.updatedAt ?? ''),
  }));
}

export async function setUserAdminRole(uid: string, makeAdmin: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('profiles')
    .update({ role: makeAdmin ? 'admin' : 'user', updated_at: new Date().toISOString() })
    .eq('id', uid);
  if (error) throw error;
}

export async function recordImportLog(log: ImportLog): Promise<void> {
  await upsertRows('import_logs', [log]);
}

export async function fetchImportLogs(): Promise<ImportLog[]> {
  const { data, error } = await getSupabase()
    .from('import_logs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => fromDatabaseRow<ImportLog>(row as Record<string, unknown>));
}
