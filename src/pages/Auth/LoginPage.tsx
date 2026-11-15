import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  loginWithEmail,
  sendPasswordReset,
  signInWithGoogle,
  updatePassword,
} from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';
  const isRecovery = new URLSearchParams(location.search).get('recovery') === '1';

  const setUser = useAuthStore((s) => s.setUser);
  const showSnackbar = useAppStore((s) => s.showSnackbar);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        setUser(profile);
        showSnackbar(`Welcome back, ${profile.displayName}!`, 'success');
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = await loginWithEmail(email, password);
      setUser(profile);
      showSnackbar(`Signed in as ${profile.displayName}`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setResetMessage(null);
    try {
      await sendPasswordReset(resetEmail);
      setResetMessage('Password reset email sent. Check your inbox.');
    } catch (err) {
      setResetMessage(err instanceof Error ? err.message : 'Failed to send reset link.');
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);
    try {
      await updatePassword(newPassword);
      setPasswordMessage('Password updated. You can now sign in with your new password.');
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : 'Failed to update password.');
    }
  };

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Access your saved IPL squads, Playing XI builder, and team analytics.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<GoogleIcon />}
            disabled={busy}
            onClick={handleGoogle}
            sx={{ mb: 2.5, py: 1.25 }}
          >
            Continue with Google
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OR SIGN IN WITH EMAIL
            </Typography>
          </Divider>

          <Stack component="form" spacing={2} onSubmit={handleEmailLogin}>
            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
              <MuiLink
                component="button"
                type="button"
                variant="caption"
                onClick={() => {
                  setResetEmail(email);
                  setResetOpen(true);
                }}
              >
                Forgot password?
              </MuiLink>
            </Stack>
            <Button type="submit" variant="outlined" size="large" disabled={busy}>
              Sign In with Email
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            New franchise manager?{' '}
            <MuiLink component={Link} to="/register" sx={{ fontWeight: 600 }}>
              Create an account
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Account Email"
              type="email"
              fullWidth
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            {resetMessage && <Alert severity="info">{resetMessage}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setResetOpen(false)} color="inherit">Close</Button>
          <Button onClick={handleReset} variant="contained">Send Reset Link</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isRecovery} maxWidth="xs" fullWidth>
        <DialogTitle>Choose a New Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {passwordMessage && <Alert severity="info">{passwordMessage}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => navigate('/login', { replace: true })}
            color="inherit"
          >
            Close
          </Button>
          <Button onClick={handlePasswordUpdate} variant="contained" disabled={!newPassword}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
