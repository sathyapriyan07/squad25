import { Box, Button, Card, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import FlightIcon from '@mui/icons-material/Flight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { PlayerWithDetails } from '../../types/ipl';
import { CountryLabel, PlayerAvatar, RoleBadge } from '../common/PlayerAvatar';

interface PlayerCardProps {
  player: PlayerWithDetails;
  accentColor?: string;
  isSelected?: boolean;
  onAdd?: (player: PlayerWithDetails) => void;
  onRemove?: (player: PlayerWithDetails) => void;
  onInspect: (player: PlayerWithDetails) => void;
  compact?: boolean;
}

export function PlayerCard({
  player,
  accentColor = '#3B82F6',
  isSelected = false,
  onAdd,
  onRemove,
  onInspect,
  compact = false,
}: PlayerCardProps) {
  const isAvailable = player.eligibility?.isAvailable ?? false;
  const isOverseas = player.eligibility?.isOverseasSnapshot ?? player.isOverseas;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: isSelected ? accentColor : 'divider',
        bgcolor: isSelected ? `${accentColor}0D` : 'background.paper',
        transition: 'border-color 140ms ease, transform 140ms ease',
        '&:hover': {
          borderColor: isSelected ? accentColor : 'rgba(255,255,255,0.2)',
        },
      }}
    >
      <CardContent sx={{ p: compact ? 1.5 : 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Stack direction="row" spacing={1.25} onClick={() => onInspect(player)} sx={{ alignItems: 'center', cursor: 'pointer' }}>
          <PlayerAvatar player={player} accentColor={accentColor} size={compact ? 42 : 48} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {player.name}
              </Typography>
              {isOverseas && (
                <Tooltip title="Overseas Player">
                  <FlightIcon sx={{ fontSize: 14, color: '#F59E0B', flexShrink: 0 }} />
                </Tooltip>
              )}
            </Stack>
            <CountryLabel nationality={player.nationality} flag={player.countryFlag} />
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: '8px',
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block', lineHeight: 1 }}>
              OVR
            </Typography>
            <Typography variant="subtitle2" className="tabular-nums" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
              {player.ratings.overall}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <RoleBadge role={player.primaryRole} />
          <Chip
            size="small"
            label={isOverseas ? 'Overseas' : 'Indian'}
            variant="outlined"
            sx={{ height: 22, fontSize: '0.68rem', color: isOverseas ? '#FBBF24' : '#60A5FA', borderColor: 'rgba(255,255,255,0.14)' }}
          />
          <Chip
            size="small"
            label={player.isCapped ? 'Capped' : 'Uncapped'}
            variant="outlined"
            sx={{ height: 22, fontSize: '0.68rem', color: 'text.secondary', borderColor: 'rgba(255,255,255,0.12)' }}
          />
          {player.actualTeam && (
            <Chip
              size="small"
              label={player.actualTeam.shortCode}
              sx={{
                height: 22,
                fontSize: '0.68rem',
                bgcolor: `${player.actualTeam.primaryColor}22`,
                color: '#F5F7FA',
                border: `1px solid ${player.actualTeam.primaryColor}55`,
              }}
            />
          )}
        </Stack>

        <Box sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {player.battingStyle} • {player.bowlingStyle}
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }} className="tabular-nums">
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
              Mat: {player.careerStats.matches}
            </Typography>
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
              Runs: {player.careerStats.runs}
            </Typography>
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
              Wkts: {player.careerStats.wickets}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={() => onInspect(player)}
            sx={{ minWidth: 38, px: 1, borderColor: 'rgba(255,255,255,0.12)' }}
            aria-label={`Inspect ${player.name}`}
          >
            <InfoOutlinedIcon fontSize="small" />
          </Button>
          {onAdd && (
            <Button
              size="small"
              fullWidth
              variant={isSelected ? 'outlined' : 'contained'}
              color={isSelected ? 'success' : 'primary'}
              disabled={!isAvailable && !isSelected}
              startIcon={isSelected ? <CheckIcon fontSize="small" /> : <AddIcon fontSize="small" />}
              onClick={() => (isSelected && onRemove ? onRemove(player) : onAdd(player))}
              sx={{
                bgcolor: !isSelected && isAvailable ? accentColor : undefined,
                '&:hover': !isSelected && isAvailable ? { bgcolor: accentColor, filter: 'brightness(0.92)' } : undefined,
              }}
            >
              {!isAvailable ? 'Not Eligible' : isSelected ? 'In Squad' : 'Add to Squad'}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
