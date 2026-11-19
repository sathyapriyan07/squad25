import {
  Card,
  CardContent,
  Grid,
  Pagination,
  Skeleton,
  Stack,
} from '@mui/material';
import { EmptyState } from '../common/CommonUi';
import type { PlayerWithDetails } from '../../types/ipl';
import { PlayerCard } from '../ui/player-card';

type GridBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ResponsiveColumns = Partial<Record<GridBreakpoint, number>>;

export interface PlayerGridProps {
  players: PlayerWithDetails[];
  selectedPlayerIds?: readonly string[];
  onSelect?: (player: PlayerWithDetails) => void;
  onRemove?: (player: PlayerWithDetails) => void;
  onViewDetails?: (player: PlayerWithDetails) => void;
  accentColor?: string;
  actionLabel?: string;
  selectedActionLabel?: string;
  showAction?: boolean;
  compact?: boolean;
  horizontal?: boolean;
  loading?: boolean;
  skeletonCount?: number;
  columns?: ResponsiveColumns;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

function PlayerCardSkeleton({ compact, horizontal }: { compact: boolean; horizontal: boolean }) {
  const image = (
    <Skeleton
      variant="rectangular"
      width={horizontal ? (compact ? 120 : 140) : '100%'}
      height={horizontal ? '100%' : compact ? 155 : 230}
      animation="wave"
      sx={{
        minHeight: horizontal ? (compact ? 145 : 160) : undefined,
        bgcolor: 'rgba(255,255,255,0.07)',
      }}
    />
  );
  const details = (
    <CardContent sx={{ p: 2, flex: 1, minWidth: 0 }}>
      <Skeleton width="68%" sx={{ bgcolor: 'rgba(255,255,255,0.07)' }} />
      <Skeleton width="88%" sx={{ bgcolor: 'rgba(255,255,255,0.07)' }} />
      <Skeleton height={38} sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.07)' }} />
    </CardContent>
  );

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: horizontal ? (compact ? 145 : 160) : undefined,
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        overflow: 'hidden',
        borderRadius: '18px',
      }}
    >
      {image}
      {details}
    </Card>
  );
}

export function PlayerGrid({
  players,
  selectedPlayerIds = [],
  onSelect,
  onRemove,
  onViewDetails,
  accentColor = '#3B82F6',
  actionLabel,
  selectedActionLabel,
  showAction,
  compact = false,
  horizontal = false,
  loading = false,
  skeletonCount = 8,
  columns = { xs: 2, sm: 3, md: 4, lg: 5 },
  page,
  pageSize,
  onPageChange,
  emptyTitle = 'No players found',
  emptyDescription = 'Try changing your search or filters.',
}: PlayerGridProps) {
  const sizeFor = (breakpoint: GridBreakpoint, fallback: number) => {
    const count = columns[breakpoint] ?? fallback;
    return 12 / count;
  };
  const gridSize = {
    xs: sizeFor('xs', 2),
    sm: columns.sm ? sizeFor('sm', 3) : undefined,
    md: columns.md ? sizeFor('md', 4) : undefined,
    lg: columns.lg ? sizeFor('lg', 5) : undefined,
    xl: columns.xl ? sizeFor('xl', 5) : undefined,
  };
  const paginated = page !== undefined && pageSize !== undefined && pageSize > 0;
  const visiblePlayers = paginated
    ? players.slice((page - 1) * pageSize, page * pageSize)
    : players;
  const pageCount = paginated ? Math.max(1, Math.ceil(players.length / pageSize)) : 1;

  if (!loading && players.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Stack spacing={2}>
      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {loading
          ? Array.from({ length: Math.max(1, skeletonCount) }, (_, index) => (
              <Grid key={`player-skeleton-${index}`} size={gridSize}>
                <PlayerCardSkeleton compact={compact} horizontal={horizontal} />
              </Grid>
            ))
          : visiblePlayers.map((player) => (
              <Grid key={player.id} size={gridSize}>
                <PlayerCard
                  player={player}
                  selected={selectedPlayerIds.includes(player.id)}
                  accentColor={accentColor}
                  onSelect={onSelect}
                  onRemove={onRemove}
                  onViewDetails={onViewDetails}
                  actionLabel={actionLabel}
                  selectedActionLabel={selectedActionLabel}
                  showAction={showAction}
                  compact={compact}
                  horizontal={horizontal}
                />
              </Grid>
            ))}
      </Grid>
      {paginated && onPageChange && pageCount > 1 && (
        <Stack sx={{ alignItems: 'center' }}>
          <Pagination count={pageCount} page={page} onChange={(_, value) => onPageChange(value)} size="small" />
        </Stack>
      )}
    </Stack>
  );
}
