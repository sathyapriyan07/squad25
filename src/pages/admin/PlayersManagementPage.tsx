import { useState } from 'react';
import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
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
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../../hooks/useCatalog';
import { deletePlayer, upsertPlayerFull } from '../../services/dataService';
import { uploadCatalogImage } from '../../services/supabase/storageService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader, SearchInput } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { Player } from '../../types/ipl';

const playerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Player name required'),
  shortName: z.string().min(2, 'Short name required'),
  dob: z.string(),
  nationality: z.string().min(2),
  countryFlag: z.string().min(2).max(4),
  imageUrl: z.string(),
  biography: z.string(),
  primaryRole: z.enum(['WK', 'BAT', 'AR', 'BOWL']),
  battingStyle: z.string().min(2),
  bowlingStyle: z.string().min(2),
  isCapped: z.boolean(),
  isWicketkeeper: z.boolean(),
  isOverseas: z.boolean(),
  overall: z.number().min(0).max(100),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

export function PlayersManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: '',
      shortName: '',
      dob: '1996-05-10',
      nationality: 'India',
      countryFlag: 'IN',
      imageUrl: '',
      biography: '',
      primaryRole: 'BAT',
      battingStyle: 'Right-hand bat',
      bowlingStyle: 'None',
      isCapped: true,
      isWicketkeeper: false,
      isOverseas: false,
      overall: 80,
    },
  });

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const ratingsMap = new Map(catalog.playerRatings.map((r) => [r.playerId, r]));

  const filtered = catalog.players.filter((p) => {
    const q = search.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.nationality.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setImageFile(null);
    reset({
      id: '',
      name: '',
      shortName: '',
      dob: '1996-05-10',
      nationality: 'India',
      countryFlag: 'IN',
      imageUrl: '',
      biography: '',
      primaryRole: 'BAT',
      battingStyle: 'Right-hand bat',
      bowlingStyle: 'None',
      isCapped: true,
      isWicketkeeper: false,
      isOverseas: false,
      overall: 80,
    });
    setOpen(true);
  };

  const openEdit = (p: Player) => {
    setImageFile(null);
    reset({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      dob: p.dob,
      nationality: p.nationality,
      countryFlag: p.countryFlag,
      imageUrl: p.imageUrl || '',
      biography: p.biography,
      primaryRole: p.primaryRole,
      battingStyle: p.battingStyle,
      bowlingStyle: p.bowlingStyle,
      isCapped: p.isCapped,
      isWicketkeeper: p.isWicketkeeper,
      isOverseas: p.isOverseas,
      overall: ratingsMap.get(p.id)?.overall ?? 75,
    });
    setOpen(true);
  };

  const onSubmit = async (vals: PlayerFormValues) => {
    const id = vals.id?.trim() || vals.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSaving(true);
    try {
      const imageUrl = imageFile
        ? await uploadCatalogImage(imageFile, 'players', id)
        : vals.imageUrl || '';
      const player: Player = {
        id,
        name: vals.name,
        shortName: vals.shortName,
        dob: vals.dob,
        nationality: vals.nationality,
        countryFlag: vals.countryFlag.toUpperCase(),
        imageUrl,
        biography: vals.biography,
        primaryRole: vals.primaryRole,
        battingStyle: vals.battingStyle,
        bowlingStyle: vals.bowlingStyle,
        isCapped: vals.isCapped,
        isWicketkeeper: vals.isWicketkeeper,
        isOverseas: vals.isOverseas,
      };
      const existingRatings = ratingsMap.get(id);
      await upsertPlayerFull(player, {
        ...(existingRatings || {
          playerId: id,
          batting: vals.overall,
          powerHitting: vals.overall,
          technique: vals.overall,
          finishing: vals.overall,
          paceBowling: vals.primaryRole === 'BOWL' ? vals.overall : 20,
          spinBowling: 20,
          wicketkeeping: vals.isWicketkeeper ? vals.overall : 0,
          fielding: 75,
        }),
        playerId: id,
        overall: vals.overall,
      });
      await qc.invalidateQueries({ queryKey: ['catalog'] });
      setOpen(false);
      setImageFile(null);
      showSnackbar(`Saved player ${player.name}`, 'success');
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Failed to save player.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePlayer(id);
    await qc.invalidateQueries({ queryKey: ['catalog'] });
    showSnackbar('Player removed', 'info');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Players Master Catalog"
          subtitle="Create, edit, and validate IPL cricketer profiles using Zod-validated forms."
          actions={
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add Player
            </Button>
          }
        />

        <SearchInput value={search} onChange={setSearch} placeholder="Search players by name or nationality..." />

        <Card>
          <TableContainer sx={{ maxHeight: 540 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Nationality</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Origin</TableCell>
                  <TableCell>OVR</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                    <TableCell>{p.nationality}</TableCell>
                    <TableCell><Chip size="small" label={p.primaryRole} /></TableCell>
                    <TableCell>{p.isOverseas ? 'Overseas' : 'Indian'}</TableCell>
                    <TableCell className="tabular-nums">{ratingsMap.get(p.id)?.overall ?? 75}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Player Profile</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Full Name" fullWidth error={Boolean(errors.name)} helperText={errors.name?.message} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="shortName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Short Name (e.g. V. Kohli)" fullWidth error={Boolean(errors.shortName)} helperText={errors.shortName?.message} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Controller
                    name="nationality"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Nationality" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Controller
                    name="countryFlag"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Country Code (IN, AU, GB...)" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Date of Birth" type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Controller
                    name="primaryRole"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Primary Role</InputLabel>
                        <Select {...field} label="Primary Role">
                          <MenuItem value="WK">Wicketkeeper (WK)</MenuItem>
                          <MenuItem value="BAT">Batter (BAT)</MenuItem>
                          <MenuItem value="AR">All-Rounder (AR)</MenuItem>
                          <MenuItem value="BOWL">Bowler (BOWL)</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Controller
                    name="battingStyle"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Batting Style" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="bowlingStyle"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Bowling Style" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Controller
                    name="imageUrl"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Portrait URL (Optional)" fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button component="label" variant="outlined" disabled={saving}>
                      Upload Player Image
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                      />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      {imageFile ? imageFile.name : 'JPG, PNG, WebP, GIF, or SVG; max 5 MB.'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="overall"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} type="number" label="Overall Rating (0-100)" fullWidth onChange={(e) => field.onChange(Number(e.target.value))} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="biography"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Biography" multiline rows={2} fullWidth />}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
                    <Controller name="isCapped" control={control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Capped" />} />
                    <Controller name="isWicketkeeper" control={control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Wicketkeeper" />} />
                    <Controller name="isOverseas" control={control} render={({ field }) => <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Overseas" />} />
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setOpen(false)} color="inherit" disabled={saving}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving...' : 'Save Player'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Stack>
    </AdminLayout>
  );
}
