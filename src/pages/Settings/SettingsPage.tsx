import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useCatalog } from '../../hooks/useCatalog';
import { useAppStore } from '../../store/appStore';
import { PageHeader } from '../../components/common/CommonUi';

export function SettingsPage() {
  const { catalog } = useCatalog();
  const { selectedSeasonId, selectedTeamId, setSelectedSeasonId, setSelectedTeamId, showSnackbar } =
    useAppStore();

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <PageHeader
        title="Application Settings"
        subtitle="Configure default season and active franchise accent branding across your workspace."
      />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel>Default IPL Season</InputLabel>
              <Select
                label="Default IPL Season"
                value={selectedSeasonId}
                onChange={(e) => {
                  setSelectedSeasonId(e.target.value);
                  showSnackbar('Default season updated', 'info');
                }}
              >
                {(catalog?.seasons || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Active Franchise Accent</InputLabel>
              <Select
                label="Active Franchise Accent"
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  showSnackbar('Franchise accent updated', 'info');
                }}
              >
                {(catalog?.teams || []).map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name} ({t.shortCode})</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="caption" color="text.secondary">
              Franchise accent colours apply to selected franchise headers, active navigation indicators, and builder branding.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
