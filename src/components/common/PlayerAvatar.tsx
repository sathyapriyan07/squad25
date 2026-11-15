import { useState } from 'react';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import type { Player } from '../../types/ipl';

const FLAG_EMOJIS: Record<string, string> = {
  IN: '🇮🇳',
  AU: '🇦🇺',
  GB: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  ZA: '🇿🇦',
  NZ: '🇳🇿',
  WI: '🏝️',
  AF: '🇦🇫',
  LK: '🇱🇰',
  BD: '🇧🇩',
  IE: '🇮🇪',
  ZW: '🇿🇼',
  SG: '🇸🇬',
};

export function getCountryFlagEmoji(code: string): string {
  return FLAG_EMOJIS[code.toUpperCase()] || '🏏';
}

interface PlayerAvatarProps {
  player: Pick<Player, 'name' | 'shortName' | 'imageUrl' | 'primaryRole' | 'jerseyNumber'>;
  accentColor?: string;
  size?: number;
  minimal?: boolean;
}

export function PlayerAvatar({
  player,
  accentColor = '#3B82F6',
  size = 48,
  minimal = false,
}: PlayerAvatarProps) {
  const initials = player.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  const imageUrl = player.imageUrl?.trim();
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  if (imageUrl && failedImageUrl !== imageUrl) {
    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          border: minimal ? '1px solid rgba(255,255,255,0.12)' : `2px solid ${accentColor}`,
          bgcolor: '#1C2430',
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={player.name}
          onError={() => setFailedImageUrl(imageUrl)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Avatar>
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: minimal ? '#232325' : `radial-gradient(circle at 30% 25%, ${accentColor}55, #151B25 75%)`,
        border: minimal ? '1px solid rgba(255,255,255,0.12)' : `1.5px solid ${accentColor}88`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontWeight: minimal ? 500 : 700,
          fontSize: size >= 72 ? '1.35rem' : size >= 44 ? '0.9rem' : '0.72rem',
          color: '#F5F7FA',
          letterSpacing: minimal ? 0 : '0.03em',
        }}
      >
        {initials}
      </Typography>
      {player.jerseyNumber !== undefined && size >= 44 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -3,
            right: -3,
            px: 0.5,
            py: 0.1,
            borderRadius: '6px',
            bgcolor: '#090B10',
            border: `1px solid ${accentColor}`,
            fontSize: '0.58rem',
            fontWeight: 700,
            color: '#F5F7FA',
            lineHeight: 1.2,
          }}
        >
          #{player.jerseyNumber}
        </Box>
      )}
    </Box>
  );
}

export function RoleBadge({ role }: { role: Player['primaryRole'] }) {
  const colors: Record<Player['primaryRole'], { bg: string; color: string; label: string }> = {
    WK: { bg: 'rgba(168,85,247,0.16)', color: '#C084FC', label: 'WK' },
    BAT: { bg: 'rgba(59,130,246,0.16)', color: '#60A5FA', label: 'BAT' },
    AR: { bg: 'rgba(245,158,11,0.16)', color: '#FBBF24', label: 'AR' },
    BOWL: { bg: 'rgba(34,197,94,0.16)', color: '#4ADE80', label: 'BOWL' },
  };
  const cfg = colors[role];
  return (
    <Chip
      size="small"
      label={cfg.label}
      sx={{
        height: 22,
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`,
      }}
    />
  );
}

export function CountryLabel({ nationality, flag }: { nationality: string; flag: string }) {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box component="span" sx={{ fontSize: '0.85rem', lineHeight: 1 }}>
        {getCountryFlagEmoji(flag)}
      </Box>
      <Typography variant="caption" color="text.secondary" noWrap>
        {nationality}
      </Typography>
    </Stack>
  );
}
