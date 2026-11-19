import { useState } from 'react';
import {
  Autocomplete,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../../hooks/useCatalog';
import { deleteSeason, upsertSeason } from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { Season, Team } from '../../types/ipl';

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Failed to save season.';
}

export function SeasonsManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [form, setForm] = useState<Season>({
    id: '',
    year: 2028,
    name: 'IPL 2028',
    startDate: '2028-03-20',
    endDate: '2028-05-24',
    impactPlayerEnabled: true,
    isActive: true,
  });
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const openCreate = () => {
    const existingYears = new Set(catalog.seasons.map((season) => season.year));
    let year = new Date().getFullYear();
    while (existingYears.has(year)) year += 1;

    setEditingSeasonId(null);
    setForm({
      id: '',
      year,
      name: `IPL ${year}`,
      startDate: `${year}-03-20`,
      endDate: `${year}-05-25`,
      impactPlayerEnabled: true,
      isActive: true,
    });
    setSelectedTeams(catalog.teams.filter((t) => t.isActive));
    setOpen(true);
  };

  const openEdit = (season: Season) => {
    setEditingSeasonId(season.id);
    setForm(season);
    const linkedIds = new Set(
      catalog.seasonTeams.filter((st) => st.seasonId === season.id).map((st) => st.teamId)
    );
    setSelectedTeams(catalog.teams.filter((t) => linkedIds.has(t.id)));
    setOpen(true);
  };

  const handleSave = async () => {
    const id = editingSeasonId || `ipl-${form.year}`;
    if (!form.name.trim()) {
      showSnackbar('Season name is required.', 'warning');
      return;
    }
    if (!Number.isInteger(form.year) || form.year < 2008) {
      showSnackbar('Enter a valid season year (2008 or later).', 'warning');
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      showSnackbar('End date must be on or after the start date.', 'warning');
      return;
    }

    const duplicateYear = catalog.seasons.find(
      (season) => season.year === form.year && season.id !== editingSeasonId
    );
    if (duplicateYear) {
      showSnackbar(`IPL ${form.year} already exists. Edit that season instead.`, 'error');
      return;
    }
    const duplicateId = catalog.seasons.find(
      (season) => season.id === id && season.id !== editingSeasonId
    );
    if (duplicateId) {
      showSnackbar(`Season ID "${id}" is already in use.`, 'error');
      return;
    }

    setSaving(true);
    try {
      await upsertSeason(
        { ...form, id, name: form.name.trim() },
        catalog.seasonRules.find((r) => r.seasonId === id) || {
        seasonId: id,
        minSquadSize: 18,
        maxSquadSize: 25,
        maxOverseas: 8,
        playingXiSize: 11,
        maxOverseasInXi: 4,
        minIndianPlayers: 10,
        impactPlayerEnabled: form.impactPlayerEnabled,
        maxSubstitutes: 5,
        },
        selectedTeams.map((t) => t.id)
      );
      void qc.invalidateQueries({ queryKey: ['catalog'] });
      setOpen(false);
      showSnackbar(`Saved season ${form.name}`, 'success');
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteSeason(id);
    void qc.invalidateQueries({ queryKey: ['catalog'] });
    showSnackbar('Season deleted', 'info');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Seasons Management"
          subtitle="Configure IPL seasons, participating franchises, and Impact Player status."
          actions={
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add Season
            </Button>
          }
        />

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Season</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Teams</TableCell>
                  <TableCell>Impact Player</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalog.seasons.map((s) => {
                  const count = catalog.seasonTeams.filter((st) => st.seasonId === s.id).length;
                  return (
                    <TableRow key={s.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{s.name}</TableCell>
                      <TableCell className="tabular-nums">{s.year}</TableCell>
                      <TableCell className="tabular-nums">{s.startDate} → {s.endDate}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        <Chip size="small" label={s.impactPlayerEnabled ? 'Enabled' : 'Disabled'} color={s.impactPlayerEnabled ? 'info' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={s.isActive ? 'Active' : 'Inactive'} color={s.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={open} onClose={() => !saving && setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Season Configuration</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Season Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                label="Year"
                type="number"
                fullWidth
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              />
              <Stack direction="row" spacing={2}>
                <TextField label="Start Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                <TextField label="End Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </Stack>
              <Autocomplete
                multiple
                options={catalog.teams}
                value={selectedTeams}
                onChange={(_, v) => setSelectedTeams(v)}
                getOptionLabel={(o) => `${o.shortCode} — ${o.name}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => <TextField {...params} label="Participating Franchises" />}
              />
              <FormControlLabel
                control={<Switch checked={form.impactPlayerEnabled} onChange={(e) => setForm({ ...form, impactPlayerEnabled: e.target.checked })} />}
                label="Impact Player Regulation Enabled"
              />
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                label="Season Active"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setOpen(false)} color="inherit" disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Season'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AdminLayout>
  );
}
