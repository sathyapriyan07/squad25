import { Box } from '@mui/material';
import type { Team } from '../../types/ipl';

interface TeamLogoProps {
  team?: Pick<Team, 'shortCode' | 'primaryColor' | 'secondaryColor' | 'logoUrl' | 'name'>;
  size?: number;
}

export function TeamLogo({ team, size = 44 }: TeamLogoProps) {
  if (!team) return null;

  if (team.logoUrl) {
    return (
      <Box
        component="img"
        src={team.logoUrl}
        alt={team.name}
        sx={{
          width: size,
          height: size,
          borderRadius: '12px',
          objectFit: 'contain',
          bgcolor: 'rgba(255,255,255,0.04)',
          p: 0.5,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${Math.max(8, Math.round(size * 0.24))}px`,
        background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
        border: '1px solid rgba(255,255,255,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 4px 14px ${team.primaryColor}33`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <path
          d="M32 6L54 15V31C54 44.5 44.6 54.5 32 58C19.4 54.5 10 44.5 10 31V15L32 6Z"
          fill="rgba(9,11,16,0.45)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
        />
      </svg>
      <Box
        component="span"
        sx={{
          position: 'relative',
          zIndex: 1,
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 800,
          fontSize: size >= 52 ? '0.95rem' : size >= 38 ? '0.75rem' : '0.62rem',
          letterSpacing: '0.04em',
          color: '#FFFFFF',
          textShadow: '0 1px 4px rgba(0,0,0,0.65)',
        }}
      >
        {team.shortCode}
      </Box>
    </Box>
  );
}
