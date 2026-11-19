import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { upsertPlayerEligibility } from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader, SearchInput } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { ActualSquadStatus } from '../../types/ipl';

export function EligibilityManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, activeSeason, isLoading } = useCatalog();
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [search, setSearch] = useState('');
  const seasonId = selectedSeasonId || activeSeason?.id || catalog?.seasons[0]?.id || '';

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  if (!seasonId) {
    return (
      <AdminLayout>
        <Alert
          severity="info"
          action={<Button component={Link} to="/admin/seasons" color="inherit">Add a season</Button>}
        >
          Add a season before assigning player eligibility.
        </Alert>
      </AdminLayout>
    );
  }

  const eligMap = new Map(
    catalog.playerSeasons.filter((ps) => ps.seasonId === seasonId).map((ps) => [ps.playerId, ps])
  );
  const seasonTeams = catalog.teams.filter((t) =>
    catalog.seasonTeams.some((st) => st.seasonId === seasonId && st.teamId === t.id)
  );
  const filtered = catalog.players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const updateRow = async (
    playerId: string,
    patch: { isAvailable?: boolean; actualTeamId?: string | null; actualSquadStatus?: ActualSquadStatus; isOverseas?: boolean }
  ) => {
    const current = eligMap.get(playerId);
    const player = catalog.players.find((p) => p.id === playerId)!;
    await upsertPlayerEligibility({
      id: current?.id || `${playerId}_${seasonId}`,
      playerId,
      seasonId,
      actualTeamId: patch.actualTeamId !== undefined ? patch.actualTeamId : (current?.actualTeamId ?? null),
      isAvailable: patch.isAvailable !== undefined ? patch.isAvailable : (current?.isAvailable ?? true),
      actualSquadStatus: patch.actualSquadStatus ?? current?.actualSquadStatus ?? 'Active',
      isOverseasSnapshot: patch.isOverseas ?? current?.isOverseasSnapshot ?? player.isOverseas,
    });
    void qc.invalidateQueries({ queryKey: ['catalog'] });
    showSnackbar('Season eligibility updated', 'success');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Season Player Eligibility"
          subtitle="Assign player availability, actual IPL franchise snapshot, and status per season."
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Season</InputLabel>
            <Select label="Season" value={seasonId} onChange={(e) => setSelectedSeasonId(e.target.value)}>
              {catalog.seasons.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <SearchInput value={search} onChange={setSearch} placeholder="Search players..." />
        </Stack>

        <Card>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell>Eligible</TableCell>
                  <TableCell>Actual Franchise</TableCell>
                  <TableCell>Squad Status</TableCell>
                  <TableCell>Origin Snapshot</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => {
                  const elig = eligMap.get(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={elig?.isAvailable ?? true}
                          onChange={(e) => updateRow(p.id, { isAvailable: e.target.checked, isOverseas: p.isOverseas })}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={elig?.actualTeamId || ''}
                          displayEmpty
                          onChange={(e) => updateRow(p.id, { actualTeamId: e.target.value || null })}
                          sx={{ minWidth: 140, fontSize: '0.8rem' }}
                        >
                          <MenuItem value="">Available Pool</MenuItem>
                          {seasonTeams.map((t) => (
                            <MenuItem key={t.id} value={t.id}>{t.shortCode}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={elig?.actualSquadStatus || 'Active'}
                          onChange={(e) => updateRow(p.id, { actualSquadStatus: e.target.value as ActualSquadStatus })}
                          sx={{ minWidth: 130, fontSize: '0.8rem' }}
                        >
                          {['Active', 'Injured', 'Withdrawn', 'Replacement', 'Available Pool'].map((st) => (
                            <MenuItem key={st} value={st}>{st}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={(elig?.isOverseasSnapshot ?? p.isOverseas) ? 'Overseas' : 'Indian'} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>
    </AdminLayout>
  );
}
