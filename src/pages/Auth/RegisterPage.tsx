import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { Link, useNavigate } from 'react-router-dom';
import { registerWithEmail, signInWithGoogle } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const showSnackbar = useAppStore((s) => s.showSnackbar);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      const profile = await signInWithGoogle();
      if (profile) {
        setUser(profile);
        showSnackbar('Account ready!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      const profile = await registerWithEmail(email, password, displayName);
      if (profile) {
        setUser(profile);
        showSnackbar('Account created! Welcome to IPL Squad Builder.', 'success');
        navigate('/dashboard');
      } else {
        showSnackbar('Account created. Check your email to confirm your address, then sign in.', 'info');
        navigate('/login');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 440, mx: 'auto', py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start building and comparing custom IPL squads across seasons.
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
            Sign Up with Google
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OR REGISTER WITH EMAIL
            </Typography>
          </Divider>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="Manager Name"
              required
              fullWidth
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
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
              helperText="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="outlined" size="large" disabled={busy}>
              Register Account
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
              Sign In
            </MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
