import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { buildPlayersForSeason } from '../../services/dataService';
import { useCatalog } from '../../hooks/useCatalog';
import {
  useDeleteSquadMutation,
  usePublishShareMutation,
  useSaveSquadMutation,
  useUserSquads,
} from '../../hooks/useSquads';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { ConfirmDialog, EmptyState, LoadingState, PageHeader } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';
import type { CustomSquad, SquadShareSnapshot } from '../../types/ipl';

export function SavedSquadsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const showSnackbar = useAppStore((s) => s.showSnackbar);

  const { catalog } = useCatalog();
  const { data: squads = [], isLoading } = useUserSquads();
  const saveMutation = useSaveSquadMutation();
  const deleteMutation = useDeleteSquadMutation();
  const shareMutation = usePublishShareMutation();

  const [renameTarget, setRenameTarget] = useState<CustomSquad | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CustomSquad | null>(null);

  const teamsMap = useMemo(() => new Map((catalog?.teams || []).map((t) => [t.id, t])), [catalog]);
  const seasonsMap = useMemo(() => new Map((catalog?.seasons || []).map((s) => [s.id, s])), [catalog]);

  if (isLoading) return <LoadingState count={3} />;

  const handleDuplicate = async (sq: CustomSquad) => {
    if (!user) return;
    const now = new Date().toISOString();
    const copy: CustomSquad = {
      ...sq,
      id: `sq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      ownerId: user.uid,
      name: `${sq.name} (Copy)`,
      visibility: 'private',
      shareSlug: undefined,
      createdAt: now,
      updatedAt: now,
    };
    await saveMutation.mutateAsync(copy);
    showSnackbar(`Duplicated "${sq.name}"`, 'success');
  };

  const handleRename = async () => {
    if (!renameTarget || !renameVal.trim()) return;
    await saveMutation.mutateAsync({ ...renameTarget, name: renameVal.trim() });
    setRenameTarget(null);
    showSnackbar('Squad renamed', 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({ squadId: deleteTarget.id, shareSlug: deleteTarget.shareSlug });
    setDeleteTarget(null);
    showSnackbar('Squad deleted', 'info');
  };

  const handleShare = async (sq: CustomSquad) => {
    if (!user || !catalog) return;
    const team = teamsMap.get(sq.teamId);
    const season = seasonsMap.get(sq.seasonId);
    if (!team || !season) return;
    const seasonPlayers = buildPlayersForSeason(catalog, sq.seasonId);
    const playersMap = new Map(seasonPlayers.map((p) => [p.id, p]));
    const squadPlayers = sq.playerIds.map((id) => playersMap.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

    const slug = sq.shareSlug || `${team.shortCode.toLowerCase()}-${sq.id.slice(-8)}`;
    const snapshot: SquadShareSnapshot = {
      shareSlug: slug,
      squadId: sq.id,
      ownerId: user.uid,
      squadName: sq.name,
      seasonId: season.id,
      seasonYear: season.year,
      seasonName: season.name,
      teamId: team.id,
      teamName: team.name,
      teamShortCode: team.shortCode,
      teamPrimaryColor: team.primaryColor,
      teamSecondaryColor: team.secondaryColor,
      playerIds: sq.playerIds,
      playingXiIds: sq.playingXiIds,
      substituteIds: sq.substituteIds,
      captainId: sq.captainId,
      viceCaptainId: sq.viceCaptainId,
      wicketkeeperId: sq.wicketkeeperId,
      impactPlayer: sq.impactPlayer,
      ratings: sq.ratings,
      players: squadPlayers,
      updatedAt: new Date().toISOString(),
    };
    await shareMutation.mutateAsync({ squad: sq, snapshot });
    const url = `${window.location.origin}/squad/${slug}`;
    navigator.clipboard.writeText(url);
    showSnackbar('Public share link copied to clipboard!', 'success');
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Saved Squads"
        subtitle="Manage, duplicate, rename, analyze, or publicly share your custom IPL franchise squads."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/builder')}>
            Build New Squad
          </Button>
        }
      />

      {squads.length === 0 ? (
        <EmptyState
          title="No saved squads found"
          description="Create custom squads for any IPL franchise and season, then return here to duplicate, compare, or share."
          action={<Button variant="contained" onClick={() => navigate('/builder')}>Create Squad</Button>}
        />
      ) : (
        <Grid container spacing={2.5}>
          {squads.map((sq) => {
            const team = teamsMap.get(sq.teamId);
            const season = seasonsMap.get(sq.seasonId);
            return (
              <Grid key={sq.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card sx={{ height: '100%', borderTop: `3px solid ${team?.primaryColor || '#3B82F6'}` }}>
                  <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <TeamLogo team={team} size={46} />
                      <Stack sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" noWrap>{sq.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {team?.name || sq.teamId} • {season?.name || sq.seasonId}
                        </Typography>
                      </Stack>
                      <Chip size="small" label={`OVR ${sq.ratings.overallRating}`} color="primary" />
                    </Stack>

                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      <Chip size="small" label={`${sq.playerIds.length} Players`} variant="outlined" />
                      <Chip size="small" label={`XI: ${sq.playingXiIds.length}/11`} variant="outlined" />
                      <Chip
                        size="small"
                        label={sq.visibility === 'public' ? 'Shared Publicly' : 'Private'}
                        color={sq.visibility === 'public' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Stack>

                    <Typography variant="caption" color="text.secondary" className="tabular-nums">
                      Updated {new Date(sq.updatedAt).toLocaleString()}
                    </Typography>

                    <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 'auto', pt: 1, flexWrap: 'wrap' }}>
                      <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/builder/${sq.id}`)}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<FormatListNumberedIcon />} onClick={() => navigate(`/playing-xi/${sq.id}`)}>
                        XI
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<AnalyticsIcon />} onClick={() => navigate(`/analytics/${sq.id}`)}>
                        Analytics
                      </Button>
                      <Tooltip title="Rename">
                        <IconButton size="small" onClick={() => { setRenameTarget(sq); setRenameVal(sq.name); }}>
                          <DriveFileRenameOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton size="small" onClick={() => handleDuplicate(sq)}>
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share Public Link">
                        <IconButton size="small" color="primary" onClick={() => handleShare(sq)}>
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(sq)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename Squad</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Squad Name"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRenameTarget(null)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleRename}>Save Name</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Squad"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete Squad"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  );
}
