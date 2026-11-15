import {
  Alert,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import type { PlayerWithDetails, SeasonRule, SquadValidationResult, TeamRatingBreakdown } from '../../types/ipl';
import { PlayerAvatar, RoleBadge } from '../common/PlayerAvatar';

interface SquadOverviewProps {
  players: PlayerWithDetails[];
  validation: SquadValidationResult;
  ratings: TeamRatingBreakdown;
  rule: SeasonRule;
  accentColor: string;
  onRemovePlayer: (playerId: string) => void;
  onMovePlayer: (index: number, direction: 'up' | 'down') => void;
  onGoToPlayingXI: () => void;
}

export function SquadOverview({
  players,
  validation,
  ratings,
  rule,
  accentColor,
  onRemovePlayer,
  onMovePlayer,
  onGoToPlayingXI,
}: SquadOverviewProps) {
  const { counts } = validation;
  const squadPct = Math.min(100, Math.round((counts.total / rule.maxSquadSize) * 100));
  const overseasPct = Math.min(100, Math.round((counts.overseas / rule.maxOverseas) * 100));
  const remainingSlots = Math.max(0, rule.maxSquadSize - counts.total);

  const statusColor: Record<SquadValidationResult['status'], 'success' | 'warning' | 'error' | 'info'> = {
    Valid: 'success',
    'Ready for Playing XI': 'info',
    Incomplete: 'warning',
    Invalid: 'error',
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ p: 2.25 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Squad Overview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {counts.total}/{rule.maxSquadSize} Selected • {remainingSlots} slots open
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={ratings.overallRating}
                size={50}
                thickness={4.5}
                sx={{ color: accentColor }}
              />
              <Box
                sx={{
                  inset: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 800 }}>
                  {ratings.overallRating}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Chip label={validation.status} color={statusColor[validation.status]} size="small" />
            {players.length > 0 && (
              <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.68rem' } }}>
                {players.map((p) => (
                  <Box key={p.id} component="span" title={p.name}>
                    <PlayerAvatar player={p} accentColor={accentColor} size={26} />
                  </Box>
                ))}
              </AvatarGroup>
            )}
          </Stack>

          <Stack spacing={1.25} sx={{ mb: 2 }}>
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" color="text.secondary">Squad Size (Min {rule.minSquadSize})</Typography>
                <Typography variant="caption" className="tabular-nums" sx={{ fontWeight: 700 }}>
                  {counts.total} / {rule.maxSquadSize}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={squadPct}
                sx={{ height: 7, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { bgcolor: accentColor } }}
              />
            </Box>

            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" color="text.secondary">Overseas Quota</Typography>
                <Typography
                  variant="caption"
                  className="tabular-nums"
                  color={counts.overseas > rule.maxOverseas ? 'error.main' : 'text.primary'}
                  sx={{ fontWeight: 700 }}
                >
                  {counts.overseas} / {rule.maxOverseas}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={overseasPct}
                color={counts.overseas > rule.maxOverseas ? 'error' : 'warning'}
                sx={{ height: 7, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.08)' }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
            <Chip size="small" label={`IND: ${counts.indian}`} variant="outlined" />
            <Chip size="small" label={`OS: ${counts.overseas}`} variant="outlined" />
            <Chip size="small" label={`WK: ${counts.wk}`} variant="outlined" />
            <Chip size="small" label={`BAT: ${counts.bat}`} variant="outlined" />
            <Chip size="small" label={`AR: ${counts.ar}`} variant="outlined" />
            <Chip size="small" label={`BOWL: ${counts.bowl}`} variant="outlined" />
          </Stack>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<FormatListNumberedIcon />}
            onClick={onGoToPlayingXI}
            disabled={players.length < 11}
            sx={{ borderColor: accentColor, color: '#FFF' }}
          >
            Configure Playing XI ({counts.xiTotal}/11)
          </Button>
        </CardContent>
      </Card>

      {validation.hardErrors.map((err) => (
        <Alert key={`${err.ruleId}_${err.affectedPlayerId ?? ''}`} severity="error" variant="outlined">
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{err.message}</Typography>
          <Typography variant="caption" color="text.secondary">{err.suggestedResolution}</Typography>
        </Alert>
      ))}
      {validation.warnings.slice(0, 3).map((warn) => (
        <Alert key={warn.ruleId} severity="warning" variant="outlined">
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>{warn.message}</Typography>
        </Alert>
      ))}

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Selected Squad ({players.length})
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {players.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              Select players from the database to build your squad.
            </Typography>
          ) : (
            <Stack spacing={0.75} sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
              {players.map((p, idx) => (
                <Stack
                  key={p.id}
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                    p: 1,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <PlayerAvatar player={p} accentColor={accentColor} size={32} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {p.shortName}
                    </Typography>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <RoleBadge role={p.primaryRole} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {p.isOverseas ? 'OS' : 'IND'} • {p.ratings.overall}
                      </Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={0.25}>
                    <Tooltip title="Move up">
                      <span>
                        <IconButton size="small" disabled={idx === 0} onClick={() => onMovePlayer(idx, 'up')}>
                          <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move down">
                      <span>
                        <IconButton size="small" disabled={idx === players.length - 1} onClick={() => onMovePlayer(idx, 'down')}>
                          <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Remove from squad">
                      <IconButton size="small" color="error" onClick={() => onRemovePlayer(p.id)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
