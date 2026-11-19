import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { upsertSeasonRule } from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { SeasonRule } from '../../types/ipl';

export function RulesManagementPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, activeSeason, isLoading } = useCatalog();
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [ruleForm, setRuleForm] = useState<SeasonRule | null>(null);
  const seasonId = selectedSeasonId || activeSeason?.id || catalog?.seasons[0]?.id || '';

  useEffect(() => {
    if (!catalog || !seasonId) {
      setRuleForm(null);
      return;
    }
    const found = catalog.seasonRules.find((r) => r.seasonId === seasonId);
    setRuleForm(
      found || {
        seasonId,
        minSquadSize: 18,
        maxSquadSize: 25,
        maxOverseas: 8,
        playingXiSize: 11,
        maxOverseasInXi: 4,
        minIndianPlayers: 10,
        impactPlayerEnabled: true,
        maxSubstitutes: 5,
        notes: '',
      }
    );
  }, [catalog, seasonId]);

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  if (!seasonId) {
    return (
      <AdminLayout>
        <Alert
          severity="info"
          action={<Button component={Link} to="/admin/seasons" color="inherit">Add a season</Button>}
        >
          Add a season before configuring squad rules.
        </Alert>
      </AdminLayout>
    );
  }

  if (!ruleForm) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const handleSave = async () => {
    await upsertSeasonRule(ruleForm);
    void qc.invalidateQueries({ queryKey: ['catalog'] });
    showSnackbar('Season squad rules saved!', 'success');
  };

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Configurable Season Squad Rules"
          subtitle="Configure squad limits, overseas caps, Playing XI size, and Impact Player regulations per IPL season."
          actions={
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
              Save Rules
            </Button>
          }
        />

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Season</InputLabel>
                  <Select label="Select Season" value={seasonId} onChange={(e) => setSelectedSeasonId(e.target.value)}>
                    {catalog.seasons.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={ruleForm.impactPlayerEnabled}
                      onChange={(e) => setRuleForm({ ...ruleForm, impactPlayerEnabled: e.target.checked })}
                    />
                  }
                  label="Impact Player Rule Enabled"
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth type="number" label="Min Squad Size" value={ruleForm.minSquadSize} onChange={(e) => setRuleForm({ ...ruleForm, minSquadSize: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth type="number" label="Max Squad Size" value={ruleForm.maxSquadSize} onChange={(e) => setRuleForm({ ...ruleForm, maxSquadSize: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth type="number" label="Max Overseas (Squad)" value={ruleForm.maxOverseas} onChange={(e) => setRuleForm({ ...ruleForm, maxOverseas: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField fullWidth type="number" label="Min Indian Players" value={ruleForm.minIndianPlayers} onChange={(e) => setRuleForm({ ...ruleForm, minIndianPlayers: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField fullWidth type="number" label="Playing XI Size" value={ruleForm.playingXiSize} onChange={(e) => setRuleForm({ ...ruleForm, playingXiSize: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField fullWidth type="number" label="Max Overseas in XI" value={ruleForm.maxOverseasInXi} onChange={(e) => setRuleForm({ ...ruleForm, maxOverseasInXi: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField fullWidth type="number" label="Max Substitutes" value={ruleForm.maxSubstitutes} onChange={(e) => setRuleForm({ ...ruleForm, maxSubstitutes: Number(e.target.value) })} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth multiline rows={2} label="Rule Notes" value={ruleForm.notes || ''} onChange={(e) => setRuleForm({ ...ruleForm, notes: e.target.value })} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>
    </AdminLayout>
  );
}
