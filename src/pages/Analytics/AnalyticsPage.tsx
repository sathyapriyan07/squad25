import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { useNavigate, useParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useSquadById } from '../../hooks/useSquads';
import {
  calculateTeamRatings,
  DEFAULT_RATING_WEIGHTS,
  type RatingWeights,
} from '../../services/ratings/ratingEngine';
import { EmptyState, LoadingState, PageHeader, StatCard } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';
import type { PlayerWithDetails } from '../../types/ipl';

const ROLE_COLORS: Record<string, string> = {
  WK: '#C084FC',
  BAT: '#60A5FA',
  AR: '#FBBF24',
  BOWL: '#4ADE80',
};

export function AnalyticsPage() {
  const { squadId } = useParams();
  const navigate = useNavigate();
  const { data: squad, isLoading: squadLoading } = useSquadById(squadId);
  const { catalog, seasonPlayers, isLoading: catLoading } = useCatalog(squad?.seasonId);
  const [weights, setWeights] = useState<RatingWeights>(DEFAULT_RATING_WEIGHTS);

  const team = useMemo(
    () => catalog?.teams.find((t) => t.id === squad?.teamId),
    [catalog, squad?.teamId]
  );
  const accentColor = team?.primaryColor || '#3B82F6';

  const squadPlayers = useMemo(() => {
    const map = new Map(seasonPlayers.map((p) => [p.id, p]));
    return (squad?.playerIds || [])
      .map((id) => map.get(id))
      .filter((p): p is PlayerWithDetails => Boolean(p));
  }, [squad, seasonPlayers]);

  const ratings = useMemo(
    () => calculateTeamRatings(squadPlayers, weights),
    [squadPlayers, weights]
  );

  if (squadLoading || catLoading) return <LoadingState count={4} />;
  if (!squad) {
    return (
      <EmptyState
        title="Squad not found"
        description="Choose a saved squad to inspect team strength analytics and charts."
        action={<Button variant="contained" onClick={() => navigate('/saved-squads')}>View Saved Squads</Button>}
      />
    );
  }

  const radarData = [
    { metric: 'Batting', score: ratings.battingStrength },
    { metric: 'Bowling', score: ratings.bowlingStrength },
    { metric: 'Pace', score: ratings.paceStrength },
    { metric: 'Spin', score: ratings.spinStrength },
    { metric: 'All-Round', score: ratings.allRounderStrength },
    { metric: 'Keeping', score: ratings.wicketkeepingStrength },
    { metric: 'Depth', score: ratings.squadDepth },
  ];

  const roleCounts = [
    { name: 'WK', value: squadPlayers.filter((p) => p.primaryRole === 'WK').length },
    { name: 'BAT', value: squadPlayers.filter((p) => p.primaryRole === 'BAT').length },
    { name: 'AR', value: squadPlayers.filter((p) => p.primaryRole === 'AR').length },
    { name: 'BOWL', value: squadPlayers.filter((p) => p.primaryRole === 'BOWL').length },
  ].filter((d) => d.value > 0);

  const topPlayersBar = [...squadPlayers]
    .sort((a, b) => b.ratings.overall - a.ratings.overall)
    .slice(0, 8)
    .map((p) => ({
      name: p.shortName,
      Overall: p.ratings.overall,
      Batting: p.ratings.batting,
      Bowling: Math.max(p.ratings.paceBowling, p.ratings.spinBowling),
    }));

  const updateWeight = (key: keyof RatingWeights, pct: number) => {
    setWeights((prev) => ({ ...prev, [key]: pct / 100 }));
  };

  const weightSumPct = Math.round(
    (weights.batting + weights.bowling + weights.allRounder + weights.wicketkeeping + weights.squadDepth) * 100
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Team Analytics — ${squad.name}`}
        subtitle="Weighted strength ratings calculated from stored player attributes across role specialists."
        badge={<TeamLogo team={team} size={40} />}
        actions={
          <>
            <Button variant="outlined" onClick={() => navigate(`/builder/${squad.id}`)}>
              Edit Squad
            </Button>
            <Button variant="contained" onClick={() => navigate(`/playing-xi/${squad.id}`)} sx={{ bgcolor: accentColor }}>
              Playing XI
            </Button>
          </>
        }
      />

      {/* Top Rating Cards */}
      <Grid container spacing={2}>
        {[
          { label: 'Overall Rating', value: ratings.overallRating, sub: 'Weighted composite' },
          { label: 'Batting Strength', value: ratings.battingStrength, sub: 'Top 7 specialist score' },
          { label: 'Bowling Strength', value: ratings.bowlingStrength, sub: `Pace ${ratings.paceStrength} • Spin ${ratings.spinStrength}` },
          { label: 'All-Rounders', value: ratings.allRounderStrength, sub: `WK ${ratings.wicketkeepingStrength} • Depth ${ratings.squadDepth}` },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 6, md: 3 }}>
            <StatCard label={card.label} value={`${card.value}/100`} sublabel={card.sub} accentColor={accentColor} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Radar Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 390 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Squad Strength Profile
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.12)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#A0A9B7', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#687386', fontSize: 10 }} />
                    <Radar name={squad.name} dataKey="score" stroke={accentColor} fill={accentColor} fillOpacity={0.32} />
                    <Tooltip contentStyle={{ backgroundColor: '#10141C', borderColor: 'rgba(255,255,255,0.15)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 390 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Role Distribution ({squadPlayers.length} Players)
              </Typography>
              <Box sx={{ flex: 1, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} innerRadius={58} paddingAngle={3} label>
                      {roleCounts.map((entry) => (
                        <Cell key={entry.name} fill={ROLE_COLORS[entry.name] || '#3B82F6'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#10141C', borderColor: 'rgba(255,255,255,0.15)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Players Rating Comparison */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                Core Player Attribute Comparison
              </Typography>
              <Box sx={{ flex: 1, minHeight: 270 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPlayersBar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: '#A0A9B7', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#A0A9B7', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#10141C', borderColor: 'rgba(255,255,255,0.15)' }} />
                    <Bar dataKey="Overall" fill={accentColor} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Batting" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Bowling" fill="#4ADE80" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Configurable Formula Weights */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: 380 }}>
            <CardContent>
              <Stack direction="row" sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Formula Weights
                </Typography>
                <Chip
                  size="small"
                  label={`Total: ${weightSumPct}%`}
                  color={weightSumPct === 100 ? 'success' : 'warning'}
                />
              </Stack>
              <Stack spacing={1.25}>
                {(
                  [
                    ['batting', 'Batting'],
                    ['bowling', 'Bowling'],
                    ['allRounder', 'All-Rounders'],
                    ['wicketkeeping', 'Wicketkeeping'],
                    ['squadDepth', 'Squad Depth'],
                  ] as Array<[keyof RatingWeights, string]>
                ).map(([key, label]) => (
                  <Box key={key}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 700 }}>
                        {Math.round(weights[key] * 100)}%
                      </Typography>
                    </Stack>
                    <Slider
                      size="small"
                      min={0}
                      max={60}
                      step={5}
                      value={Math.round(weights[key] * 100)}
                      onChange={(_, v) => updateWeight(key, v as number)}
                    />
                  </Box>
                ))}
                <Button size="small" onClick={() => setWeights(DEFAULT_RATING_WEIGHTS)}>
                  Reset Default (35/30/15/10/10)
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
