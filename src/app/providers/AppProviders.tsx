import { useEffect, useMemo, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createIplTheme } from '../theme/theme';
import { subscribeToAuth, syncUserProfile } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabase/client';
import { useAuthStore } from '../../store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const { setUser, setLoading, setInitialized } = useAuthStore();
  const theme = useMemo(() => createIplTheme(), []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    const unsub = subscribeToAuth(async (authUser) => {
      setLoading(true);
      try {
        if (authUser) {
          const profile = await syncUserProfile(authUser);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth profile sync error:', err);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });
    return () => unsub();
  }, [setUser, setLoading, setInitialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
