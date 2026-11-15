import { useRef } from 'react';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { toPng } from 'html-to-image';
import { useParams } from 'react-router-dom';
import { useSharedSquad } from '../../hooks/useSquads';
import { useAppStore } from '../../store/appStore';
import { EmptyState, LoadingState, StatCard } from '../../components/common/CommonUi';
import { TeamLogo } from '../../components/common/TeamLogo';
import { PlayerAvatar, RoleBadge } from '../../components/common/PlayerAvatar';

export function SharedSquadPage() {
  const { shareSlug } = useParams();
  const { data: share, isLoading } = useSharedSquad(shareSlug);
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const exportRef = useRef<HTMLDivElement>(null);

  if (isLoading) return <LoadingState count={3} />;
  if (!share) {
    return (
      <EmptyState
        title="Shared squad not found"
        description="This share link may be invalid or the squad owner set it back to private."
      />
    );
  }

  const playersMap = new Map(share.players.map((p) => [p.id, p]));
  const xiPlayers = share.playingXiIds.map((id) => playersMap.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    showSnackbar('Share URL copied!', 'success');
  };

  const handleWhatsApp = () => {
    const text = `Check out my ${share.teamShortCode} (${share.seasonName}) custom squad "${share.squadName}" — OVR ${share.ratings.overallRating}/100: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = async () => {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, { backgroundColor: '#090B10', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${share.shareSlug}.png`;
      link.href = dataUrl;
      link.click();
      showSnackbar('Squad poster downloaded!', 'success');
    } catch {
      showSnackbar('Unable to export image in this browser context.', 'warning');
    }
  };

  return (
    <Stack spacing={3}>
      {/* Action Bar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <Chip label={`Public Showcase • ${share.seasonName}`} color="primary" size="small" />
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
            Copy Link
          </Button>
          <Button size="small" variant="outlined" color="success" startIcon={<WhatsAppIcon />} onClick={handleWhatsApp}>
            WhatsApp
          </Button>
          <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={handleDownloadImage} sx={{ bgcolor: share.teamPrimaryColor }}>
            Download Image
          </Button>
        </Stack>
      </Stack>

      {/* Exportable Poster Area */}
      <Box ref={exportRef} sx={{ p: { xs: 1, sm: 2 }, borderRadius: '18px', bgcolor: '#090B10' }}>
        <Stack spacing={3}>
          <Card sx={{ borderTop: `4px solid ${share.teamPrimaryColor}` }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <TeamLogo
                  team={{
                    name: share.teamName,
                    shortCode: share.teamShortCode,
                    primaryColor: share.teamPrimaryColor,
                    secondaryColor: share.teamSecondaryColor,
                  }}
                  size={68}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4">{share.squadName}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {share.teamName} • {share.seasonName} • {share.players.length} Players
                  </Typography>
                </Box>
                <Chip
                  label={`TEAM OVR ${share.ratings.overallRating}`}
                  sx={{ bgcolor: share.teamPrimaryColor, color: '#FFF', fontWeight: 800, fontSize: '0.9rem', height: 34 }}
                />
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Batting" value={share.ratings.battingStrength} accentColor={share.teamPrimaryColor} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Bowling" value={share.ratings.bowlingStrength} accentColor={share.teamPrimaryColor} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="All-Rounders" value={share.ratings.allRounderStrength} accentColor={share.teamPrimaryColor} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard label="Squad Depth" value={share.ratings.squadDepth} accentColor={share.teamPrimaryColor} />
            </Grid>
          </Grid>

          {xiPlayers.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Starting Playing XI
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1.5}>
                  {xiPlayers.map((p, idx) => (
                    <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{ p: 1.25, alignItems: 'center', borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <Typography variant="subtitle2" className="tabular-nums" sx={{ width: 20, fontWeight: 800, color: share.teamPrimaryColor }}>
                          {idx + 1}
                        </Typography>
                        <PlayerAvatar player={p} accentColor={share.teamPrimaryColor} size={36} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{p.shortName}</Typography>
                            {share.captainId === p.id && <Chip size="small" label="C" color="warning" sx={{ height: 18 }} />}
                            {share.viceCaptainId === p.id && <Chip size="small" label="VC" color="info" sx={{ height: 18 }} />}
                            {share.wicketkeeperId === p.id && <Chip size="small" label="WK" color="secondary" sx={{ height: 18 }} />}
                          </Stack>
                          <RoleBadge role={p.primaryRole} />
                        </Box>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Full Squad Roster ({share.players.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1.5}>
                {share.players.map((p) => (
                  <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Stack direction="row" spacing={1.25} sx={{ p: 1, alignItems: 'center', borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <PlayerAvatar player={p} accentColor={share.teamPrimaryColor} size={34} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.primaryRole} • {p.isOverseas ? 'Overseas' : 'Indian'} • OVR {p.ratings.overall}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Stack>
  );
}
