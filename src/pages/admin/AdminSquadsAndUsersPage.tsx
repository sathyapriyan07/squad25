import {
  Button,
  Card,
  Chip,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAllSquadsAdmin } from '../../hooks/useSquads';
import { fetchAllUsersAdmin, setUserAdminRole } from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { LoadingState, PageHeader } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';

export function AdminSquadsPage() {
  const navigate = useNavigate();
  const { data: squads = [], isLoading } = useAllSquadsAdmin();

  if (isLoading) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader title="All User Squads" subtitle="Audit and inspect custom squads across all users." />
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Squad Name</TableCell>
                <TableCell>Franchise</TableCell>
                <TableCell>Season</TableCell>
                <TableCell align="right">Players</TableCell>
                <TableCell align="right">OVR</TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {squads.map((sq) => (
                <TableRow key={sq.id}>
                  <TableCell sx={{ fontWeight: 600 }}>{sq.name}</TableCell>
                  <TableCell>{sq.teamId.toUpperCase()}</TableCell>
                  <TableCell>{sq.seasonId}</TableCell>
                  <TableCell align="right">{sq.playerIds.length}</TableCell>
                  <TableCell align="right">{sq.ratings.overallRating}</TableCell>
                  <TableCell><Chip size="small" label={sq.visibility} /></TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/builder/${sq.id}`)}>Inspect</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </AdminLayout>
  );
}

export function AdminUsersPage() {
  const qc = useQueryClient();
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: fetchAllUsersAdmin,
  });

  if (isLoading) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const toggleAdmin = async (uid: string, makeAdmin: boolean) => {
    await setUserAdminRole(uid, makeAdmin);
    await qc.invalidateQueries({ queryKey: ['admin_users'] });
    showSnackbar(`Updated user role to ${makeAdmin ? 'admin' : 'user'}`, 'success');
  };

  return (
    <AdminLayout>
      <PageHeader title="Users & Role Permissions" subtitle="Promote or revoke Admin privileges for registered users." />
      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Display Name</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Admin Access</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell sx={{ fontWeight: 600 }}>{u.displayName}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{u.uid}</TableCell>
                  <TableCell><Chip size="small" label={u.role} color={u.role === 'admin' ? 'warning' : 'default'} /></TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={u.role === 'admin'}
                      onChange={(e) => toggleAdmin(u.uid, e.target.checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </AdminLayout>
  );
}
