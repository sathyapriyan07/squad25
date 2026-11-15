import { useState, type ReactNode } from 'react';
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { getCountryFlagEmoji } from '../common/PlayerAvatar';
import { TeamLogo } from '../common/TeamLogo';
import type { PlayerWithDetails, Team } from '../../types/ipl';

interface PlayerProfileHeaderProps {
  player: PlayerWithDetails;
  team?: Team;
  accentColor: string;
  activeSeasonName: string;
  isAvailable: boolean;
  isOverseas: boolean;
  careerMatches?: number;
  seasonsPlayed: number;
  overallRating?: number;
  actions: ReactNode;
  onViewCareer: () => void;
}

export function PlayerProfileHeader({
  player,
  team,
  accentColor,
  activeSeasonName,
  isAvailable,
  isOverseas,
  careerMatches,
  seasonsPlayed,
  overallRating,
  actions,
  onViewCareer,
}: PlayerProfileHeaderProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = player.imageUrl?.trim() || '';
  const showImage = Boolean(imageUrl && imageUrl !== failedImageUrl);
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <Card
      sx={{
        overflow: 'hidden',
        borderColor: `${accentColor}55`,
        backgroundColor: '#10141C',
      }}
    >
      <Grid container>
        <Grid size={{ xs: 12, md: 3.2 }}>
          <Box
            sx={{
              position: 'relative',
              height: { xs: 220, sm: 270, md: '100%' },
              minHeight: { md: 290 },
              overflow: 'hidden',
              bgcolor: '#0A0D12',
            }}
          >
            {showImage ? (
              <Box
                component="img"
                src={imageUrl}
                alt={`${player.name} portrait`}
                loading="eager"
                decoding="async"
                onError={() => setFailedImageUrl(imageUrl)}
                sx={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                }}
              />
            ) : (
              <Box
                role="img"
                aria-label={`${player.name} portrait unavailable`}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  background: `linear-gradient(145deg, ${accentColor}35, #0A0D12 72%)`,
                }}
              >
                <Typography sx={{ fontSize: '4rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {initials || 'IPL'}
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: {
                  xs: 'linear-gradient(180deg, transparent 38%, rgba(5,7,10,0.86) 100%)',
                  md: `linear-gradient(180deg, transparent 40%, ${accentColor}33 100%)`,
                },
                pointerEvents: 'none',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                left: 16,
                bottom: 14,
                color: '#FFF',
                fontWeight: 600,
                textShadow: '0 1px 5px rgba(0,0,0,0.8)',
                display: { xs: 'block', md: 'none' },
              }}
            >
              {getCountryFlagEmoji(player.countryFlag || '')} {player.nationality}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8.8 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: '1.65rem', sm: '2rem', md: '2.25rem' }, lineHeight: 1.1 }}
                  >
                    {player.name}
                  </Typography>
                  {overallRating !== undefined && (
                    <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">OVR</Typography>
                      <Typography className="tabular-nums" sx={{ color: accentColor, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1 }}>
                        {overallRating}
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip size="small" label={player.primaryRole} variant="outlined" sx={{ borderColor: `${accentColor}99`, color: accentColor }} />
                  <Chip size="small" label={isOverseas ? 'Overseas' : 'Indian'} variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    {getCountryFlagEmoji(player.countryFlag || '')} {player.nationality || 'Nationality not recorded'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {player.isCapped ? 'Capped' : 'Uncapped'}
                  </Typography>
                  <Chip
                    size="small"
                    label={isAvailable ? `Eligible · ${activeSeasonName}` : `Unavailable · ${activeSeasonName}`}
                    color={isAvailable ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Grid container spacing={{ xs: 1.25, sm: 2 }}>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">Batting style</Typography>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {player.battingStyle?.trim() || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">Bowling style</Typography>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                    {player.bowlingStyle?.trim() || '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Typography variant="caption" color="text.secondary">IPL career</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {careerMatches === undefined ? 'Matches not recorded' : `${careerMatches} matches · ${seasonsPlayed} seasons`}
                  </Typography>
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 'auto', alignItems: { sm: 'center' } }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
                  {team ? (
                    <>
                      <TeamLogo team={team} size={30} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">Current franchise</Typography>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                          {team.shortCode} · {team.name}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No franchise recorded for {activeSeasonName}
                    </Typography>
                  )}
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                  {actions}
                  <Chip
                    label="Career history"
                    clickable
                    variant="outlined"
                    onClick={onViewCareer}
                    sx={{ borderColor: `${accentColor}66`, color: 'text.secondary' }}
                  />
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
}
