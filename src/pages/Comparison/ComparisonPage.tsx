import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCatalog } from '../../hooks/useCatalog';
import {
  usePublicSquads,
  useSaveComparisonMutation,
  useUserSquads,
} from '../../hooks/useSquads';
import { calculateTeamRatings } from '../../services/ratings/ratingEngine';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { EmptyState, LoadingState, PageHeader } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';
import type { CustomSquad, PlayerWithDetails } from '../../types/ipl';

const SERIES_COLORS = ['#3B82F6', '#F59E0B', '#22C55E', '#EC4899'];

export function ComparisonPage() {
  const user = useAuthStore((s) => s.user);
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, activeSeason, activeRule, seasonPlayers, isLoading: catLoading } = useCatalog();
  const { data: userSquads = [], isLoading: uLoading } = useUserSquads();
  const { data: publicSquads = [] } = usePublicSquads();
  const saveCompMutation = useSaveComparisonMutation();

  const availableSquads = useMemo(() => {
    const map = new Map<string, CustomSquad>();
    for (const s of [...userSquads, ...publicSquads]) {
      map.set(s.id, s);
    }
    return Array.from(map.values());
  }, [userSquads, publicSquads]);

  const [selectedSquads, setSelectedSquads] = useState<CustomSquad[]>([]);
  const [comparisonName, setComparisonName] = useState('Franchise Benchmark');
  const [combinedXI, setCombinedXI] = useState<PlayerWithDetails[]>([]);

  const playersMap = useMemo(() => new Map(seasonPlayers.map((p) => [p.id, p])), [seasonPlayers]);
  const teamsMap = useMemo(() => new Map((catalog?.teams || []).map((t) => [t.id, t])), [catalog]);

  const analyzed = useMemo(() => {
    return selectedSquads.map((sq, idx) => {
      const players = sq.playerIds
        .map((id) => playersMap.get(id))
        .filter((p): p is PlayerWithDetails => Boolean(p));
      const ratings = calculateTeamRatings(players);
      const team = teamsMap.get(sq.teamId);
      const indian = players.filter((p) => !p.isOverseas).length;
      const overseas = players.filter((p) => p.isOverseas).length;
      return {
        squad: sq,
        team,
        players,
        ratings,
        indianDepth: Math.min(100, Math.round((indian / Math.max(1, players.length)) * 100)),
        overseasDepth: Math.min(100, Math.round((overseas / 8) * 100)),
        color: team?.primaryColor || SERIES_COLORS[idx % SERIES_COLORS.length],
      };
    });
  }, [selectedSquads, playersMap, teamsMap]);

  if (catLoading || uLoading) return <LoadingState count={3} />;

  const radarData = [
    { category: 'Overall', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.overallRating])) },
    { category: 'Batting', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.battingStrength])) },
    { category: 'Bowling', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.bowlingStrength])) },
    { category: 'All-Round', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.allRounderStrength])) },
    { category: 'Keeping', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.wicketkeepingStrength])) },
    { category: 'Pace', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.paceStrength])) },
    { category: 'Spin', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.spinStrength])) },
    { category: 'Bench Depth', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.squadDepth])) },
  ];

  const barData = [
    { metric: 'Overall', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.overallRating])) },
    { metric: 'Batting', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.battingStrength])) },
    { metric: 'Bowling', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.bowlingStrength])) },
    { metric: 'All-Rounder', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.ratings.allRounderStrength])) },
    { metric: 'Indian Depth', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.indianDepth])) },
    { metric: 'OS Depth', ...Object.fromEntries(analyzed.map((a) => [a.squad.name, a.overseasDepth])) },
  ];

  const handleGenerateCombinedXI = () => {
    if (!activeRule || analyzed.length < 2) return;
    const pool = new Map<string, PlayerWithDetails>();
    for (const a of analyzed) {
      for (const p of a.players) {
        if (p.eligibility?.isAvailable !== false) pool.set(p.id, p);
      }
    }
    const sorted = Array.from(pool.values()).sort((a, b) => b.ratings.overall - a.ratings.overall);
    const chosen: PlayerWithDetails[] = [];
    let os = 0;
    const wk = sorted.find((p) => p.isWicketkeeper || p.primaryRole === 'WK');
    if (wk) {
      chosen.push(wk);
      if (wk.isOverseas) os += 1;
    }
    for (const p of sorted) {
      if (chosen.length >= activeRule.playingXiSize) break;
      if (chosen.some((c) => c.id === p.id)) continue;
      if (p.isOverseas && os >= activeRule.maxOverseasInXi) continue;
      chosen.push(p);
      if (p.isOverseas) os += 1;
    }
    setCombinedXI(chosen);
    showSnackbar('Generated Best Combined Playing XI respecting season overseas rules!', 'success');
  };

  const handleSaveComparison = async () => {
    if (!user || selectedSquads.length < 2 || !activeSeason) return;
    await saveCompMutation.mutateAsync({
      id: `cmp_${Date.now().toString(36)}`,
      ownerId: user.uid,
      name: comparisonName,
      seasonId: activeSeason.id,
      squadIds: selectedSquads.map((s) => s.id),
      combinedXiIds: combinedXI.map((p) => p.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    showSnackbar('Comparison saved to your account!', 'success');
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Squad Comparison"
        subtitle="Select 2 to 4 saved custom squads to benchmark strengths, role depth, and build a Combined XI."
      />

      {/* Selection Bar */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                options={availableSquads}
                value={selectedSquads}
                onChange={(_, val) => setSelectedSquads(val.slice(0, 4))}
                getOptionLabel={(opt) => `${opt.name} (${teamsMap.get(opt.teamId)?.shortCode || opt.teamId} • ${opt.seasonId})`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField {...params} label="Select 2–4 Squads to Compare" placeholder="Pick squads..." />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Comparison Title"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<AutoAwesomeIcon />}
                  disabled={selectedSquads.length < 2}
                  onClick={handleGenerateCombinedXI}
                >
                  Combined XI
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={selectedSquads.length < 2 || !user || saveCompMutation.isPending}
                  onClick={handleSaveComparison}
                >
                  Save
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedSquads.length < 2 ? (
        <EmptyState
          title="Select at least 2 squads"
          description={
            availableSquads.length < 2
              ? 'Save at least two custom squads in the Squad Builder to run side-by-side comparisons.'
              : 'Use the selector above to compare 2, 3, or 4 squads side by side.'
          }
        />
      ) : (
        <>
          {/* Side-by-side summary cards */}
          <Grid container spacing={2}>
            {analyzed.map((a) => (
              <Grid key={a.squad.id} size={{ xs: 12, sm: 6, md: 12 / analyzed.length }}>
                <Card sx={{ borderTop: `3px solid ${a.color}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.25} sx={{ mb: 1.5, alignItems: 'center' }}>
                      <TeamLogo team={a.team} size={38} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>{a.squad.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.players.length} Players</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      <Chip size="small" label={`OVR ${a.ratings.overallRating}`} color="primary" />
                      <Chip size="small" label={`BAT ${a.ratings.battingStrength}`} />
                      <Chip size="small" label={`BOWL ${a.ratings.bowlingStrength}`} />
                      <Chip size="small" label={`AR ${a.ratings.allRounderStrength}`} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: 390 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                    Multi-Axis Strength Radar
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.12)" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#A0A9B7', fontSize: 11 }} />
                        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#687386', fontSize: 10 }} />
                        {analyzed.map((a, idx) => (
                          <Radar
                            key={a.squad.id}
                            name={a.squad.name}
                            dataKey={a.squad.name}
                            stroke={SERIES_COLORS[idx % SERIES_COLORS.length]}
                            fill={SERIES_COLORS[idx % SERIES_COLORS.length]}
                            fillOpacity={0.18}
                          />
                        ))}
                        <Legend />
                        <Tooltip contentStyle={{ backgroundColor: '#10141C', borderColor: 'rgba(255,255,255,0.15)' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: 390 }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                    Category Bar Comparison
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="metric" tick={{ fill: '#A0A9B7', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#A0A9B7', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#10141C', borderColor: 'rgba(255,255,255,0.15)' }} />
                        <Legend />
                        {analyzed.map((a, idx) => (
                          <Bar
                            key={a.squad.id}
                            dataKey={a.squad.name}
                            fill={SERIES_COLORS[idx % SERIES_COLORS.length]}
                            radius={[4, 4, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Metrics Table */}
          <Card>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    {analyzed.map((a) => (
                      <TableCell key={a.squad.id} align="right">{a.squad.name}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    ['Overall Rating', (a: (typeof analyzed)[0]) => a.ratings.overallRating],
                    ['Batting Strength', (a: (typeof analyzed)[0]) => a.ratings.battingStrength],
                    ['Bowling Strength', (a: (typeof analyzed)[0]) => a.ratings.bowlingStrength],
                    ['Pace Bowling', (a: (typeof analyzed)[0]) => a.ratings.paceStrength],
                    ['Spin Bowling', (a: (typeof analyzed)[0]) => a.ratings.spinStrength],
                    ['All-Rounder Strength', (a: (typeof analyzed)[0]) => a.ratings.allRounderStrength],
                    ['Wicketkeeping', (a: (typeof analyzed)[0]) => a.ratings.wicketkeepingStrength],
                    ['Bench Depth', (a: (typeof analyzed)[0]) => a.ratings.squadDepth],
                  ].map(([label, getter]) => (
                    <TableRow key={label as string}>
                      <TableCell sx={{ fontWeight: 600 }}>{label as string}</TableCell>
                      {analyzed.map((a) => (
                        <TableCell key={a.squad.id} align="right" className="tabular-nums">
                          {(getter as (x: (typeof analyzed)[0]) => number)(a)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* Combined XI */}
          {combinedXI.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Best Combined Playing XI ({activeSeason?.name})
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {combinedXI.map((p, idx) => (
                    <Chip
                      key={p.id}
                      label={`${idx + 1}. ${p.shortName} (${p.primaryRole}${p.isOverseas ? ' • OS' : ''}) — ${p.ratings.overall}`}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Stack>
  );
}
