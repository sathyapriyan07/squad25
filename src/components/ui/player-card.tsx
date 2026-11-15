import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { PlayerWithDetails } from '../../types/ipl';
import { getCountryFlagEmoji } from '../common/PlayerAvatar';

export interface PlayerCardProps {
  player: PlayerWithDetails;
  selected?: boolean;
  disabled?: boolean;
  accentColor?: string;
  onSelect?: (player: PlayerWithDetails) => void;
  onRemove?: (player: PlayerWithDetails) => void;
  onViewDetails?: (player: PlayerWithDetails) => void;
  actionLabel?: string;
  selectedActionLabel?: string;
  showAction?: boolean;
  compact?: boolean;
}

function PlayerCard({
  player,
  selected = false,
  disabled,
  accentColor = '#3B82F6',
  onSelect,
  onRemove,
  onViewDetails,
  actionLabel = 'Add to Squad',
  selectedActionLabel = 'Added to Squad',
  showAction = Boolean(onSelect || onRemove),
  compact = false,
}: PlayerCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = player.imageUrl?.trim() || '';
  const showImage = Boolean(imageUrl && imageUrl !== failedImageUrl);
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const isUnavailable = disabled ?? player.eligibility?.isAvailable === false;
  const actionDisabled = (isUnavailable && !selected) || (selected ? !onRemove : !onSelect);
  const rating = Number.isFinite(player.ratings?.overall) ? player.ratings.overall : undefined;
  const roleLabel = {
    WK: 'Wicketkeeper',
    BAT: 'Batter',
    AR: 'All-rounder',
    BOWL: 'Bowler',
  }[player.primaryRole];
  const originLabel = player.isOverseas ? 'Overseas' : 'Indian';

  const handleAction = () => {
    if (selected) {
      onRemove?.(player);
    } else if (!isUnavailable) {
      onSelect?.(player);
    }
  };

  return (
    <Card
      component="article"
      aria-label={`${player.name} player card`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#0B0D12',
        border: `1px solid ${selected ? accentColor : 'rgba(255,255,255,0.09)'}`,
        borderRadius: '18px',
        opacity: isUnavailable && !selected ? 0.72 : 1,
        transition: 'border-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
        '&:hover': {
          borderColor: selected ? accentColor : 'rgba(255,255,255,0.22)',
          boxShadow: selected ? `0 0 0 1px ${accentColor}33` : '0 10px 24px rgba(0,0,0,0.24)',
        },
        '&:hover .player-card-image': {
          transform: 'scale(1.045)',
        },
        '&:focus-within': {
          outline: `2px solid ${accentColor}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          height: compact ? { xs: 125, sm: 140, md: 155 } : { xs: 175, sm: 200, md: 230 },
          overflow: 'hidden',
          bgcolor: '#11151C',
        }}
      >
        {showImage ? (
          <Box
            component="img"
            className="player-card-image"
            src={imageUrl}
            alt={`${player.name} portrait`}
            loading="lazy"
            decoding="async"
            onError={() => setFailedImageUrl(imageUrl)}
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              transform: 'scale(1)',
              transition: 'transform 420ms ease',
              filter: isUnavailable && !selected ? 'grayscale(0.35)' : 'none',
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
              bgcolor: '#121720',
              backgroundImage: `linear-gradient(145deg, ${accentColor}18, transparent 62%)`,
            }}
          >
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '3rem', fontWeight: 500 }}>
              {initials || 'IPL'}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(5,7,10,0.32) 0%, transparent 34%, rgba(5,7,10,0.92) 100%)',
            pointerEvents: 'none',
          }}
        />

        {rating !== undefined && (
          <Typography
            aria-label={`Overall rating ${rating}`}
            className="tabular-nums"
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              color: '#FFF',
              fontSize: '0.72rem',
              fontWeight: 600,
              textShadow: '0 1px 5px rgba(0,0,0,0.8)',
            }}
          >
            OVR {rating}
          </Typography>
        )}

        {onViewDetails && (
          <Tooltip title={`View ${player.name}`}>
            <IconButton
              aria-label={`View ${player.name} profile`}
              onClick={() => onViewDetails(player)}
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                color: '#FFF',
                bgcolor: 'rgba(5,7,10,0.62)',
                '&:hover': { bgcolor: 'rgba(5,7,10,0.88)' },
              }}
            >
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Stack sx={{ position: 'absolute', right: 14, bottom: 12, left: 14 }} spacing={0.5}>
          <Typography
            variant={compact ? 'subtitle1' : 'h6'}
            noWrap
            sx={{
              color: '#FFF',
              fontWeight: 600,
              fontSize: { xs: '0.84rem', sm: compact ? '0.88rem' : '1rem' },
              lineHeight: 1.15,
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}
          >
            {player.name}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.58rem' }}>
            {getCountryFlagEmoji(player.countryFlag || '')} {player.nationality || 'Nationality not listed'} · {roleLabel} · {originLabel}
          </Typography>
        </Stack>
      </Box>

      <CardContent
        sx={{
          p: compact ? 1.25 : 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? 0.75 : 1,
          flex: 1,
          '&:last-child': { pb: compact ? 1.25 : 1.5 },
        }}
      >
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>Batting</Typography>
            <Typography variant="body2" noWrap sx={{ maxWidth: '72%', textAlign: 'right', fontSize: '0.68rem' }}>
              {player.battingStyle?.trim() || '—'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>Bowling</Typography>
            <Typography variant="body2" noWrap sx={{ maxWidth: '72%', textAlign: 'right', fontSize: '0.68rem' }}>
              {player.bowlingStyle?.trim() || '—'}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {showAction && (
          <Tooltip
            title={!selected && isUnavailable ? 'Unavailable for selection in this season' : ''}
            disableHoverListener={selected || !isUnavailable}
          >
            <Box component="span" sx={{ display: 'block', width: '100%', mt: 'auto' }}>
              <Button
                fullWidth
                size="medium"
                variant={selected ? 'outlined' : 'contained'}
                disabled={actionDisabled}
                startIcon={selected ? <CheckIcon /> : isUnavailable ? undefined : <AddIcon />}
                onClick={handleAction}
                aria-label={
                  selected
                    ? `${selectedActionLabel}: ${player.name}. Remove from selection`
                    : isUnavailable
                      ? `${player.name} unavailable for selection`
                      : `${actionLabel}: ${player.name}`
                }
                sx={{
                  minHeight: 38,
                  borderColor: selected ? accentColor : 'transparent',
                  color: selected ? accentColor : '#090B10',
                  bgcolor: selected ? 'transparent' : accentColor,
                  fontSize: '0.58rem',
                  letterSpacing: '0.035em',
                  textTransform: 'uppercase',
                  '&:hover': {
                    borderColor: selected ? accentColor : 'transparent',
                    bgcolor: selected ? `${accentColor}18` : accentColor,
                    filter: selected ? 'none' : 'brightness(0.92)',
                  },
                  '&.Mui-disabled': { color: 'rgba(255,255,255,0.55)' },
                }}
              >
                {selected ? selectedActionLabel : isUnavailable ? 'Unavailable' : actionLabel}
              </Button>
            </Box>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}

export { PlayerCard };
