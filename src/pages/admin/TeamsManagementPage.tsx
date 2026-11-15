import { useState } from 'react';
import {
  Box,
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
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../../hooks/useCatalog';
import { deleteTeam, upsertTeam } from '../../services/dataService';
import { uploadCatalogImage } from '../../services/supabase/storageService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';
import { AdminLayout } from './AdminLayout';
import type { Team } from '../../types/ipl';

export function TeamsManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();

  const [open, setOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Team>({
    id: '',
    name: '',
    shortCode: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#0F172A',
    city: '',
    titles: 0,
    isActive: true,
    logoUrl: '',
  });

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const handleSave = async () => {
    const id = form.id.trim() || form.shortCode.toLowerCase();
    setSaving(true);
    try {
      const logoUrl = logoFile
        ? await uploadCatalogImage(logoFile, 'teams', id)
        : form.logoUrl || '';
      await upsertTeam({ ...form, id, logoUrl });
      await qc.invalidateQueries({ queryKey: ['catalog'] });
      setOpen(false);
      setLogoFile(null);
      showSnackbar(`Saved franchise ${form.name}`, 'success');
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Failed to save franchise.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteTeam(id);
    await qc.invalidateQueries({ queryKey: ['catalog'] });
    showSnackbar('Franchise deleted', 'info');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Franchises Management"
          subtitle="Manage IPL franchise identities, logos, and official brand colours."
          actions={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setLogoFile(null);
                setForm({ id: '', name: '', shortCode: '', primaryColor: '#3B82F6', secondaryColor: '#111827', city: '', titles: 0, isActive: true, logoUrl: '' });
                setOpen(true);
              }}
            >
              Add Franchise
            </Button>
          }
        />

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Franchise</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Colours</TableCell>
                  <TableCell>Titles</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalog.teams.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <TeamLogo team={t} size={34} />
                        <span>{t.name}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t.shortCode}</TableCell>
                    <TableCell>{t.city}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75}>
                        <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: t.primaryColor }} />
                        <Box sx={{ width: 18, height: 18, borderRadius: '4px', bgcolor: t.secondaryColor }} />
                      </Stack>
                    </TableCell>
                    <TableCell className="tabular-nums">{t.titles}</TableCell>
                    <TableCell>
                      <Chip size="small" label={t.isActive ? 'Active' : 'Historical'} color={t.isActive ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => { setLogoFile(null); setForm(t); setOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Franchise Details</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Franchise Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Stack direction="row" spacing={2}>
                <TextField label="Short Code" fullWidth value={form.shortCode} onChange={(e) => setForm({ ...form, shortCode: e.target.value.toUpperCase() })} />
                <TextField label="City" fullWidth value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField label="Primary Colour (Hex)" fullWidth value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
                <TextField label="Secondary Colour (Hex)" fullWidth value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
              </Stack>
              <TextField label="Logo URL (Optional)" fullWidth value={form.logoUrl || ''} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Button component="label" variant="outlined" disabled={saving}>
                  Upload Team Logo
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {logoFile ? logoFile.name : 'JPG, PNG, WebP, GIF, or SVG; max 5 MB.'}
                </Typography>
              </Stack>
              <TextField label="IPL Titles" type="number" fullWidth value={form.titles} onChange={(e) => setForm({ ...form, titles: Number(e.target.value) })} />
              <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Currently Active Franchise" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setOpen(false)} color="inherit" disabled={saving}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Franchise'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AdminLayout>
  );
}
