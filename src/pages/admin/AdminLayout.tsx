import type { ReactNode } from 'react';
import { Box, Chip, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const ADMIN_TABS = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Seasons', path: '/admin/seasons' },
  { label: 'Franchises', path: '/admin/teams' },
  { label: 'Players', path: '/admin/players' },
  { label: 'Statistics', path: '/admin/player-statistics' },
  { label: 'Ratings', path: '/admin/player-ratings' },
  { label: 'Eligibility', path: '/admin/eligibility' },
  { label: 'Squad Rules', path: '/admin/rules' },
  { label: 'Excel Imports', path: '/admin/imports' },
  { label: 'User Squads', path: '/admin/squads' },
  { label: 'Users', path: '/admin/users' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = ADMIN_TABS.findIndex((t) => t.path === location.pathname);

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: 1.5, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Stack direction="row" sx={{ px: 1, pb: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Admin Console</Typography>
            <Chip size="small" label="Role: Admin" color="warning" sx={{ height: 20, fontSize: '0.68rem' }} />
          </Stack>
        </Stack>
        <Tabs
          value={currentTab === -1 ? 0 : currentTab}
          onChange={(_, idx) => navigate(ADMIN_TABS[idx].path)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          {ADMIN_TABS.map((tab) => (
            <Tab key={tab.path} label={tab.label} sx={{ minHeight: 40, py: 0.75 }} />
          ))}
        </Tabs>
      </Paper>
      <Box>{children}</Box>
    </Stack>
  );
}
