import { useState, type ReactNode } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { getCountryFlagEmoji } from '../common/PlayerAvatar';
import { TeamLogo } from '../common/TeamLogo';
import type { PlayerWithDetails, Team } from '../../types/ipl';

interface PlayerProfileHeaderProps {
  player: PlayerWithDetails;
  team?: Team;
  accentColor: string;
  activeSeasonName: string;
  careerMatches?: number;
  overallRating?: number;
  actions: ReactNode;
}

export function PlayerProfileHeader({
  player,
  team,
  accentColor,
  activeSeasonName,
  careerMatches,
  overallRating,
  actions,
}: PlayerProfileHeaderProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = player.imageUrl?.trim() || '';
  const showImage = Boolean(imageUrl && imageUrl !== failedImageUrl);
  const roleLabel = {
    WK: 'Wicketkeeper',
    BAT: 'Batter',
    AR: 'All-rounder',
    BOWL: 'Bowler',
  }[player.primaryRole] || player.primaryRole;
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <Box component="section" sx={{ overflow: 'hidden' }}>
      <Grid container sx={{ minHeight: { md: 290 } }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              position: 'relative',
              height: { xs: 240, sm: 280, md: '100%' },
              minHeight: { md: 290 },
              overflow: 'hidden',
              bgcolor: '#090B10',
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
                  objectFit: 'contain',
                  objectPosition: 'center',
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
              aria-hidden="true"
              sx={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                left: 0,
                height: 100,
                background: 'linear-gradient(0deg, #090B10 0%, rgba(9,11,16,0.72) 42%, rgba(9,11,16,0) 100%)',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, height: '100%', boxSizing: 'border-box' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' }, lineHeight: 1.05, fontWeight: 750 }}
                  >
                    {player.name}
                  </Typography>
                  {overallRating !== undefined && (
                    <Box sx={{ flexShrink: 0, minWidth: 54, textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.58)', display: 'block' }}>OVR</Typography>
                      <Typography className="tabular-nums" sx={{ color: accentColor, fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>
                        {overallRating}
                      </Typography>
                    </Box>
                  )}
                </Stack>
                <Stack direction="row" spacing={1.25} useFlexGap sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: accentColor, fontWeight: 600 }}>
                    {roleLabel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getCountryFlagEmoji(player.countryFlag || '')} {player.nationality || 'Nationality not recorded'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {player.isCapped ? 'Capped' : 'Uncapped'}
                  </Typography>
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
                    {careerMatches === undefined ? 'Matches not recorded' : `${careerMatches} matches`}
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
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
