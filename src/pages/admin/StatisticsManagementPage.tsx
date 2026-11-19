import { useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../../hooks/useCatalog';
import { upsertPlayerStatistics } from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader, SearchInput } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { PlayerStatistics } from '../../types/ipl';

export function StatisticsManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();
  const [scopeFilter, setScopeFilter] = useState<'career' | string>('career');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PlayerStatistics | null>(null);

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const statsMap = new Map(
    catalog.playerStats
      .filter((s) => (scopeFilter === 'career' ? s.scope === 'career' : s.scope === 'season' && s.seasonId === scopeFilter))
      .map((s) => [s.playerId, s])
  );

  const filtered = catalog.players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openEdit = (playerId: string) => {
    const existing = statsMap.get(playerId);
    setEditing(
      existing || {
        id: scopeFilter === 'career' ? `${playerId}_career` : `${playerId}_${scopeFilter}`,
        playerId,
        seasonId: scopeFilter,
        scope: scopeFilter === 'career' ? 'career' : 'season',
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
      }
    );
  };

  const handleSave = async () => {
    if (!editing) return;
    await upsertPlayerStatistics(editing);
    void qc.invalidateQueries({ queryKey: ['catalog'] });
    setEditing(null);
    showSnackbar('Player statistics saved!', 'success');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Player Statistics Management"
          subtitle="Maintain separate IPL career and season-wise batting, bowling, and fielding statistics."
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search player..." />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Scope</InputLabel>
            <Select label="Scope" value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
              <MenuItem value="career">IPL Career Totals</MenuItem>
              {catalog.seasons.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name} Season Stats</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Card>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">Matches</TableCell>
                  <TableCell align="right">Runs</TableCell>
                  <TableCell align="right">Avg</TableCell>
                  <TableCell align="right">SR</TableCell>
                  <TableCell align="right">Wickets</TableCell>
                  <TableCell align="right">Econ</TableCell>
                  <TableCell align="right">Catches</TableCell>
                  <TableCell align="right">Edit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => {
                  const st = statsMap.get(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.matches ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.runs ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.battingAverage ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.strikeRate ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.wickets ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.economy ?? 0}</TableCell>
                      <TableCell align="right" className="tabular-nums">{st?.catches ?? 0}</TableCell>
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

        <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Statistics</DialogTitle>
          <DialogContent>
            {editing && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {(
                  [
                    ['matches', 'Matches'],
                    ['inningsBat', 'Bat Innings'],
                    ['runs', 'Runs'],
                    ['battingAverage', 'Bat Avg'],
                    ['strikeRate', 'Strike Rate'],
                    ['centuries', '100s'],
                    ['halfCenturies', '50s'],
                    ['fours', 'Fours'],
                    ['sixes', 'Sixes'],
                    ['inningsBowl', 'Bowl Innings'],
                    ['overs', 'Overs'],
                    ['runsConceded', 'Runs Conceded'],
                    ['wickets', 'Wickets'],
                    ['economy', 'Economy'],
                    ['bowlingAverage', 'Bowl Avg'],
                    ['fiveWicketHauls', '5W Hauls'],
                    ['catches', 'Catches'],
                    ['runOuts', 'Run-outs'],
                    ['stumpings', 'Stumpings'],
                  ] as Array<[keyof PlayerStatistics, string]>
                ).map(([key, label]) => (
                  <Grid key={key} size={{ xs: 6, sm: 3 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={label}
                      value={editing[key] as number}
                      onChange={(e) => setEditing({ ...editing, [key]: Number(e.target.value) })}
                    />
                  </Grid>
                ))}
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField fullWidth size="small" label="Highest Score" value={editing.highestScore} onChange={(e) => setEditing({ ...editing, highestScore: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField fullWidth size="small" label="Best Bowling" value={editing.bestBowling} onChange={(e) => setEditing({ ...editing, bestBowling: e.target.value })} />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditing(null)} color="inherit">Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save Statistics</Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AdminLayout>
  );
}
