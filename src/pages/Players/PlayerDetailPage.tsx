import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Divider,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  Link as MuiLink,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { calculateTeamRatings } from '../../services/ratings/ratingEngine';
import { validatePlayerAddition } from '../../services/validation/validationEngine';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useSquadStore } from '../../store/squadStore';
import { EmptyState, LoadingState } from '../../components/common/CommonUi';
import { PlayerProfileHeader } from '../../components/players/PlayerProfileHeader';
import { TeamLogo } from '../../components/common/TeamLogo';
import type {
  PlayerSeasonEligibility,
  PlayerStatistics,
  PlayerWithDetails,
  Season,
  Team,
  ValidationIssue,
} from '../../types/ipl';

type DetailTab = 'overview' | 'batting' | 'bowling' | 'fielding' | 'career' | 'seasons';
type SeasonStatKey =
  | 'matches'
  | 'inningsBat'
  | 'runs'
  | 'highestScore'
  | 'battingAverage'
  | 'strikeRate'
  | 'centuries'
  | 'halfCenturies'
  | 'fours'
  | 'sixes'
  | 'inningsBowl'
  | 'overs'
  | 'runsConceded'
  | 'wickets'
  | 'economy'
  | 'bowlingAverage'
  | 'bowlingStrikeRate'
  | 'bestBowling'
  | 'fiveWicketHauls'
  | 'catches'
  | 'runOuts'
  | 'stumpings';

interface PlayerSeasonRecord {
  seasonId: string;
  season?: Season;
  stats?: PlayerStatistics;
  eligibility?: PlayerSeasonEligibility;
  team?: Team;
}

interface Metric {
  label: string;
  value: string | number;
  caption?: string;
}

interface ChartPoint {
  season: string;
  value: number;
}

const DETAIL_TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'batting', label: 'Batting' },
  { id: 'bowling', label: 'Bowling' },
  { id: 'fielding', label: 'Fielding' },
  { id: 'career', label: 'IPL Career' },
  { id: 'seasons', label: 'Seasons' },
];

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#10141C',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 8,
  color: '#F5F7FA',
};

function formatStat(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? value.toLocaleString('en-US', { maximumFractionDigits: 2 })
      : '—';
  }
  return value;
}

function hasBattingData(stats?: PlayerStatistics): boolean {
  if (!stats) return false;
  return [
    stats.inningsBat,
    stats.runs,
    stats.battingAverage,
    stats.strikeRate,
    stats.centuries,
    stats.halfCenturies,
    stats.fours,
    stats.sixes,
  ].some((value) => Number.isFinite(value) && value > 0);
}

function hasBowlingData(stats?: PlayerStatistics): boolean {
  if (!stats) return false;
  return [
    stats.inningsBowl,
    stats.overs,
    stats.runsConceded,
    stats.wickets,
    stats.economy,
    stats.bowlingAverage,
    stats.bowlingStrikeRate,
    stats.fiveWicketHauls,
  ].some((value) => Number.isFinite(value) && value > 0);
}

function hasFieldingData(stats?: PlayerStatistics): boolean {
  if (!stats) return false;
  return [stats.catches, stats.runOuts, stats.stumpings]
    .some((value) => Number.isFinite(value) && value > 0);
}

function PlayerStatCard({
  label,
  value,
  caption,
  accentColor,
}: Metric & { accentColor: string }) {
  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: 'rgba(255,255,255,0.025)',
        borderLeft: `2px solid ${accentColor}99`,
        borderRadius: '12px',
      }}
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="h5" className="tabular-nums" sx={{ mt: 0.4, fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {formatStat(value)}
        </Typography>
        {caption && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {caption}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function RatingRow({ label, value, accentColor }: { label: string; value: number | null; accentColor: string }) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" className="tabular-nums" sx={{ fontWeight: 600 }}>
          {value === null ? '—' : `${formatStat(value)}/100`}
        </Typography>
      </Stack>
      {value !== null && (
        <LinearProgress
          variant="determinate"
          value={Math.max(0, Math.min(100, value))}
          sx={{
            height: 6,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.08)',
            '& .MuiLinearProgress-bar': { bgcolor: accentColor, borderRadius: 4 },
          }}
        />
      )}
    </Box>
  );
}

function PerformanceChart({
  title,
  data,
  color,
  kind,
}: {
  title: string;
  data: ChartPoint[];
  color: string;
  kind: 'bar' | 'line';
}) {
  return (
    <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.02)' }}>
      <CardContent sx={{ p: 1.75 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.25, fontWeight: 600 }}>{title}</Typography>
        {data.length === 0 ? (
          <Box sx={{ height: 170, display: 'grid', placeItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">No season records available</Typography>
          </Box>
        ) : (
          <Box sx={{ height: 190, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              {kind === 'bar' ? (
                <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="season" tick={{ fill: '#A0A9B7', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#687386', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              ) : (
                <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="season" tick={{ fill: '#A0A9B7', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#687386', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <ChartTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function SeasonStatsTable({
  title,
  rows,
  fields,
}: {
  title: string;
  rows: PlayerSeasonRecord[];
  fields: Array<{ label: string; key: SeasonStatKey }>;
}) {
  return (
    <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
            No season-wise statistics are recorded.
          </Typography>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Season</TableCell>
                  <TableCell>Franchise</TableCell>
                  {fields.map((field) => (
                    <TableCell key={field.key} align="right">{field.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.seasonId} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {row.season?.name || row.seasonId}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.team ? `${row.team.shortCode} · ${row.team.name}` : '—'}
                    </TableCell>
                    {fields.map((field) => (
                      <TableCell key={field.key} align="right" className="tabular-nums">
                        {formatStat(row.stats?.[field.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function PlayerDetailPage() {
  const { playerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromBuilder = searchParams.get('from') === 'builder';
  const builderSquadId = searchParams.get('squadId');
  const querySeasonId = searchParams.get('season') || undefined;
  const user = useAuthStore((state) => state.user);
  const { selectedSeasonId, setSelectedSeasonId, showSnackbar } = useAppStore();
  const { draft, addPlayer, removePlayer } = useSquadStore();
  const effectiveSeasonId = querySeasonId || selectedSeasonId;
  const { catalog, activeSeason, activeRule, seasonPlayers, isLoading } = useCatalog(effectiveSeasonId);

  const [tab, setTab] = useState<DetailTab>('overview');
  const [selectedStatsSeasonId, setSelectedStatsSeasonId] = useState('');
  const [validationError, setValidationError] = useState<ValidationIssue | null>(null);

  const player = useMemo(
    () => seasonPlayers.find((item) => item.id === playerId) || null,
    [seasonPlayers, playerId]
  );
  const teamsMap = useMemo(
    () => new Map((catalog?.teams || []).map((team) => [team.id, team])),
    [catalog]
  );
  const seasonsMap = useMemo(
    () => new Map((catalog?.seasons || []).map((season) => [season.id, season])),
    [catalog]
  );
  const playersMap = useMemo(
    () => new Map(seasonPlayers.map((item) => [item.id, item])),
    [seasonPlayers]
  );
  const eligibilityMap = useMemo(() => {
    const map = new Map();
    for (const item of seasonPlayers) {
      if (item.eligibility) map.set(item.id, item.eligibility);
    }
    return map;
  }, [seasonPlayers]);

  const seasonRecords = useMemo((): PlayerSeasonRecord[] => {
    if (!catalog || !player) return [];
    const recordsBySeason = new Map<string, PlayerSeasonRecord>();

    for (const stats of catalog.playerStats) {
      if (stats.playerId !== player.id || stats.scope !== 'season') continue;
      recordsBySeason.set(stats.seasonId, {
        ...recordsBySeason.get(stats.seasonId),
        seasonId: stats.seasonId,
        stats,
      });
    }
    for (const eligibility of catalog.playerSeasons) {
      if (eligibility.playerId !== player.id) continue;
      recordsBySeason.set(eligibility.seasonId, {
        ...recordsBySeason.get(eligibility.seasonId),
        seasonId: eligibility.seasonId,
        eligibility,
      });
    }

    return [...recordsBySeason.values()]
      .map((record) => ({
        ...record,
        season: seasonsMap.get(record.seasonId),
        team: record.eligibility?.actualTeamId
          ? teamsMap.get(record.eligibility.actualTeamId)
          : undefined,
      }))
      .sort((a, b) => (a.season?.year ?? 0) - (b.season?.year ?? 0));
  }, [catalog, player, seasonsMap, teamsMap]);

  const careerStats = catalog?.playerStats.find(
    (stats) => stats.playerId === player?.id && stats.scope === 'career'
  );
  const hasRatings = Boolean(catalog?.playerRatings.some((rating) => rating.playerId === player?.id));
  const hasCareerBatting = hasBattingData(careerStats);
  const hasCareerBowling = hasBowlingData(careerStats);
  const battingRows = seasonRecords.filter((record) => hasBattingData(record.stats));
  const bowlingRows = seasonRecords.filter((record) => hasBowlingData(record.stats));
  const fieldingRows = seasonRecords.filter((record) => hasFieldingData(record.stats));
  const hasAnyBatting = hasCareerBatting || battingRows.length > 0;
  const hasAnyBowling = hasCareerBowling || bowlingRows.length > 0;
  const hasAnyFielding = hasFieldingData(careerStats) || fieldingRows.length > 0;
  const seasonsPlayed = seasonRecords.filter((record) => (record.stats?.matches ?? 0) > 0).length;

  const franchiseHistory = useMemo(() => {
    const byTeam = new Map<string, { team: Team; seasons: string[] }>();
    for (const record of seasonRecords) {
      if (!record.team) continue;
      const entry = byTeam.get(record.team.id) ?? { team: record.team, seasons: [] };
      entry.seasons.push(record.season?.name || record.seasonId);
      byTeam.set(record.team.id, entry);
    }
    return [...byTeam.values()];
  }, [seasonRecords]);

  const selectedStatsSeason =
    seasonRecords.find((record) => record.seasonId === selectedStatsSeasonId) ||
    seasonRecords[seasonRecords.length - 1];
  const playedSeasonRecords = seasonRecords.filter((record) => (record.stats?.matches ?? 0) > 0);
  const debutRecord = playedSeasonRecords[0];
  const bestRunSeason = battingRows.reduce<PlayerSeasonRecord | undefined>(
    (best, record) => (record.stats!.runs > (best?.stats?.runs ?? -1) ? record : best),
    undefined
  );
  const bestWicketSeason = bowlingRows.reduce<PlayerSeasonRecord | undefined>(
    (best, record) => (record.stats!.wickets > (best?.stats?.wickets ?? -1) ? record : best),
    undefined
  );

  if (isLoading) return <LoadingState count={4} />;

  if (catalog?.loadError) {
    return <Alert severity="error">{catalog.loadError}</Alert>;
  }

  if (!player || !catalog || !activeSeason) {
    return (
      <EmptyState
        title="Player not found"
        description="This player profile could not be located in the IPL catalog."
        action={
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/players')}>
            Back to Player Database
          </Button>
        }
      />
    );
  }

  const accentColor = player.actualTeam?.primaryColor || '#3B82F6';
  const isAvailable = player.eligibility?.isAvailable !== false;
  const isOverseas = player.eligibility?.isOverseasSnapshot ?? player.isOverseas;
  const hasActiveDraft = Boolean(user && draft.ownerId === user.uid && draft.seasonId === activeSeason.id);
  const isInDraft = hasActiveDraft && draft.playerIds.includes(player.id);

  const handleBack = () => {
    if (fromBuilder) {
      navigate(builderSquadId ? `/builder/${builderSquadId}` : '/builder');
    } else {
      navigate('/players');
    }
  };

  const handleAddToDraft = () => {
    if (!activeRule) return;
    setValidationError(null);
    const check = validatePlayerAddition(player, draft.playerIds, playersMap, eligibilityMap, activeRule);
    if (!check.valid && check.issue) {
      setValidationError(check.issue);
      return;
    }
    const currentPlayers = draft.playerIds
      .map((id) => playersMap.get(id))
      .filter((item): item is PlayerWithDetails => Boolean(item));
    const nextRatings = calculateTeamRatings([...currentPlayers, player]);
    addPlayer(player.id, nextRatings);
    showSnackbar(`${player.shortName} added to ${draft.name}`, 'success');
  };

  const handleRemoveFromDraft = () => {
    setValidationError(null);
    const currentPlayers = draft.playerIds
      .map((id) => playersMap.get(id))
      .filter((item): item is PlayerWithDetails => item !== undefined && item.id !== player.id);
    const nextRatings = calculateTeamRatings(currentPlayers);
    removePlayer(player.id, nextRatings);
    showSnackbar(`${player.shortName} removed from ${draft.name}`, 'info');
  };

  const addToSquadAction = hasActiveDraft ? (
    isInDraft ? (
      <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveFromDraft}>
        Remove from squad
      </Button>
    ) : (
      <Button
        variant="contained"
        disabled={!isAvailable || !activeRule}
        startIcon={<AddIcon />}
        onClick={handleAddToDraft}
        sx={{ bgcolor: accentColor, color: '#FFF', '&:hover': { bgcolor: accentColor, filter: 'brightness(0.92)' } }}
      >
        Add to squad
      </Button>
    )
  ) : (
    <Button
      variant="contained"
      startIcon={<BuildIcon />}
      onClick={() => navigate(`/builder?season=${activeSeason.id}`)}
      sx={{ bgcolor: accentColor, color: '#FFF', '&:hover': { bgcolor: accentColor, filter: 'brightness(0.92)' } }}
    >
      Open squad builder
    </Button>
  );

  const careerMetrics: Metric[] = [
    { label: 'IPL matches', value: careerStats ? careerStats.matches : '—' },
    { label: 'Seasons played', value: seasonsPlayed },
    { label: 'Teams represented', value: franchiseHistory.length },
  ];

  if (player.primaryRole !== 'BOWL' || hasAnyBatting) {
    careerMetrics.push(
      { label: 'Career runs', value: hasCareerBatting ? formatStat(careerStats?.runs) : '—' },
      { label: 'Batting average', value: hasCareerBatting ? formatStat(careerStats?.battingAverage) : '—' },
      { label: 'Strike rate', value: hasCareerBatting ? formatStat(careerStats?.strikeRate) : '—' },
      { label: 'Highest score', value: hasCareerBatting ? formatStat(careerStats?.highestScore) : '—' }
    );
  }
  if (player.primaryRole === 'BOWL' || player.primaryRole === 'AR' || hasAnyBowling) {
    careerMetrics.push(
      { label: 'Career wickets', value: hasCareerBowling ? formatStat(careerStats?.wickets) : '—' },
      { label: 'Bowling average', value: hasCareerBowling ? formatStat(careerStats?.bowlingAverage) : '—' },
      { label: 'Economy rate', value: hasCareerBowling ? formatStat(careerStats?.economy) : '—' },
      { label: 'Best bowling', value: hasCareerBowling ? formatStat(careerStats?.bestBowling) : '—' }
    );
  }
  if (player.isWicketkeeper || player.primaryRole === 'WK') {
    careerMetrics.push(
      { label: 'Catches', value: hasFieldingData(careerStats) ? formatStat(careerStats?.catches) : '—' },
      { label: 'Stumpings', value: hasFieldingData(careerStats) ? formatStat(careerStats?.stumpings) : '—' }
    );
  }

  const battingChartRows = battingRows.map((record) => ({
    season: record.season?.name || record.seasonId,
    stats: record.stats!,
  }));
  const bowlingChartRows = bowlingRows.map((record) => ({
    season: record.season?.name || record.seasonId,
    stats: record.stats!,
  }));

  const tabContent = (
    <>
      {tab === 'overview' && (
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600 }}>IPL summary</Typography>
            <Grid container spacing={1.5}>
              {careerMetrics.map((metric) => (
                <Grid key={metric.label} size={{ xs: 6, sm: 4, lg: 3 }}>
                  <PlayerStatCard {...metric} accentColor={accentColor} />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600 }}>Player ratings</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Squad Builder assessments · not official IPL statistics
                  </Typography>
                  <Stack spacing={1.75}>
                    <RatingRow label="Overall" value={hasRatings ? player.ratings.overall : null} accentColor={accentColor} />
                    <RatingRow label="Batting" value={hasRatings ? player.ratings.batting : null} accentColor={accentColor} />
                    <RatingRow label="Fielding" value={hasRatings ? player.ratings.fielding : null} accentColor={accentColor} />
                    <RatingRow label="Pace bowling" value={hasRatings ? player.ratings.paceBowling : null} accentColor={accentColor} />
                    <RatingRow label="Spin bowling" value={hasRatings ? player.ratings.spinBowling : null} accentColor={accentColor} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={2}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Player profile</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {player.biography?.trim() || 'Biography has not been added to the player record.'}
                    </Typography>
                    <Divider sx={{ my: 1.75 }} />
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Date of birth</Typography>
                        <Typography variant="body2">{player.dob || '—'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Squad status</Typography>
                        <Typography variant="body2">{player.eligibility?.actualSquadStatus || 'Unassigned'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 4 }}>
                        <Typography variant="caption" color="text.secondary">Origin</Typography>
                        <Typography variant="body2">{isOverseas ? 'Overseas' : 'Indian'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                <Alert severity="info">
                  Match-by-match recent performance is not stored in the current player statistics data.
                </Alert>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      )}

      {tab === 'batting' && (
        !hasAnyBatting ? (
          <EmptyState
            title="No batting record available"
            description="There are no career or season batting statistics recorded for this player."
          />
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600 }}>Career batting statistics</Typography>
              {hasCareerBatting && careerStats ? (
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Matches', value: careerStats.matches },
                    { label: 'Innings', value: careerStats.inningsBat },
                    { label: 'Runs', value: careerStats.runs },
                    { label: 'Highest score', value: careerStats.highestScore },
                    { label: 'Batting average', value: careerStats.battingAverage },
                    { label: 'Strike rate', value: careerStats.strikeRate },
                    { label: 'Hundreds', value: careerStats.centuries },
                    { label: 'Fifties', value: careerStats.halfCenturies },
                    { label: 'Fours', value: careerStats.fours },
                    { label: 'Sixes', value: careerStats.sixes },
                  ].map((metric) => (
                    <Grid key={metric.label} size={{ xs: 6, sm: 4, lg: 3 }}>
                      <PlayerStatCard {...metric} accentColor={accentColor} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">Career batting aggregates are not recorded; available season records are shown below.</Alert>
              )}
            </Box>
            {battingChartRows.length > 0 && (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <PerformanceChart
                    title="Runs by season"
                    data={battingChartRows.map((row) => ({ season: row.season, value: row.stats.runs }))}
                    color={accentColor}
                    kind="bar"
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <PerformanceChart
                    title="Batting average by season"
                    data={battingChartRows.map((row) => ({ season: row.season, value: row.stats.battingAverage }))}
                    color={accentColor}
                    kind="line"
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <PerformanceChart
                    title="Strike rate by season"
                    data={battingChartRows.map((row) => ({ season: row.season, value: row.stats.strikeRate }))}
                    color={accentColor}
                    kind="line"
                  />
                </Grid>
              </Grid>
            )}
            <SeasonStatsTable
              title="Season-wise batting"
              rows={battingRows}
              fields={[
                { label: 'Matches', key: 'matches' },
                { label: 'Innings', key: 'inningsBat' },
                { label: 'Runs', key: 'runs' },
                { label: 'Highest', key: 'highestScore' },
                { label: 'Average', key: 'battingAverage' },
                { label: 'Strike rate', key: 'strikeRate' },
                { label: '100s', key: 'centuries' },
                { label: '50s', key: 'halfCenturies' },
                { label: '4s', key: 'fours' },
                { label: '6s', key: 'sixes' },
              ]}
            />
            <Alert severity="info">
              Not-outs and innings-by-innings recent scores are not fields in the current statistics schema.
            </Alert>
          </Stack>
        )
      )}

      {tab === 'bowling' && (
        !hasAnyBowling ? (
          <EmptyState
            title="No bowling record available"
            description="There are no career or season bowling statistics recorded for this player."
          />
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600 }}>Career bowling statistics</Typography>
              {hasCareerBowling && careerStats ? (
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Matches', value: careerStats.matches },
                    { label: 'Innings', value: careerStats.inningsBowl },
                    { label: 'Overs', value: careerStats.overs },
                    { label: 'Runs conceded', value: careerStats.runsConceded },
                    { label: 'Wickets', value: careerStats.wickets },
                    { label: 'Best bowling', value: careerStats.bestBowling },
                    { label: 'Bowling average', value: careerStats.bowlingAverage },
                    { label: 'Economy rate', value: careerStats.economy },
                    { label: 'Bowling strike rate', value: careerStats.bowlingStrikeRate },
                    { label: 'Five-wicket hauls', value: careerStats.fiveWicketHauls },
                  ].map((metric) => (
                    <Grid key={metric.label} size={{ xs: 6, sm: 4, lg: 3 }}>
                      <PlayerStatCard {...metric} accentColor={accentColor} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">Career bowling aggregates are not recorded; available season records are shown below.</Alert>
              )}
            </Box>
            {bowlingChartRows.length > 0 && (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <PerformanceChart
                    title="Wickets by season"
                    data={bowlingChartRows.map((row) => ({ season: row.season, value: row.stats.wickets }))}
                    color={accentColor}
                    kind="bar"
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <PerformanceChart
                    title="Economy rate by season"
                    data={bowlingChartRows.map((row) => ({ season: row.season, value: row.stats.economy }))}
                    color={accentColor}
                    kind="line"
                  />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <PerformanceChart
                    title="Bowling average by season"
                    data={bowlingChartRows.map((row) => ({ season: row.season, value: row.stats.bowlingAverage }))}
                    color={accentColor}
                    kind="line"
                  />
                </Grid>
              </Grid>
            )}
            <SeasonStatsTable
              title="Season-wise bowling"
              rows={bowlingRows}
              fields={[
                { label: 'Matches', key: 'matches' },
                { label: 'Innings', key: 'inningsBowl' },
                { label: 'Overs', key: 'overs' },
                { label: 'Runs', key: 'runsConceded' },
                { label: 'Wickets', key: 'wickets' },
                { label: 'Best', key: 'bestBowling' },
                { label: 'Average', key: 'bowlingAverage' },
                { label: 'Economy', key: 'economy' },
                { label: 'Strike rate', key: 'bowlingStrikeRate' },
                { label: '5W', key: 'fiveWicketHauls' },
              ]}
            />
            <Alert severity="info">
              Maidens, four-wicket hauls, and match-by-match bowling performances are not stored in the current statistics schema.
            </Alert>
          </Stack>
        )
      )}

      {tab === 'fielding' && (
        !hasAnyFielding ? (
          <EmptyState
            title="No fielding record available"
            description="There are no career or season fielding statistics recorded for this player."
          />
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600 }}>Career fielding statistics</Typography>
              {hasFieldingData(careerStats) && careerStats ? (
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <PlayerStatCard label="Catches" value={careerStats.catches} accentColor={accentColor} />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <PlayerStatCard label="Run outs" value={careerStats.runOuts} accentColor={accentColor} />
                  </Grid>
                  {(player.isWicketkeeper || player.primaryRole === 'WK') && (
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <PlayerStatCard label="Stumpings" value={careerStats.stumpings} accentColor={accentColor} />
                    </Grid>
                  )}
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <PlayerStatCard
                      label="Total dismissals"
                      value={careerStats.catches + careerStats.runOuts + careerStats.stumpings}
                      accentColor={accentColor}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">Career fielding totals are not recorded; season-wise records are shown below.</Alert>
              )}
            </Box>
            {(player.isWicketkeeper || player.primaryRole === 'WK') && (
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Wicketkeeping</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    This player is listed as a wicketkeeper. Stumping totals are shown only where the statistics record contains fielding data.
                  </Typography>
                </CardContent>
              </Card>
            )}
            <SeasonStatsTable
              title="Season-wise fielding"
              rows={fieldingRows}
              fields={[
                { label: 'Matches', key: 'matches' },
                { label: 'Catches', key: 'catches' },
                { label: 'Run outs', key: 'runOuts' },
                { label: 'Stumpings', key: 'stumpings' },
              ]}
            />
          </Stack>
        )
      )}

      {tab === 'career' && (
        <Stack spacing={2.5}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}>
              <PlayerStatCard label="IPL debut" value={debutRecord?.season?.name || '—'} accentColor={accentColor} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <PlayerStatCard label="Seasons played" value={seasonsPlayed} accentColor={accentColor} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <PlayerStatCard label="Franchises represented" value={franchiseHistory.length} accentColor={accentColor} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <PlayerStatCard
                label="Best run season"
                value={bestRunSeason?.season?.name || '—'}
                caption={bestRunSeason ? `${formatStat(bestRunSeason.stats?.runs)} runs` : undefined}
                accentColor={accentColor}
              />
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600 }}>Franchise history</Typography>
            {franchiseHistory.length === 0 ? (
              <EmptyState
                title="No franchise history recorded"
                description="Season-to-franchise records have not been added for this player."
              />
            ) : (
              <Grid container spacing={1.5}>
                {franchiseHistory.map(({ team, seasons }) => (
                  <Grid key={team.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.025)', borderTop: `2px solid ${team.primaryColor}` }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                          <TeamLogo team={team} size={38} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                              {team.shortCode} · {team.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {seasons.join(' · ')}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 600 }}>Season timeline</Typography>
            {playedSeasonRecords.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No season-level appearances are recorded.</Typography>
            ) : (
              <Grid container spacing={1.25}>
                {playedSeasonRecords.map((record) => (
                  <Grid key={record.seasonId} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.02)' }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {record.season?.name || record.seasonId}
                        </Typography>
                        <Typography variant="subtitle2" noWrap sx={{ mt: 0.35, fontWeight: 600 }}>
                          {record.team?.shortCode || 'Franchise not recorded'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatStat(record.stats?.matches)} matches
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <PlayerStatCard
                label="Best wicket season"
                value={bestWicketSeason?.season?.name || '—'}
                caption={bestWicketSeason ? `${formatStat(bestWicketSeason.stats?.wickets)} wickets` : undefined}
                accentColor={accentColor}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Card sx={{ height: '100%', bgcolor: 'rgba(255,255,255,0.02)' }}>
                <CardContent sx={{ p: 1.75 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Awards and achievements</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Award and achievement records are not included in the current catalog.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      )}

      {tab === 'seasons' && (
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Season performance</Typography>
              <Typography variant="body2" color="text.secondary">Select a season with a stored player record.</Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }} disabled={seasonRecords.length === 0}>
              <InputLabel>Season</InputLabel>
              <Select
                label="Season"
                value={selectedStatsSeason?.seasonId || ''}
                onChange={(event) => setSelectedStatsSeasonId(event.target.value)}
              >
                {seasonRecords.map((record) => (
                  <MenuItem key={record.seasonId} value={record.seasonId}>
                    {record.season?.name || record.seasonId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {selectedStatsSeason ? (
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {selectedStatsSeason.season?.name || selectedStatsSeason.seasonId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStatsSeason.team
                      ? `${selectedStatsSeason.team.shortCode} · ${selectedStatsSeason.team.name}`
                      : 'Franchise not recorded'}
                    {selectedStatsSeason.eligibility ? ` · ${selectedStatsSeason.eligibility.actualSquadStatus}` : ''}
                  </Typography>
                </Stack>
                {selectedStatsSeason.stats ? (
                  <Grid container spacing={1.25}>
                    <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                      <PlayerStatCard label="Matches" value={selectedStatsSeason.stats.matches} accentColor={accentColor} />
                    </Grid>
                    {hasBattingData(selectedStatsSeason.stats) && (
                      <>
                        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                          <PlayerStatCard label="Runs" value={selectedStatsSeason.stats.runs} accentColor={accentColor} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                          <PlayerStatCard label="Batting average" value={selectedStatsSeason.stats.battingAverage} accentColor={accentColor} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                          <PlayerStatCard label="Strike rate" value={selectedStatsSeason.stats.strikeRate} accentColor={accentColor} />
                        </Grid>
                      </>
                    )}
                    {hasBowlingData(selectedStatsSeason.stats) && (
                      <>
                        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                          <PlayerStatCard label="Wickets" value={selectedStatsSeason.stats.wickets} accentColor={accentColor} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                          <PlayerStatCard label="Economy" value={selectedStatsSeason.stats.economy} accentColor={accentColor} />
                        </Grid>
                      </>
                    )}
                    {hasFieldingData(selectedStatsSeason.stats) && (
                      <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
                        <PlayerStatCard label="Catches" value={selectedStatsSeason.stats.catches} accentColor={accentColor} />
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Alert severity="info">No season performance statistics are recorded for this season.</Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No season records available"
              description="Season performance and franchise records have not been added for this player."
            />
          )}

          <SeasonStatsTable
            title="All recorded IPL seasons"
            rows={seasonRecords}
            fields={[
              { label: 'Matches', key: 'matches' },
              { label: 'Runs', key: 'runs' },
              { label: 'Average', key: 'battingAverage' },
              { label: 'Strike rate', key: 'strikeRate' },
              { label: 'Wickets', key: 'wickets' },
              { label: 'Economy', key: 'economy' },
              { label: 'Catches', key: 'catches' },
            ]}
          />
        </Stack>
      )}
    </>
  );

  return (
    <Stack spacing={{ xs: 2, md: 2.5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            {fromBuilder ? 'Back to Squad Builder' : 'All Players'}
          </Button>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.82rem' }}>
            <MuiLink component={Link} to="/players" underline="hover" color="text.secondary">Players</MuiLink>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>{player.name}</Typography>
          </Breadcrumbs>
        </Stack>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 165 } }}>
          <InputLabel>Season context</InputLabel>
          <Select
            label="Season context"
            value={activeSeason.id}
            onChange={(event) => {
              const nextSeasonId = event.target.value;
              setSelectedSeasonId(nextSeasonId);
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('season', nextSeasonId);
              setSearchParams(nextParams, { replace: true });
            }}
          >
            {catalog.seasons.map((season) => (
              <MenuItem key={season.id} value={season.id}>{season.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {validationError && (
        <Alert severity="error" onClose={() => setValidationError(null)}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{validationError.message}</Typography>
          <Typography variant="caption" color="text.secondary">
            Resolution: {validationError.suggestedResolution}
          </Typography>
        </Alert>
      )}

      <PlayerProfileHeader
        player={player}
        team={player.actualTeam}
        accentColor={accentColor}
        activeSeasonName={activeSeason.name}
        isAvailable={isAvailable}
        isOverseas={isOverseas}
        careerMatches={careerStats?.matches}
        seasonsPlayed={seasonsPlayed}
        overallRating={hasRatings ? player.ratings.overall : undefined}
        actions={addToSquadAction}
        onViewCareer={() => setTab('career')}
      />

      <Card sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 1.25, sm: 2 }, pt: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', justifyContent: 'space-between', px: 0.75, pb: 0.75 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, fontWeight: 600 }}>
              IPL performance
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {seasonRecords.length} recorded seasons
            </Typography>
          </Stack>
          <Tabs
            value={tab}
            onChange={(_, value: DetailTab) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label={`${player.name} IPL statistics`}
            sx={{
              minHeight: 44,
              '& .MuiTabs-indicator': { backgroundColor: accentColor, height: 2 },
              '& .MuiTab-root': {
                minWidth: { xs: 82, sm: 104 },
                minHeight: 44,
                px: { xs: 1, sm: 1.5 },
                color: 'text.secondary',
                textTransform: 'none',
                fontSize: '0.82rem',
                '&.Mui-selected': {
                  color: accentColor,
                  bgcolor: `${accentColor}12`,
                  borderRadius: '10px 10px 0 0',
                },
              },
            }}
          >
            {DETAIL_TABS.map((detailTab) => (
              <Tab key={detailTab.id} value={detailTab.id} label={detailTab.label} />
            ))}
          </Tabs>
        </Box>
        <Divider />
        <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
          <Fade in key={tab} timeout={160}>
            <Box>{tabContent}</Box>
          </Fade>
        </CardContent>
      </Card>
    </Stack>
  );
}
