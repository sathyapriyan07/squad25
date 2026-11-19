import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

interface SquadOverviewProps {
  players: PlayerWithDetails[];
  validation: SquadValidationResult;
  ratings: TeamRatingBreakdown;
  rule: SeasonRule;
  onRemovePlayer: (playerId: string) => void;
  onMovePlayer: (index: number, direction: 'up' | 'down') => void;
  onGoToPlayingXI: () => void;
}

export function SquadOverview({
  players,
  validation,
  ratings,
  rule,
  onRemovePlayer,
  onMovePlayer,
  onGoToPlayingXI,
}: SquadOverviewProps) {
  const { counts } = validation;
  const squadPct = Math.min(100, Math.round((counts.total / rule.maxSquadSize) * 100));
  const overseasPct = Math.min(100, Math.round((counts.overseas / rule.maxOverseas) * 100));
  const statusColor = validation.hardErrors.length
    ? 'error.main'
    : validation.isValidSquad
      ? 'success.main'
      : 'text.secondary';

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Squad</Typography>
                <Typography variant="caption" color="text.secondary">
                  {counts.total} / {rule.maxSquadSize} players · min {rule.minSquadSize}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Overall</Typography>
                <Typography variant="h6" className="tabular-nums" sx={{ lineHeight: 1.2 }}>
                  {ratings.overallRating}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="caption" color={statusColor}>
              {validation.status}
            </Typography>

            <Stack spacing={1.5}>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Squad size</Typography>
                  <Typography variant="caption" className="tabular-nums">
                    {counts.total} / {rule.maxSquadSize}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={squadPct}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { bgcolor: 'text.secondary' },
                  }}
                />
              </Box>
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Overseas</Typography>
                  <Typography
                    variant="caption"
                    className="tabular-nums"
                    color={counts.overseas > rule.maxOverseas ? 'error.main' : 'text.primary'}
                  >
                    {counts.overseas} / {rule.maxOverseas}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={overseasPct}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: counts.overseas > rule.maxOverseas ? 'error.main' : 'text.secondary',
                    },
                  }}
                />
              </Box>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              WK {counts.wk} · BAT {counts.bat} · AR {counts.ar} · BOWL {counts.bowl}
            </Typography>

            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<FormatListNumberedIcon />}
              onClick={onGoToPlayingXI}
              disabled={players.length < 11}
              color="inherit"
              sx={{ borderColor: 'divider' }}
            >
              Playing XI · {counts.xiTotal}/11
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {validation.hardErrors.map((issue) => (
        <Alert key={`${issue.ruleId}_${issue.affectedPlayerId ?? ''}`} severity="error" variant="outlined">
          <Typography variant="body2">{issue.message}</Typography>
          <Typography variant="caption" color="text.secondary">{issue.suggestedResolution}</Typography>
        </Alert>
      ))}
      {validation.warnings.slice(0, 3).map((warning) => (
        <Alert key={warning.ruleId} severity="warning" variant="outlined">
          <Typography variant="body2">{warning.message}</Typography>
        </Alert>
      ))}

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>Selected players</Typography>
            <Typography variant="caption" color="text.secondary">{players.length}</Typography>
          </Stack>
          {players.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              Add players to start your squad
            </Typography>
          ) : (
            <Stack spacing={0.75} sx={{ maxHeight: 420, overflowY: 'auto' }}>
              {players.map((player, index) => (
                <Stack
                  key={player.id}
                  direction="row"
                  spacing={0.75}
                  sx={{
                    alignItems: 'center',
                    px: 0.75,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: '#03162B',
                    backgroundImage: 'repeating-conic-gradient(from 15deg at 50% 60%, rgba(28,114,154,0.12) 0deg 14deg, transparent 14deg 29deg)',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{player.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {player.primaryRole}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 34, textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.58rem', lineHeight: 1 }}>
                      OVR
                    </Typography>
                    <Typography variant="body2" className="tabular-nums" sx={{ fontWeight: 700 }}>
                      {player.ratings.overall}
                    </Typography>
                  </Box>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Move ${player.shortName} up`}
                        disabled={index === 0}
                        onClick={() => onMovePlayer(index, 'up')}
                      >
                        <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Move ${player.shortName} down`}
                        disabled={index === players.length - 1}
                        onClick={() => onMovePlayer(index, 'down')}
                      >
                        <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Remove player">
                    <IconButton
                      size="small"
                      aria-label={`Remove ${player.shortName}`}
                      onClick={() => onRemovePlayer(player.id)}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
