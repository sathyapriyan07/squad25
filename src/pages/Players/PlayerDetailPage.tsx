import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import FlightIcon from '@mui/icons-material/Flight';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { calculateTeamRatings } from '../../services/ratings/ratingEngine';
import { validatePlayerAddition } from '../../services/validation/validationEngine';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useSquadStore } from '../../store/squadStore';
import { EmptyState, LoadingState, StatCard } from '../../components/common/CommonUi';
import { CountryLabel, PlayerAvatar, RoleBadge } from '../../components/common/PlayerAvatar';
import { TeamLogo } from '../../components/common/TeamLogo';
import type { PlayerWithDetails, ValidationIssue } from '../../types/ipl';

export function PlayerDetailPage() {
  const { playerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromBuilder = searchParams.get('from') === 'builder';
  const builderSquadId = searchParams.get('squadId');
  const querySeasonId = searchParams.get('season') || undefined;

  const user = useAuthStore((s) => s.user);
  const { selectedSeasonId, setSelectedSeasonId, showSnackbar } = useAppStore();
  const { draft, addPlayer, removePlayer } = useSquadStore();

  const effectiveSeasonId = querySeasonId || selectedSeasonId;
  const { catalog, activeSeason, activeRule, seasonPlayers, isLoading } = useCatalog(effectiveSeasonId);

  const [tab, setTab] = useState(0);
  const [validationError, setValidationError] = useState<ValidationIssue | null>(null);

  const player = useMemo(
    () => seasonPlayers.find((p) => p.id === playerId) || null,
    [seasonPlayers, playerId]
  );

  const teamsMap = useMemo(
    () => new Map((catalog?.teams || []).map((t) => [t.id, t])),
    [catalog]
  );

  const seasonsMap = useMemo(
    () => new Map((catalog?.seasons || []).map((s) => [s.id, s])),
    [catalog]
  );

  const playersMap = useMemo(
    () => new Map(seasonPlayers.map((p) => [p.id, p])),
    [seasonPlayers]
  );

  const eligibilityMap = useMemo(() => {
    const map = new Map();
    for (const p of seasonPlayers) {
      if (p.eligibility) map.set(p.id, p.eligibility);
    }
    return map;
  }, [seasonPlayers]);

  const seasonHistoryRows = useMemo(() => {
    if (!catalog || !player) return [];
    return catalog.playerSeasons
      .filter((ps) => ps.playerId === player.id)
      .map((ps) => ({
        eligibility: ps,
        season: seasonsMap.get(ps.seasonId),
        team: ps.actualTeamId ? teamsMap.get(ps.actualTeamId) : undefined,
        stats: catalog.playerStats.find(
          (st) => st.playerId === player.id && st.seasonId === ps.seasonId
        ),
      }))
      .sort((a, b) => (b.season?.year ?? 0) - (a.season?.year ?? 0));
  }, [catalog, player, seasonsMap, teamsMap]);

  if (isLoading) return <LoadingState count={4} />;

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
  const stats = player.seasonStats ?? player.careerStats;

  const ratingBars = [
    { label: 'Batting', val: player.ratings.batting },
    { label: 'Power Hitting', val: player.ratings.powerHitting },
    { label: 'Technique', val: player.ratings.technique },
    { label: 'Finishing', val: player.ratings.finishing },
    { label: 'Pace Bowling', val: player.ratings.paceBowling },
    { label: 'Spin Bowling', val: player.ratings.spinBowling },
    { label: 'Wicketkeeping', val: player.ratings.wicketkeeping },
    { label: 'Fielding', val: player.ratings.fielding },
  ];

  const radarData = ratingBars.map((r) => ({
    attribute: r.label.replace(' Bowling', ''),
    score: r.val,
  }));

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
    const currentObjs = draft.playerIds
      .map((id) => playersMap.get(id))
      .filter((p): p is PlayerWithDetails => Boolean(p));
    const nextRatings = calculateTeamRatings([...currentObjs, player]);
    addPlayer(player.id, nextRatings);
    showSnackbar(`${player.shortName} added to ${draft.name}`, 'success');
  };

  const handleRemoveFromDraft = () => {
    setValidationError(null);
    const currentObjs = draft.playerIds
      .map((id) => playersMap.get(id))
      .filter((p): p is PlayerWithDetails => p !== undefined && p.id !== player.id);
    const nextRatings = calculateTeamRatings(currentObjs);
    removePlayer(player.id, nextRatings);
    showSnackbar(`${player.shortName} removed from ${draft.name}`, 'info');
  };

  return (
    <Stack spacing={3}>
      {/* Navigation & Season Context Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={handleBack}>
            {fromBuilder ? 'Back to Squad Builder' : 'All Players'}
          </Button>
          <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.85rem' }}>
            <MuiLink component={Link} to="/players" underline="hover" color="text.secondary">
              Players
            </MuiLink>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {player.name}
            </Typography>
          </Breadcrumbs>
        </Stack>

        <FormControl size="small" sx={{ minWidth: 165 }}>
          <InputLabel>Season Context</InputLabel>
          <Select
            label="Season Context"
            value={activeSeason.id}
            onChange={(e) => {
              const nextSeason = e.target.value;
              setSelectedSeasonId(nextSeason);
              const nextParams = new URLSearchParams(searchParams);
              nextParams.set('season', nextSeason);
              setSearchParams(nextParams, { replace: true });
            }}
          >
            {catalog.seasons.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {validationError && (
        <Alert severity="error" onClose={() => setValidationError(null)}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {validationError.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Resolution: {validationError.suggestedResolution}
          </Typography>
        </Alert>
      )}

      {/* Hero Profile Header */}
      <Card sx={{ borderTop: `4px solid ${accentColor}` }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {/* Left: Avatar + Player Identity (always side-by-side) */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: { xs: 2, sm: 2.5 },
                minWidth: 0,
                flex: 1,
              }}
            >
              <PlayerAvatar player={player} accentColor={accentColor} size={84} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.75 }}>
                  <Typography
                    variant="h4"
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, lineHeight: 1.15 }}
                  >
                    {player.name}
                  </Typography>
                  <RoleBadge role={player.primaryRole} />
                  {isOverseas && (
                    <Chip
                      size="small"
                      icon={<FlightIcon sx={{ fontSize: 14 }} />}
                      label="Overseas"
                      sx={{ bgcolor: 'rgba(245,158,11,0.16)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.35)' }}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={1.25} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <CountryLabel nationality={player.nationality} flag={player.countryFlag} />
                  <Typography variant="body2" color="text.secondary">
                    • {player.isCapped ? 'Capped International' : 'Uncapped Domestic'}
                  </Typography>
                  <Chip
                    size="small"
                    color={isAvailable ? 'success' : 'default'}
                    variant={isAvailable ? 'filled' : 'outlined'}
                    label={isAvailable ? `Eligible in ${activeSeason.name}` : `Not Registered in ${activeSeason.name}`}
                  />
                  {player.actualTeam && (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <TeamLogo team={player.actualTeam} size={22} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {player.actualTeam.name}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Right: Overall Rating & Primary Squad Action */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: { xs: 'space-between', md: 'flex-end' },
                gap: 2,
                flexShrink: 0,
                pt: { xs: 2, md: 0 },
                borderTop: { xs: '1px solid rgba(255,255,255,0.08)', md: 'none' },
              }}
            >
              <Box
                sx={{
                  px: 2.25,
                  py: 1,
                  borderRadius: '12px',
                  bgcolor: `${accentColor}22`,
                  border: `1px solid ${accentColor}66`,
                  textAlign: 'center',
                  minWidth: 88,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.1, letterSpacing: '0.06em' }}>
                  OVERALL
                </Typography>
                <Typography variant="h4" className="tabular-nums" sx={{ fontWeight: 800, color: '#FFF', lineHeight: 1.15 }}>
                  {player.ratings.overall}
                </Typography>
              </Box>

              {hasActiveDraft ? (
                isInDraft ? (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip icon={<CheckIcon />} label="In Active Squad" color="success" sx={{ height: 42, px: 0.75 }} />
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveFromDraft}
                      sx={{ height: 42 }}
                    >
                      Remove
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!isAvailable}
                    startIcon={<AddIcon />}
                    onClick={handleAddToDraft}
                    sx={{
                      bgcolor: accentColor,
                      color: '#FFFFFF',
                      px: 2.5,
                      height: 46,
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: accentColor, filter: 'brightness(1.12)' },
                    }}
                  >
                    {isAvailable ? 'Add to Active Squad' : 'Not Eligible'}
                  </Button>
                )
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<BuildIcon />}
                  onClick={() => navigate(`/builder?season=${activeSeason.id}`)}
                  sx={{
                    bgcolor: accentColor,
                    color: '#FFFFFF',
                    px: 2.5,
                    height: 46,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: accentColor, filter: 'brightness(1.12)' },
                  }}
                >
                  Open Squad Builder
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary KPI Row */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="IPL Matches" value={player.careerStats.matches} sublabel="Career appearances" accentColor={accentColor} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Career Runs" value={player.careerStats.runs} sublabel={`Avg ${player.careerStats.battingAverage} • HS ${player.careerStats.highestScore}`} accentColor={accentColor} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Batting Strike Rate" value={player.careerStats.strikeRate} sublabel={`${player.careerStats.centuries} 100s / ${player.careerStats.halfCenturies} 50s`} accentColor={accentColor} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Career Wickets" value={player.careerStats.wickets} sublabel={`Econ ${player.careerStats.economy} • Best ${player.careerStats.bestBowling}`} accentColor={accentColor} />
        </Grid>
      </Grid>

      {/* Detailed Tabbed Content */}
      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview & Ratings" />
          <Tab label="Batting Statistics" />
          <Tab label="Bowling & Fielding" />
          <Tab label="IPL History & Season Eligibility" />
        </Tabs>

        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                      Player Profile & Biography
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {player.biography || 'Season-registered IPL cricketer with full statistical and attribute tracking.'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Batting Style</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{player.battingStyle}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Bowling Style</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{player.bowlingStyle}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body1" className="tabular-nums" sx={{ fontWeight: 600 }}>{player.dob || '—'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">{activeSeason.name} Status</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {isInDraft ? 'Selected in Active Squad' : player.eligibility?.actualSquadStatus || 'Unassigned'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 700 }}>
                      Franchises Represented
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {player.previousTeams.length > 0 ? (
                        player.previousTeams.map((code) => <Chip key={code} label={code} variant="outlined" />)
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No historical franchise appearances recorded.
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                  Attribute Breakdown (0–100)
                </Typography>
                <Box sx={{ height: 260, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.12)" />
                      <PolarAngleAxis dataKey="attribute" tick={{ fill: '#A0A9B7', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#687386', fontSize: 10 }} />
                      <Radar name={player.shortName} dataKey="score" stroke={accentColor} fill={accentColor} fillOpacity={0.32} />
                      <Tooltip contentStyle={{ backgroundColor: '#10141C', borderColor: 'rgba(255,255,255,0.15)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
                <Grid container spacing={1.75}>
                  {ratingBars.map((r) => (
                    <Grid key={r.label} size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">{r.label}</Typography>
                        <Typography variant="body2" className="tabular-nums" sx={{ fontWeight: 700 }}>{r.val}/100</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={r.val}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: 'rgba(255,255,255,0.08)',
                          '& .MuiLinearProgress-bar': { bgcolor: accentColor, borderRadius: 4 },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {player.seasonStats ? `${activeSeason.name} Batting Record` : 'Career IPL Batting Record'}
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Matches', value: stats.matches },
                  { label: 'Innings Batted', value: stats.inningsBat },
                  { label: 'Total Runs', value: stats.runs },
                  { label: 'Highest Score', value: stats.highestScore },
                  { label: 'Batting Average', value: stats.battingAverage },
                  { label: 'Strike Rate', value: stats.strikeRate },
                  { label: '100s / 50s', value: `${stats.centuries} / ${stats.halfCenturies}` },
                  { label: 'Boundary 4s / 6s', value: `${stats.fours} / ${stats.sixes}` },
                ].map((item) => (
                  <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      <Typography variant="h5" className="tabular-nums" sx={{ mt: 0.5, fontWeight: 700 }}>{item.value}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                  {player.seasonStats ? `${activeSeason.name} Bowling Record` : 'Career IPL Bowling Record'}
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Bowling Innings', value: stats.inningsBowl },
                    { label: 'Overs Bowled', value: stats.overs },
                    { label: 'Runs Conceded', value: stats.runsConceded },
                    { label: 'Wickets Taken', value: stats.wickets },
                    { label: 'Economy Rate', value: stats.economy },
                    { label: 'Bowling Average', value: stats.bowlingAverage },
                    { label: 'Bowling Strike Rate', value: stats.bowlingStrikeRate },
                    { label: 'Best Bowling', value: stats.bestBowling },
                    { label: '5-Wicket Hauls', value: stats.fiveWicketHauls },
                  ].map((item) => (
                    <Grid key={item.label} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="h5" className="tabular-nums" sx={{ mt: 0.5, fontWeight: 700 }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                  Career Fielding Record
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Catches', value: player.careerStats.catches },
                    { label: 'Run-outs', value: player.careerStats.runOuts },
                    { label: 'Stumpings', value: player.careerStats.stumpings },
                  ].map((item) => (
                    <Grid key={item.label} size={{ xs: 4 }}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="h5" className="tabular-nums" sx={{ mt: 0.5, fontWeight: 700 }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Season-by-Season Eligibility & Franchise Alignment
              </Typography>
              {seasonHistoryRows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No season eligibility records found for this player.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Season</TableCell>
                        <TableCell>Actual Franchise</TableCell>
                        <TableCell>Eligibility</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Runs</TableCell>
                        <TableCell align="right">Wickets</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {seasonHistoryRows.map(({ eligibility, season, team, stats: st }) => (
                        <TableRow key={eligibility.id}>
                          <TableCell sx={{ fontWeight: 600 }}>{season?.name || eligibility.seasonId}</TableCell>
                          <TableCell>
                            {team ? (
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <TeamLogo team={team} size={22} />
                                <span>{team.shortCode} — {team.name}</span>
                              </Stack>
                            ) : (
                              'Free Pool / Unassigned'
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={eligibility.isAvailable ? 'Eligible' : 'Unavailable'}
                              color={eligibility.isAvailable ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{eligibility.actualSquadStatus}</TableCell>
                          <TableCell align="right" className="tabular-nums">{st?.runs ?? '—'}</TableCell>
                          <TableCell align="right" className="tabular-nums">{st?.wickets ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
