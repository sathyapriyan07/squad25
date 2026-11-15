import { useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Slider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../../hooks/useCatalog';
import { upsertPlayerRatings } from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader, SearchInput } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { PlayerRatings } from '../../types/ipl';

export function RatingsManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PlayerRatings | null>(null);

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const ratingsMap = new Map(catalog.playerRatings.map((r) => [r.playerId, r]));
  const filtered = catalog.players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (playerId: string) => {
    setEditing(
      ratingsMap.get(playerId) || {
        playerId,
        batting: 60,
        powerHitting: 60,
        technique: 60,
        finishing: 60,
        paceBowling: 0,
        spinBowling: 0,
        wicketkeeping: 0,
        fielding: 70,
        overall: 65,
      }
    );
  };

  const handleSave = async () => {
    if (!editing) return;
    await upsertPlayerRatings(editing);
    await qc.invalidateQueries({ queryKey: ['catalog'] });
    setEditing(null);
    showSnackbar('Player ratings updated!', 'success');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Player Attribute Ratings (0–100)"
          subtitle="Configure attribute scores used by the Team Strength and Comparison engines."
        />

        <SearchInput value={search} onChange={setSearch} placeholder="Filter players..." />

        <Card>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">OVR</TableCell>
                  <TableCell align="right">BAT</TableCell>
                  <TableCell align="right">POW</TableCell>
                  <TableCell align="right">FIN</TableCell>
                  <TableCell align="right">PACE</TableCell>
                  <TableCell align="right">SPIN</TableCell>
                  <TableCell align="right">WK</TableCell>
                  <TableCell align="right">FLD</TableCell>
                  <TableCell align="right">Edit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => {
                  const r = ratingsMap.get(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell align="right" className="tabular-nums" sx={{ fontWeight: 700 }}>{r?.overall ?? 65}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.batting ?? 60}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.powerHitting ?? 60}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.finishing ?? 60}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.paceBowling ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.spinBowling ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.wicketkeeping ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{r?.fielding ?? 70}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(p.id)}><EditIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Player Attribute Ratings</DialogTitle>
          <DialogContent>
            {editing && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {(
                  [
                    ['overall', 'Overall Rating'],
                    ['batting', 'Batting'],
                    ['powerHitting', 'Power Hitting'],
                    ['technique', 'Technique'],
                    ['finishing', 'Finishing'],
                    ['paceBowling', 'Pace Bowling'],
                    ['spinBowling', 'Spin Bowling'],
                    ['wicketkeeping', 'Wicketkeeping'],
                    ['fielding', 'Fielding'],
                  ] as Array<[keyof PlayerRatings, string]>
                ).map(([key, label]) => (
                  <Grid key={key} size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                      <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 700 }}>{editing[key] as number}</Typography>
                    </Stack>
                    <Slider
                      size="small"
                      min={0}
                      max={100}
                      value={editing[key] as number}
                      onChange={(_, v) => setEditing({ ...editing, [key]: v as number })}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditing(null)} color="inherit">Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save Ratings</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AdminLayout>
  );
}
