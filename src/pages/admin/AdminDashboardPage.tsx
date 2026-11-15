import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useAllSquadsAdmin } from '../../hooks/useSquads';
import {
  bootstrapCatalogToSupabase,
  fetchAllUsersAdmin,
  fetchImportLogs,
} from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader, StatCard } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';

export function AdminDashboardPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();
  const { data: allSquads = [] } = useAllSquadsAdmin();
  const { data: users = [] } = useQuery({ queryKey: ['admin_users'], queryFn: fetchAllUsersAdmin });
  const { data: importLogs = [] } = useQuery({ queryKey: ['import_logs'], queryFn: fetchImportLogs });

  const [seeding, setSeeding] = useState(false);

  const handleBootstrap = async () => {
    setSeeding(true);
    try {
      await bootstrapCatalogToSupabase();
      await qc.invalidateQueries({ queryKey: ['catalog'] });
      showSnackbar('Official IPL catalog (2008–2027) synced to Supabase!', 'success');
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Failed to sync catalog', 'error');
    } finally {
      setSeeding(false);
    }
  };

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  return (
    <AdminLayout>
      <Stack spacing={3}>
        <PageHeader
          title="Administration Overview"
          subtitle="Manage IPL seasons, franchises, players, statistics, ratings, eligibility, rules, and bulk Excel imports."
          actions={
            <>
              <Button
                variant="outlined"
                component={Link}
                to="/admin/imports"
                startIcon={<UploadFileIcon />}
              >
                Excel Imports
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={handleBootstrap}
                disabled={seeding}
              >
                {seeding ? 'Syncing...' : catalog.isFromSupabase ? 'Re-Sync Reference Catalog' : 'Persist Catalog to Supabase'}
              </Button>
            </>
          }
        />

        {!catalog.isFromSupabase && (
          <Alert severity="warning">
            Catalog is currently running from the local reference dataset because Supabase catalog tables have not been populated yet. Click <strong>Persist Catalog to Supabase</strong> above to initialize live admin editing.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 2.4 }}>
            <StatCard label="Total Players" value={catalog.players.length} accentColor="#3B82F6" />
          </Grid>
          <Grid size={{ xs: 6, md: 2.4 }}>
            <StatCard label="Seasons" value={catalog.seasons.length} accentColor="#22C55E" />
          </Grid>
          <Grid size={{ xs: 6, md: 2.4 }}>
            <StatCard label="Franchises" value={catalog.teams.length} accentColor="#F59E0B" />
          </Grid>
          <Grid size={{ xs: 6, md: 2.4 }}>
            <StatCard label="Custom Squads" value={allSquads.length} accentColor="#A855F7" />
          </Grid>
          <Grid size={{ xs: 12, md: 2.4 }}>
            <StatCard label="Users" value={users.length} accentColor="#EC4899" />
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Excel Imports</Typography>
                {importLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No bulk imports recorded yet. Use the Excel Imports tab to upload XLSX/CSV files.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>File</TableCell>
                        <TableCell align="right">Imported</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importLogs.slice(0, 5).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell><Chip size="small" label={log.type} /></TableCell>
                          <TableCell>{log.fileName}</TableCell>
                          <TableCell align="right" className="tabular-nums">{log.importedRows}/{log.totalRows}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Squad Activity</Typography>
                {allSquads.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No user-created squads stored yet.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Squad</TableCell>
                        <TableCell>Season</TableCell>
                        <TableCell align="right">Players</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allSquads.slice(0, 5).map((sq) => (
                        <TableRow key={sq.id}>
                          <TableCell>{sq.name}</TableCell>
                          <TableCell>{sq.seasonId}</TableCell>
                          <TableCell align="right" className="tabular-nums">{sq.playerIds.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </AdminLayout>
  );
}
