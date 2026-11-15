import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { LoadingState, PageHeader, SearchInput } from '../../components/common/CommonUi';
import { PlayerCard } from '../../components/players/PlayerCard';
import type { PlayerWithDetails } from '../../types/ipl';

type FilterMode = 'ALL' | 'WK' | 'BAT' | 'AR' | 'BOWL' | 'IND' | 'OS' | 'CAP' | 'UNCAP';
type SortMode = 'overall' | 'name' | 'batting' | 'bowling' | 'runs' | 'wickets';

export function PlayersPage() {
  const navigate = useNavigate();
  const { activeSeason, seasonPlayers, isLoading } = useCatalog();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('ALL');
  const [sortBy, setSortBy] = useState<SortMode>('overall');
  const [onlyEligible, setOnlyEligible] = useState<'eligible' | 'all'>('eligible');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [page, setPage] = useState(1);

  const pageSize = 12;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return seasonPlayers
      .filter((p) => {
        if (onlyEligible === 'eligible' && !p.eligibility?.isAvailable) return false;
        if (filter === 'WK' && p.primaryRole !== 'WK' && !p.isWicketkeeper) return false;
        if (filter === 'BAT' && p.primaryRole !== 'BAT') return false;
        if (filter === 'AR' && p.primaryRole !== 'AR') return false;
        if (filter === 'BOWL' && p.primaryRole !== 'BOWL') return false;
        if (filter === 'IND' && p.isOverseas) return false;
        if (filter === 'OS' && !p.isOverseas) return false;
        if (filter === 'CAP' && !p.isCapped) return false;
        if (filter === 'UNCAP' && p.isCapped) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q) ||
          p.primaryRole.toLowerCase().includes(q) ||
          p.previousTeams.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'batting') return b.ratings.batting - a.ratings.batting;
        if (sortBy === 'bowling')
          return (
            Math.max(b.ratings.paceBowling, b.ratings.spinBowling) -
            Math.max(a.ratings.paceBowling, a.ratings.spinBowling)
          );
        if (sortBy === 'runs') return b.careerStats.runs - a.careerStats.runs;
        if (sortBy === 'wickets') return b.careerStats.wickets - a.careerStats.wickets;
        return b.ratings.overall - a.ratings.overall;
      });
  }, [seasonPlayers, search, filter, sortBy, onlyEligible]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: GridColDef<PlayerWithDetails>[] = [
    { field: 'name', headerName: 'Player', flex: 1.4, minWidth: 170 },
    { field: 'nationality', headerName: 'Country', width: 120 },
    { field: 'primaryRole', headerName: 'Role', width: 85 },
    {
      field: 'isOverseas',
      headerName: 'Origin',
      width: 100,
      valueGetter: (_, row) => (row.isOverseas ? 'Overseas' : 'Indian'),
    },
    {
      field: 'overall',
      headerName: 'OVR',
      width: 80,
      valueGetter: (_, row) => row.ratings.overall,
    },
    {
      field: 'runs',
      headerName: 'IPL Runs',
      width: 100,
      valueGetter: (_, row) => row.careerStats.runs,
    },
    {
      field: 'wickets',
      headerName: 'IPL Wkts',
      width: 95,
      valueGetter: (_, row) => row.careerStats.wickets,
    },
  ];

  if (isLoading) return <LoadingState count={4} />;

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={`Player Database — ${activeSeason?.name || ''}`}
        subtitle="Explore player profiles, season eligibility, career statistics, and attribute ratings."
        badge={<Chip size="small" label={`${filtered.length} Players`} color="primary" />}
        actions={
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewMode}
            onChange={(_, v) => v && setViewMode(v)}
          >
            <ToggleButton value="grid" aria-label="Grid view"><ViewModuleIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="table" aria-label="Table view"><TableRowsIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
        }
      />

      {/* Filter Bar */}
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <SearchInput
                  value={search}
                  onChange={(v) => {
                    setSearch(v);
                    setPage(1);
                  }}
                  placeholder="Search by player, country, role, or team (e.g. CSK)..."
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortMode)}>
                    <MenuItem value="overall">Overall Rating</MenuItem>
                    <MenuItem value="name">Alphabetical</MenuItem>
                    <MenuItem value="batting">Batting Rating</MenuItem>
                    <MenuItem value="bowling">Bowling Rating</MenuItem>
                    <MenuItem value="runs">IPL Runs</MenuItem>
                    <MenuItem value="wickets">IPL Wickets</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, md: 3.5 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Season Eligibility</InputLabel>
                  <Select
                    label="Season Eligibility"
                    value={onlyEligible}
                    onChange={(e) => {
                      setOnlyEligible(e.target.value as 'eligible' | 'all');
                      setPage(1);
                    }}
                  >
                    <MenuItem value="eligible">Eligible in {activeSeason?.name}</MenuItem>
                    <MenuItem value="all">All Catalog Players</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {(
                [
                  ['ALL', 'All Players'],
                  ['WK', 'Wicketkeepers'],
                  ['BAT', 'Batters'],
                  ['AR', 'All-Rounders'],
                  ['BOWL', 'Bowlers'],
                  ['IND', 'Indian'],
                  ['OS', 'Overseas'],
                  ['CAP', 'Capped'],
                  ['UNCAP', 'Uncapped'],
                ] as Array<[FilterMode, string]>
              ).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  clickable
                  color={filter === key ? 'primary' : 'default'}
                  variant={filter === key ? 'filled' : 'outlined'}
                  onClick={() => {
                    setFilter(key);
                    setPage(1);
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {viewMode === 'grid' ? (
        <>
          {paged.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">No players match your filters</Typography>
              <Typography variant="body2" color="text.secondary">
                Try clearing your search or switching season eligibility filter.
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {paged.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <PlayerCard player={p} onInspect={(player) => navigate(`/players/${player.id}`)} />
                </Grid>
              ))}
            </Grid>
          )}
          {pageCount > 1 && (
            <Stack sx={{ pt: 1, alignItems: 'center' }}>
              <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" />
            </Stack>
          )}
        </>
      ) : (
        <Card sx={{ height: 560 }}>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 15, page: 0 } } }}
            onRowClick={(params) => navigate(`/players/${params.row.id}`)}
            sx={{ border: 0, cursor: 'pointer' }}
          />
        </Card>
      )}
    </Stack>
  );
}
