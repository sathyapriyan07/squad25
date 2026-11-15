import { Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useUserSquads } from '../../hooks/useSquads';
import { useAuthStore } from '../../store/authStore';
import { EmptyState, LoadingState, PageHeader, StatCard } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { catalog, activeSeason, participatingTeams, eligiblePlayers } = useCatalog();
  const { data: squads = [], isLoading } = useUserSquads();

  if (isLoading) return <LoadingState count={3} />;

  const teamsMap = new Map((catalog?.teams || []).map((t) => [t.id, t]));
  const seasonsMap = new Map((catalog?.seasons || []).map((s) => [s.id, s]));
  const avgRating =
    squads.length > 0
      ? Math.round(squads.reduce((acc, s) => acc + s.ratings.overallRating, 0) / squads.length)
      : 0;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Welcome, ${user?.displayName || 'Manager'}`}
        subtitle={`Managing custom rosters for ${activeSeason?.name || 'IPL 2025'}.`}
        actions={
          <>
            {user?.role === 'admin' && (
              <Button component={Link} to="/admin" variant="outlined" color="warning" startIcon={<AdminPanelSettingsIcon />}>
                Admin Console
              </Button>
            )}
            <Button component={Link} to="/builder" variant="contained" startIcon={<BuildIcon />}>
              New Custom Squad
            </Button>
          </>
        }
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="My Saved Squads" value={squads.length} icon={<BookmarkIcon />} accentColor="#3B82F6" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Avg Squad Rating" value={avgRating} sublabel="Out of 100" icon={<BuildIcon />} accentColor="#22C55E" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Eligible Players" value={eligiblePlayers.length} sublabel={activeSeason?.name} icon={<CompareArrowsIcon />} accentColor="#F59E0B" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Season Teams" value={participatingTeams.length} sublabel={activeSeason?.name} icon={<AdminPanelSettingsIcon />} accentColor="#A855F7" />
        </Grid>
      </Grid>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Your Franchise Squads</Typography>
        <Button component={Link} to="/saved-squads" size="small">Manage All</Button>
      </Stack>

      {squads.length === 0 ? (
        <EmptyState
          title="No custom squads yet"
          description="Select an IPL franchise and build your first custom squad with direct player selection."
          action={<Button variant="contained" onClick={() => navigate('/builder')}>Launch Squad Builder</Button>}
        />
      ) : (
        <Grid container spacing={2}>
          {squads.slice(0, 6).map((sq) => {
            const team = teamsMap.get(sq.teamId);
            const season = seasonsMap.get(sq.seasonId);
            return (
              <Grid key={sq.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ borderTop: `3px solid ${team?.primaryColor || '#3B82F6'}` }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
                      <TeamLogo team={team} size={42} />
                      <Stack sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>{sq.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {team?.shortCode} • {season?.name || sq.seasonId}
                        </Typography>
                      </Stack>
                      <Chip size="small" label={`OVR ${sq.ratings.overallRating}`} color="primary" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                      {sq.playerIds.length} Players • XI: {sq.playingXiIds.length}/11
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="contained" onClick={() => navigate(`/builder/${sq.id}`)}>Edit</Button>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/playing-xi/${sq.id}`)}>Playing XI</Button>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/analytics/${sq.id}`)}>Analytics</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
