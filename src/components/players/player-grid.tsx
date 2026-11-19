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
  cardStyle?: 'standard' | 'directory';
  loading?: boolean;
  skeletonCount?: number;
  columns?: ResponsiveColumns;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

function PlayerCardSkeleton({
  compact,
  cardStyle,
}: {
  compact: boolean;
  cardStyle: 'standard' | 'directory';
}) {
  const isDirectoryCard = cardStyle === 'directory';

  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: isDirectoryCard ? '10px' : '18px',
        bgcolor: isDirectoryCard ? 'transparent' : undefined,
        border: isDirectoryCard ? 'none' : undefined,
      }}
    >
      <Skeleton
        variant="rectangular"
        height={isDirectoryCard ? 'auto' : compact ? 155 : 230}
        animation="wave"
        sx={{
          aspectRatio: isDirectoryCard ? '4 / 3' : undefined,
          bgcolor: 'rgba(255,255,255,0.07)',
        }}
      />
      <CardContent sx={{ p: isDirectoryCard ? 0 : 2, pt: isDirectoryCard ? 1.1 : 2 }}>
        <Skeleton width="68%" sx={{ bgcolor: 'rgba(255,255,255,0.07)' }} />
        {!isDirectoryCard && (
          <>
            <Skeleton width="88%" sx={{ bgcolor: 'rgba(255,255,255,0.07)' }} />
            <Skeleton height={38} sx={{ mt: 1.5, bgcolor: 'rgba(255,255,255,0.07)' }} />
          </>
        )}
      </CardContent>
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
  cardStyle = 'standard',
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
                <PlayerCardSkeleton compact={compact} cardStyle={cardStyle} />
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
                  cardStyle={cardStyle}
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
