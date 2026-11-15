import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import GroupsIcon from '@mui/icons-material/Groups';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { usePublicSquads, useUserSquads } from '../../hooks/useSquads';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { TeamLogo } from '../../components/common/TeamLogo';
import { StatCard } from '../../components/common/CommonUi';
import { DESIGN_TOKENS } from '../../app/theme/theme';

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { selectedSeasonId, setSelectedSeasonId, setSelectedTeamId } = useAppStore();
  const { catalog, activeSeason, participatingTeams, eligiblePlayers } = useCatalog();
  const { data: userSquads = [] } = useUserSquads();
  const { data: publicSquads = [] } = usePublicSquads();

  const recentSquads = (user ? [...userSquads, ...publicSquads] : publicSquads)
    .filter((s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx)
    .slice(0, 6);

  const teamsMap = new Map((catalog?.teams || []).map((t) => [t.id, t]));
  const seasonsMap = new Map((catalog?.seasons || []).map((s) => [s.id, s]));

  const quickActions = [
    {
      title: 'Create New Squad',
      desc: 'Select players directly and assemble an IPL roster.',
      icon: <BuildIcon />,
      path: '/builder',
      color: '#3B82F6',
    },
    {
      title: 'Browse Players',
      desc: 'Explore stats, ratings, and season eligibility.',
      icon: <GroupsIcon />,
      path: '/players',
      color: '#22C55E',
    },
    {
      title: 'Compare Squads',
      desc: 'Benchmark up to 4 squads across 10 tactical metrics.',
      icon: <CompareArrowsIcon />,
      path: '/comparison',
      color: '#F59E0B',
    },
    {
      title: 'Saved Squads',
      desc: 'Manage, duplicate, or share your saved builds.',
      icon: <BookmarkIcon />,
      path: '/saved-squads',
      color: '#A855F7',
    },
  ];

  return (
    <Stack spacing={4}>
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          position: 'relative',
          borderRadius: '18px',
          overflow: 'hidden',
          border: `1px solid ${DESIGN_TOKENS.borderStrong}`,
          minHeight: { xs: 360, md: 420 },
          display: 'flex',
          alignItems: 'center',
          p: { xs: 3, sm: 5, md: 6 },
          background: 'radial-gradient(circle at 75% 25%, #1E293B 0%, #0D111A 55%, #090B10 100%)',
        }}
      >
        {/* Atmospheric Stadium Floodlight Vector Backdrop */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.42,
            pointerEvents: 'none',
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="stadiumGlow" cx="72%" cy="32%" r="55%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#0F172A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#090B10" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1200" height="500" fill="url(#stadiumGlow)" />
            <ellipse cx="780" cy="410" rx="440" ry="130" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <ellipse cx="780" cy="410" rx="280" ry="78" fill="none" stroke="rgba(34,197,94,0.22)" strokeWidth="1.5" strokeDasharray="6 6" />
            <rect x="752" y="388" width="56" height="44" rx="4" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.35)" />
            <line x1="650" y1="80" x2="770" y2="380" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="940" y1="70" x2="800" y2="380" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </svg>
        </Box>

        {/* Dark Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(9,11,16,0.92) 0%, rgba(9,11,16,0.72) 60%, rgba(9,11,16,0.45) 100%)',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              size="small"
              icon={<SportsCricketIcon sx={{ fontSize: 15 }} />}
              label={`Active Cycle: ${activeSeason?.name || 'IPL 2025'}`}
              sx={{ bgcolor: 'rgba(59,130,246,0.18)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.35)' }}
            />
            <Chip
              size="small"
              label={activeSeason?.impactPlayerEnabled ? 'Impact Player Active' : 'Classic XI Rules'}
              variant="outlined"
              sx={{ borderColor: 'rgba(255,255,255,0.18)' }}
            />
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              mb: 1.75,
            }}
          >
            BUILD YOUR DREAM IPL FRANCHISE
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 3.5, maxWidth: 560, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' } }}>
            Pick your players. Create your squad. Build your ultimate Playing XI.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/builder')}
              sx={{ px: 3, py: 1.3 }}
            >
              Build Your Squad
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="inherit"
              onClick={() => navigate('/players')}
              sx={{ px: 3, py: 1.3, borderColor: 'rgba(255,255,255,0.22)' }}
            >
              Explore Players
            </Button>
            <FormControl size="small" sx={{ minWidth: 145 }}>
              <InputLabel id="hero-season-label">Season</InputLabel>
              <Select
                labelId="hero-season-label"
                label="Season"
                value={activeSeason?.id || ''}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                sx={{ bgcolor: 'rgba(21,27,37,0.85)' }}
              >
                {(catalog?.seasons || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Players Eligible"
            value={eligiblePlayers.length}
            sublabel={`For ${activeSeason?.name || 'selected season'}`}
            icon={<GroupsIcon />}
            accentColor="#3B82F6"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Franchises"
            value={participatingTeams.length}
            sublabel="Season participants"
            icon={<ShieldIcon />}
            accentColor="#22C55E"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Your Saved Squads"
            value={userSquads.length}
            sublabel={user ? 'Synced to your account' : 'Sign in to save'}
            icon={<BookmarkIcon />}
            accentColor="#A855F7"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Public Squads"
            value={publicSquads.length}
            sublabel="Shared across community"
            icon={<SportsCricketIcon />}
            accentColor="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((qa) => (
            <Grid key={qa.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                component={Link}
                to={qa.path}
                sx={{
                  display: 'block',
                  height: '100%',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 150ms ease, transform 150ms ease',
                  '&:hover': {
                    borderColor: qa.color,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      bgcolor: `${qa.color}1E`,
                      color: qa.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.75,
                    }}
                  >
                    {qa.icon}
                  </Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                    {qa.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {qa.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Franchises */}
      <Box>
        <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5">
              Participating Franchises ({activeSeason?.name || 'IPL 2025'})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a franchise to launch the squad builder with team branding.
            </Typography>
          </Box>
          <Button component={Link} to="/franchises" size="small" endIcon={<ArrowForwardIcon />}>
            All Franchises
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {participatingTeams.map((team) => (
            <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card
                sx={{
                  height: '100%',
                  borderTop: `3px solid ${team.primaryColor}`,
                  transition: 'border-color 140ms ease',
                  '&:hover': { borderColor: team.primaryColor },
                }}
              >
                <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    <TeamLogo team={team} size={44} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                        {team.shortCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {team.city}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>
                    {team.name}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: team.primaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                    <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: team.secondaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                    {team.titles > 0 && (
                      <Chip size="small" label={`${team.titles} Title${team.titles > 1 ? 's' : ''}`} sx={{ ml: 'auto', height: 20, fontSize: '0.68rem' }} />
                    )}
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      navigate(`/builder?team=${team.id}&season=${activeSeason?.id || selectedSeasonId}`);
                    }}
                    sx={{ borderColor: `${team.primaryColor}66`, color: '#F5F7FA' }}
                  >
                    Build {team.shortCode} Squad
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Squads */}
      <Box>
        <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Recent Squads</Typography>
          <Button component={Link} to="/saved-squads" size="small">
            View Saved Squads
          </Button>
        </Stack>
        {recentSquads.length === 0 ? (
          <Card sx={{ p: 3.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>No squads built yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first custom IPL franchise squad and configure a Playing XI.
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => navigate('/builder')}>
                Create First Squad
              </Button>
            </Stack>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {recentSquads.map((sq) => {
              const team = teamsMap.get(sq.teamId);
              const season = seasonsMap.get(sq.seasonId);
              return (
                <Grid key={sq.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ borderLeft: `3px solid ${team?.primaryColor || '#3B82F6'}` }}>
                    <CardContent sx={{ p: 2.25 }}>
                      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
                        <TeamLogo team={team} size={40} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>{sq.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {team?.shortCode} • {season?.name || sq.seasonId}
                          </Typography>
                        </Box>
                        <Chip size="small" label={`OVR ${sq.ratings.overallRating}`} color="primary" />
                      </Stack>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary" className="tabular-nums">
                          {sq.playerIds.length} Players • Updated {new Date(sq.updatedAt).toLocaleDateString()}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() =>
                            sq.shareSlug && sq.ownerId !== user?.uid
                              ? navigate(`/squad/${sq.shareSlug}`)
                              : navigate(`/builder/${sq.id}`)
                          }
                        >
                          Open
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Stack>
  );
}
