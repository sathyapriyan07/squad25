import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useAppStore } from '../../store/appStore';
import { TeamLogo } from '../../components/common/TeamLogo';
import { EmptyState, LoadingState, PageHeader } from '../../components/common/CommonUi';

export function FranchisesPage() {
  const navigate = useNavigate();
  const { catalog, activeSeason, participatingTeams, isLoading } = useCatalog();
  const setSelectedTeamId = useAppStore((s) => s.setSelectedTeamId);

  if (isLoading || !catalog) return <LoadingState count={4} />;

  return (
    <Stack spacing={2}>
      <PageHeader
        title={`IPL Franchises — ${activeSeason?.name || ''}`}
        subtitle="Only franchises that participated in the selected IPL season are shown. Create unlimited independent custom squads per franchise."
        badge={<Chip size="small" label={`${participatingTeams.length} Participating Teams`} color="primary" />}
      />

      {participatingTeams.length === 0 ? (
        <EmptyState
          title="No participating franchises configured"
          description="Assign participating teams for this season from the Admin Console."
        />
      ) : (
        <Grid container spacing={2.5}>
          {participatingTeams.map((team) => {
            const seasonLink = catalog.seasonTeams.find(
              (st) => st.seasonId === activeSeason?.id && st.teamId === team.id
            );
            return (
              <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    borderTop: `4px solid ${team.primaryColor}`,
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                    <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
                      <TeamLogo team={team} size={56} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="h6" noWrap>{team.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {team.shortCode} • {team.city}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      <Chip size="small" label={`Titles: ${team.titles}`} variant="outlined" />
                      {seasonLink?.historicalSquadSize && (
                        <Chip
                          size="small"
                          label={`Season Roster Limit: ${seasonLink.historicalSquadSize}`}
                          variant="outlined"
                        />
                      )}
                      {!team.isActive && <Chip size="small" label="Historical Franchise" color="warning" variant="outlined" />}
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">Colours:</Typography>
                      <Box sx={{ width: 18, height: 18, borderRadius: '5px', bgcolor: team.primaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                      <Box sx={{ width: 18, height: 18, borderRadius: '5px', bgcolor: team.secondaryColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                    </Stack>

                    <Button
                      variant="contained"
                      startIcon={<BuildIcon />}
                      onClick={() => {
                        setSelectedTeamId(team.id);
                        navigate(`/builder?team=${team.id}&season=${activeSeason?.id}`);
                      }}
                      sx={{
                        mt: 'auto',
                        bgcolor: team.primaryColor,
                        color: '#FFF',
                        '&:hover': { bgcolor: team.primaryColor, filter: 'brightness(0.9)' },
                      }}
                    >
                      Create Custom Squad
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
