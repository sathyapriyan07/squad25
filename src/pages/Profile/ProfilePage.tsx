import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { updateUserProfile } from '../../services/authService';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { PageHeader } from '../../components/common/CommonUi';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog } = useCatalog();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [favoriteTeamId, setFavoriteTeamId] = useState(user?.favoriteTeamId || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { displayName, favoriteTeamId });
      setUser({ ...user, displayName, favoriteTeamId, updatedAt: new Date().toISOString() });
      showSnackbar('Profile updated!', 'success');
    } catch {
      showSnackbar('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <PageHeader
        title="Manager Profile"
        subtitle="Manage your franchise manager identity and favorite IPL team."
        badge={<Chip size="small" label={user.role.toUpperCase()} color={user.role === 'admin' ? 'warning' : 'primary'} />}
      />

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Display Name"
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <TextField label="Email" fullWidth value={user.email || 'Connected via Auth'} disabled />
            <FormControl fullWidth>
              <InputLabel>Favorite Franchise</InputLabel>
              <Select
                label="Favorite Franchise"
                value={favoriteTeamId}
                onChange={(e) => setFavoriteTeamId(e.target.value)}
              >
                {(catalog?.teams || []).filter((t) => t.isActive).map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name} ({t.shortCode})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
