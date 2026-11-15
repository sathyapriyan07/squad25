import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import {
  usePublishShareMutation,
  useSaveSquadMutation,
  useSquadById,
} from '../../hooks/useSquads';
import { calculateTeamRatings } from '../../services/ratings/ratingEngine';
import {
  validatePlayerAddition,
  validateSquadAndXI,
} from '../../services/validation/validationEngine';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { useSquadStore } from '../../store/squadStore';
import { LoadingState, SearchInput } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';
import { PlayerGrid } from '../../components/players/player-grid';
import { SquadOverview } from '../../components/squad/SquadOverview';
import type { PlayerWithDetails, SquadShareSnapshot, ValidationIssue } from '../../types/ipl';

type FilterMode = 'ALL' | 'WK' | 'BAT' | 'AR' | 'BOWL' | 'IND' | 'OS' | 'CAP' | 'UNCAP';
type SortMode = 'overall' | 'name' | 'batting' | 'bowling' | 'runs' | 'wickets';

const FILTER_OPTIONS: Array<[FilterMode, string]> = [
  ['ALL', 'All players'],
  ['WK', 'Wicketkeepers'],
  ['BAT', 'Batters'],
  ['AR', 'All-rounders'],
  ['BOWL', 'Bowlers'],
  ['IND', 'Indian'],
  ['OS', 'Overseas'],
  ['CAP', 'Capped'],
  ['UNCAP', 'Uncapped'],
];

export function SquadBuilderPage() {
  const { squadId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const user = useAuthStore((s) => s.user);
  const { selectedSeasonId, selectedTeamId, setSelectedSeasonId, setSelectedTeamId, showSnackbar } =
    useAppStore();

  const {
    draft,
    initNewDraft,
    loadSquad,
    setName,
    setTeamAndSeason,
    addPlayer,
    removePlayer,
    reorderPlayers,
    setRatings,
    markClean,
  } = useSquadStore();

  const { data: loadedSquad, isLoading: loadingExisting } = useSquadById(squadId);

  const effectiveSeasonId = squadId && loadedSquad ? loadedSquad.seasonId : draft.seasonId || selectedSeasonId;
  const { catalog, activeSeason, activeRule, participatingTeams, seasonPlayers, isLoading } =
    useCatalog(effectiveSeasonId);

  const saveMutation = useSaveSquadMutation();
  const shareMutation = usePublishShareMutation();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('ALL');
  const [sortBy, setSortBy] = useState<SortMode>('overall');
  const [page, setPage] = useState(1);
  const [mobileTab, setMobileTab] = useState(0);
  const [invalidDialog, setInvalidDialog] = useState<ValidationIssue | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Initialize draft from URL or existing squad
  useEffect(() => {
    if (!catalog || !user) return;
    if (squadId && loadedSquad) {
      loadSquad(loadedSquad);
      setSelectedSeasonId(loadedSquad.seasonId);
      setSelectedTeamId(loadedSquad.teamId);
    } else if (!squadId) {
      const qTeam = searchParams.get('team') || selectedTeamId || catalog.teams[0]?.id;
      const qSeason = searchParams.get('season') || selectedSeasonId || activeSeason?.id || catalog.seasons[0]?.id;
      const teamObj = catalog.teams.find((t) => t.id === qTeam) || catalog.teams[0];
      if (!teamObj || !qSeason) return;
      if (!draft.ownerId || draft.id.startsWith('sq_') === false || (searchParams.get('team') && draft.teamId !== qTeam)) {
        initNewDraft({
          ownerId: user.uid,
          seasonId: qSeason,
          teamId: teamObj.id,
          teamShortCode: teamObj.shortCode,
        });
      } else if (draft.ownerId !== user.uid) {
        initNewDraft({
          ownerId: user.uid,
          seasonId: qSeason,
          teamId: teamObj.id,
          teamShortCode: teamObj.shortCode,
        });
      }
    }
  }, [
    activeSeason,
    catalog,
    draft.id,
    draft.ownerId,
    draft.teamId,
    initNewDraft,
    loadSquad,
    loadedSquad,
    searchParams,
    selectedSeasonId,
    selectedTeamId,
    setSelectedSeasonId,
    setSelectedTeamId,
    squadId,
    user,
  ]);

  const activeTeam = useMemo(
    () =>
      participatingTeams.find((t) => t.id === draft.teamId) ||
      catalog?.teams.find((t) => t.id === draft.teamId) ||
      participatingTeams[0],
    [participatingTeams, catalog, draft.teamId]
  );

  const accentColor = activeTeam?.primaryColor || '#3B82F6';

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

  const squadPlayerObjects = useMemo(
    () =>
      draft.playerIds
        .map((id) => playersMap.get(id))
        .filter((p): p is PlayerWithDetails => Boolean(p)),
    [draft.playerIds, playersMap]
  );

  const liveRatings = useMemo(
    () => calculateTeamRatings(squadPlayerObjects),
    [squadPlayerObjects]
  );

  useEffect(() => {
    if (liveRatings.overallRating !== draft.ratings.overallRating) {
      setRatings(liveRatings);
    }
  }, [liveRatings]);

  const validation = useMemo(() => {
    if (!activeRule) {
      return {
        status: 'Incomplete' as const,
        isValidSquad: false,
        isValidXi: false,
        hardErrors: [],
        warnings: [],
        counts: { total: 0, indian: 0, overseas: 0, wk: 0, bat: 0, ar: 0, bowl: 0, xiTotal: 0, xiOverseas: 0 },
      };
    }
    return validateSquadAndXI(draft, playersMap, eligibilityMap, activeRule);
  }, [draft, playersMap, eligibilityMap, activeRule]);

  const filteredDatabase = useMemo(() => {
    const q = search.trim().toLowerCase();
    return seasonPlayers
      .filter((p) => {
        if (filter === 'WK' && p.primaryRole !== 'WK' && !p.isWicketkeeper) return false;
        if (filter === 'BAT' && p.primaryRole !== 'BAT') return false;
        if (filter === 'AR' && p.primaryRole !== 'AR') return false;
        if (filter === 'BOWL' && p.primaryRole !== 'BOWL') return false;
        if (filter === 'IND' && p.isOverseas) return false;
        if (filter === 'OS' && !p.isOverseas) return false;
        if (filter === 'CAP' && !p.isCapped) return false;
        if (filter === 'UNCAP' && p.isCapped) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q) ||
          p.primaryRole.toLowerCase().includes(q) ||
          p.previousTeams.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Eligible first
        const aAvail = a.eligibility?.isAvailable === false ? 0 : 1;
        const bAvail = b.eligibility?.isAvailable === false ? 0 : 1;
        if (aAvail !== bAvail) return bAvail - aAvail;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'batting') return b.ratings.batting - a.ratings.batting;
        if (sortBy === 'bowling')
          return (
            Math.max(b.ratings.paceBowling, b.ratings.spinBowling) -
            Math.max(a.ratings.paceBowling, a.ratings.spinBowling)
          );
        if (sortBy === 'runs') return b.careerStats.runs - a.careerStats.runs;
        if (sortBy === 'wickets') return b.careerStats.wickets - a.careerStats.wickets;
        return b.ratings.overall - a.ratings.overall;
      });
  }, [seasonPlayers, search, filter, sortBy]);

  const pageSize = 9;

  const handleAddPlayer = (player: PlayerWithDetails) => {
    if (!activeRule) return;
    const check = validatePlayerAddition(player, draft.playerIds, playersMap, eligibilityMap, activeRule);
    if (!check.valid && check.issue) {
      setInvalidDialog(check.issue);
      return;
    }
    const nextPlayers = [...squadPlayerObjects, player];
    const nextRatings = calculateTeamRatings(nextPlayers);
    addPlayer(player.id, nextRatings);
    showSnackbar(`${player.shortName} added to squad`, 'success');
  };

  const handleRemovePlayer = (playerId: string) => {
    const p = playersMap.get(playerId);
    const nextPlayers = squadPlayerObjects.filter((item) => item.id !== playerId);
    const nextRatings = calculateTeamRatings(nextPlayers);
    removePlayer(playerId, nextRatings);
    if (p) showSnackbar(`${p.shortName} removed from squad`, 'info');
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= draft.playerIds.length) return;
    const next = [...draft.playerIds];
    [next[index], next[target]] = [next[target], next[index]];
    reorderPlayers(next);
  };

  const handleSave = async () => {
    if (!user) return;
    const payload = {
      ...draft,
      ownerId: user.uid,
      ratings: liveRatings,
    };
    const saved = await saveMutation.mutateAsync(payload);
    markClean(saved);
    showSnackbar(`Saved ${saved.name}`, 'success');
    if (!squadId) {
      navigate(`/builder/${saved.id}`, { replace: true });
    }
    return saved;
  };

  const handleShare = async () => {
    if (!user || !activeTeam || !activeSeason) return;
    const saved = await handleSave();
    if (!saved) return;
    const slug = saved.shareSlug || `${activeTeam.shortCode.toLowerCase()}-${saved.id.slice(-8)}`;
    const snapshot: SquadShareSnapshot = {
      shareSlug: slug,
      squadId: saved.id,
      ownerId: user.uid,
      squadName: saved.name,
      seasonId: activeSeason.id,
      seasonYear: activeSeason.year,
      seasonName: activeSeason.name,
      teamId: activeTeam.id,
      teamName: activeTeam.name,
      teamShortCode: activeTeam.shortCode,
      teamPrimaryColor: activeTeam.primaryColor,
      teamSecondaryColor: activeTeam.secondaryColor,
      playerIds: saved.playerIds,
      playingXiIds: saved.playingXiIds,
      substituteIds: saved.substituteIds,
      captainId: saved.captainId,
      viceCaptainId: saved.viceCaptainId,
      wicketkeeperId: saved.wicketkeeperId,
      impactPlayer: saved.impactPlayer,
      ratings: liveRatings,
      players: squadPlayerObjects,
      updatedAt: new Date().toISOString(),
    };
    const updated = await shareMutation.mutateAsync({ squad: saved, snapshot });
    markClean(updated);
    const fullUrl = `${window.location.origin}/squad/${slug}`;
    setShareUrl(fullUrl);
    showSnackbar('Share link ready', 'success');
  };

  const handleGoToPlayingXI = async () => {
    const saved = await handleSave();
    if (saved) {
      navigate(`/playing-xi/${saved.id}`);
    }
  };

  if (isLoading || (squadId && loadingExisting) || !catalog) {
    return <LoadingState count={4} />;
  }

  if (!activeSeason || !activeRule || participatingTeams.length === 0) {
    return (
      <Alert severity="info">
        Catalog data is not ready for squad building. An administrator must add a season, participating franchises, players, and squad rules.
      </Alert>
    );
  }

  const playerDatabasePane = (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Search players"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  label="Filter"
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value as FilterMode);
                    setPage(1);
                  }}
                >
                  {FILTER_OPTIONS.map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  label="Sort by"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortMode)}
                >
                  <MenuItem value="overall">Rating</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="batting">Batting</MenuItem>
                  <MenuItem value="bowling">Bowling</MenuItem>
                  <MenuItem value="runs">Runs</MenuItem>
                  <MenuItem value="wickets">Wickets</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <PlayerGrid
        players={filteredDatabase}
        selectedPlayerIds={draft.playerIds}
        onSelect={handleAddPlayer}
        onRemove={(player) => handleRemovePlayer(player.id)}
        onViewDetails={(player) =>
          navigate(
            `/players/${player.id}?season=${effectiveSeasonId}&from=builder${squadId ? `&squadId=${squadId}` : ''}`
          )
        }
        accentColor={accentColor}
        columns={{ xs: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyTitle="No players match your filters"
        emptyDescription="Try a different search or selection filter."
      />
    </Stack>
  );

  return (
    <Stack spacing={2} sx={{ pb: isMobile ? 7 : 0 }}>
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TeamLogo team={activeTeam} size={40} />
                <TextField
                  label="Squad name"
                  size="small"
                  fullWidth
                  value={draft.name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Season</InputLabel>
                <Select
                  label="Season"
                  value={draft.seasonId}
                  onChange={(event) => {
                    const nextSeason = event.target.value;
                    setSelectedSeasonId(nextSeason);
                    setTeamAndSeason(draft.teamId, nextSeason);
                  }}
                >
                  {catalog.seasons.map((season) => (
                    <MenuItem key={season.id} value={season.id}>{season.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Franchise</InputLabel>
                <Select
                  label="Franchise"
                  value={activeTeam?.id || draft.teamId}
                  onChange={(event) => {
                    const nextTeam = event.target.value;
                    setSelectedTeamId(nextTeam);
                    setTeamAndSeason(nextTeam, draft.seasonId);
                  }}
                >
                  {participatingTeams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>{team.shortCode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saveMutation.isPending}
                  onClick={handleSave}
                  sx={{ bgcolor: accentColor, flex: { xs: 1, md: 'initial' } }}
                >
                  {saveMutation.isPending ? 'Saving' : 'Save'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  disabled={shareMutation.isPending || draft.playerIds.length === 0}
                  onClick={handleShare}
                  sx={{ flex: { xs: 1, md: 'initial' } }}
                >
                  Share
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isMobile ? (
        <>
          <Tabs value={mobileTab} onChange={(_, value) => setMobileTab(value)} variant="fullWidth">
            <Tab label={`Players · ${filteredDatabase.length}`} />
            <Tab label={`Squad · ${draft.playerIds.length}`} />
          </Tabs>
          {mobileTab === 0 ? (
            playerDatabasePane
          ) : (
            <SquadOverview
              players={squadPlayerObjects}
              validation={validation}
              ratings={liveRatings}
              rule={activeRule}
              onRemovePlayer={handleRemovePlayer}
              onMovePlayer={handleMovePlayer}
              onGoToPlayingXI={handleGoToPlayingXI}
            />
          )}
        </>
      ) : (
        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ lg: 8, xl: 8 }}>
            {playerDatabasePane}
          </Grid>
          <Grid size={{ lg: 4, xl: 4 }} sx={{ position: 'sticky', top: 80 }}>
            <SquadOverview
              players={squadPlayerObjects}
              validation={validation}
              ratings={liveRatings}
              rule={activeRule}
              onRemovePlayer={handleRemovePlayer}
              onMovePlayer={handleMovePlayer}
              onGoToPlayingXI={handleGoToPlayingXI}
            />
          </Grid>
        </Grid>
      )}

      <Dialog open={Boolean(invalidDialog)} onClose={() => setInvalidDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Player not added</DialogTitle>
        <DialogContent>
          {invalidDialog && (
            <Stack spacing={1.5}>
              <Alert severity="error">{invalidDialog.message}</Alert>
              <Typography variant="body2" color="text.secondary">
                {invalidDialog.suggestedResolution}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setInvalidDialog(null)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(shareUrl)} onClose={() => setShareUrl(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Share squad</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Anyone with this link can view the squad.
            </Typography>
            <TextField fullWidth size="small" value={shareUrl || ''} slotProps={{ input: { readOnly: true } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setShareUrl(null)} color="inherit">Close</Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (shareUrl) {
                navigator.clipboard.writeText(shareUrl);
                showSnackbar('Share link copied', 'success');
              }
            }}
          >
            Copy link
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (shareUrl) {
                const slug = shareUrl.split('/squad/')[1];
                setShareUrl(null);
                navigate(`/squad/${slug}`);
              }
            }}
          >
            Open share page
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
