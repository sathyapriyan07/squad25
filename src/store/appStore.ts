import { create } from 'zustand';

interface AppState {
  selectedSeasonId: string;
  selectedTeamId: string;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  snackbar: { open: boolean; message: string; severity: 'success' | 'info' | 'warning' | 'error' };
  setSelectedSeasonId: (seasonId: string) => void;
  setSelectedTeamId: (teamId: string) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  showSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  closeSnackbar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedSeasonId: '',
  selectedTeamId: '',
  sidebarOpen: false,
  sidebarCollapsed: false,
  snackbar: { open: false, message: '', severity: 'info' },
  setSelectedSeasonId: (selectedSeasonId) => set({ selectedSeasonId }),
  setSelectedTeamId: (selectedTeamId) => set({ selectedTeamId }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  showSnackbar: (message, severity = 'success') =>
    set({ snackbar: { open: true, message, severity } }),
  closeSnackbar: () =>
    set((s) => ({ snackbar: { ...s.snackbar, open: false } })),
}));
