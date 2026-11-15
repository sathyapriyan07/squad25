import { Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader } from '../../components/common/CommonUi';

export function SeasonsPage() {
  const navigate = useNavigate();
  const { catalog, activeSeason, isLoading } = useCatalog();
  const setSelectedSeasonId = useAppStore((s) => s.setSelectedSeasonId);

  if (isLoading || !catalog) return <LoadingState count={4} />;

  return (
    <Stack spacing={2}>
      <PageHeader
        title="IPL Seasons"
        subtitle="Select an IPL season from 2008 onwards. Participating franchises, player eligibility, and squad rules adapt automatically per season."
      />

      <Grid container spacing={2.5}>
        {catalog.seasons.map((season) => {
          const isSelected = activeSeason?.id === season.id;
          const teamCount = catalog.seasonTeams.filter((st) => st.seasonId === season.id).length;
          const rule = catalog.seasonRules.find((r) => r.seasonId === season.id);
          const unavailablePlayerIds = new Set(
            catalog.playerSeasons
              .filter((entry) => entry.seasonId === season.id && !entry.isAvailable)
              .map((entry) => entry.playerId)
          );
          const eligibleCount = catalog.players.filter(
            (player) => !unavailablePlayerIds.has(player.id)
          ).length;

          return (
            <Grid key={season.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'rgba(59,130,246,0.06)' : 'background.paper',
                }}
              >
                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" className="tabular-nums">
                      {season.name}
                    </Typography>
                    {isSelected && <Chip size="small" icon={<CheckCircleIcon />} label="Active" color="primary" />}
                  </Stack>

                  <Typography variant="caption" color="text.secondary" className="tabular-nums">
                    {season.startDate} — {season.endDate}
                  </Typography>

                  <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    <Chip size="small" label={`${teamCount} Teams`} variant="outlined" />
                    <Chip size="small" label={`${eligibleCount} Players`} variant="outlined" />
                    <Chip
                      size="small"
                      label={season.impactPlayerEnabled ? 'Impact Player' : 'Classic Rules'}
                      color={season.impactPlayerEnabled ? 'info' : 'default'}
                      variant="outlined"
                    />
                  </Stack>

                  {rule && (
                    <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                      Squad: {rule.minSquadSize}–{rule.maxSquadSize} • Max OS: {rule.maxOverseas} (XI: {rule.maxOverseasInXi})
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant={isSelected ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => setSelectedSeasonId(season.id)}
                    >
                      {isSelected ? 'Selected' : 'Select Season'}
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedSeasonId(season.id);
                        navigate('/franchises');
                      }}
                    >
                      Teams
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}
