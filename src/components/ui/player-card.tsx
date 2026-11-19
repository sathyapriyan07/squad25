import { useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
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
  cardStyle?: 'standard' | 'directory';
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
  cardStyle = 'standard',
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
  const isDirectoryCard = cardStyle === 'directory';

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
        bgcolor: isDirectoryCard ? 'transparent' : '#0B0D12',
        border: isDirectoryCard ? 'none' : `1px solid ${selected ? accentColor : 'rgba(255,255,255,0.09)'}`,
        borderRadius: isDirectoryCard ? '10px' : '18px',
        opacity: isUnavailable && !selected ? 0.72 : 1,
        transition: 'border-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
        '&:hover': {
          borderColor: isDirectoryCard ? 'transparent' : selected ? accentColor : 'rgba(255,255,255,0.22)',
          boxShadow: isDirectoryCard ? 'none' : selected ? `0 0 0 1px ${accentColor}33` : '0 10px 24px rgba(0,0,0,0.24)',
        },
        '&:hover .player-card-image': {
          transform: 'scale(1.045)',
        },
        '&:focus-within': isDirectoryCard
          ? { outline: 'none' }
          : { outline: `2px solid ${accentColor}`, outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          height: isDirectoryCard ? 'auto' : compact ? { xs: 125, sm: 140, md: 155 } : { xs: 175, sm: 200, md: 230 },
          aspectRatio: isDirectoryCard ? '4 / 3' : undefined,
          overflow: 'hidden',
          bgcolor: isDirectoryCard ? '#03162B' : '#11151C',
          backgroundImage: isDirectoryCard
            ? 'repeating-conic-gradient(from 15deg at 50% 60%, rgba(28,114,154,0.16) 0deg 14deg, transparent 14deg 29deg)'
            : 'none',
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
              objectFit: isDirectoryCard ? 'contain' : 'cover',
              objectPosition: isDirectoryCard ? 'center bottom' : 'center top',
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
              bgcolor: isDirectoryCard ? '#03162B' : '#121720',
              backgroundImage: isDirectoryCard
                ? 'repeating-conic-gradient(from 15deg at 50% 60%, rgba(28,114,154,0.16) 0deg 14deg, transparent 14deg 29deg)'
                : `linear-gradient(145deg, ${accentColor}18, transparent 62%)`,
            }}
          >
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.72)',
                fontSize: isDirectoryCard ? '1.5rem' : '3rem',
                fontWeight: 500,
              }}
            >
              {initials || 'IPL'}
            </Typography>
          </Box>
        )}

        {!isDirectoryCard && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(5,7,10,0.32) 0%, transparent 34%, rgba(5,7,10,0.92) 100%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {isDirectoryCard ? (
          <Stack sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, alignItems: 'flex-start' }} spacing={0}>
            <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.62rem', fontWeight: 600, lineHeight: 1 }}>
              OVR
            </Typography>
            {rating !== undefined && (
              <Typography
                aria-label={`Overall rating ${rating}`}
                className="tabular-nums"
                sx={{ color: '#FFF', fontSize: '1.15rem', lineHeight: 1.1, fontWeight: 800 }}
              >
                {rating}
              </Typography>
            )}
          </Stack>
        ) : rating !== undefined && (
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

        {onViewDetails && !isDirectoryCard && (
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

        {!isDirectoryCard && (
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
        )}
      </Box>

      <CardContent
        sx={{
          p: isDirectoryCard ? 0 : compact ? 1.25 : 1.5,
          pt: isDirectoryCard ? 1.1 : undefined,
          display: 'flex',
          flexDirection: 'column',
          gap: compact ? 0.75 : 1,
          flex: 1,
          '&:last-child': { pb: isDirectoryCard ? 0 : compact ? 1.25 : 1.5 },
        }}
      >
        {isDirectoryCard ? (
          <ButtonBase
            disabled={!onViewDetails}
            onClick={() => onViewDetails?.(player)}
            aria-label={`View ${player.name} profile`}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              borderRadius: 1,
              textAlign: 'left',
              '&.Mui-disabled': { color: 'inherit' },
            }}
          >
            <Stack spacing={0.1} sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ color: '#FFF', fontSize: '0.84rem', fontWeight: 700, lineHeight: 1.15 }}>
                {player.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.68)', fontSize: '0.68rem' }}>
                {roleLabel}
              </Typography>
            </Stack>
          </ButtonBase>
        ) : (
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
        )}

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
