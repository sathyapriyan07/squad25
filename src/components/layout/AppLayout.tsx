import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  AppBar,
  Avatar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import GroupsIcon from '@mui/icons-material/Groups';
import ShieldIcon from '@mui/icons-material/Shield';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useUserSquads } from '../../hooks/useSquads';
import { logoutUser } from '../../services/authService';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { DESIGN_TOKENS } from '../../app/theme/theme';

const EXPANDED_WIDTH = 250;
const COLLAPSED_WIDTH = 76;

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  matchPrefixes?: string[];
}

export function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const {
    selectedTeamId,
    sidebarOpen,
    sidebarCollapsed,
    snackbar,
    setSelectedSeasonId,
    setSidebarOpen,
    toggleSidebarCollapsed,
    closeSnackbar,
    showSnackbar,
  } = useAppStore();

  const { catalog, activeSeason } = useCatalog();
  const { data: userSquads = [] } = useUserSquads();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const selectedTeam = useMemo(
    () => catalog?.teams.find((t) => t.id === selectedTeamId),
    [catalog, selectedTeamId]
  );
  const accentColor = selectedTeam?.primaryColor || '#3B82F6';

  const latestSquadId = userSquads[0]?.id;

  const mainNav: NavItem[] = [
    { label: 'Overview', path: '/', icon: <HomeIcon fontSize="small" /> },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Build Squad', path: '/builder', icon: <BuildIcon fontSize="small" />, matchPrefixes: ['/builder'] },
    { label: 'Players', path: '/players', icon: <GroupsIcon fontSize="small" /> },
    { label: 'Franchises', path: '/franchises', icon: <ShieldIcon fontSize="small" /> },
    { label: 'Seasons', path: '/seasons', icon: <CalendarMonthIcon fontSize="small" /> },
    { label: 'Compare Squads', path: '/comparison', icon: <CompareArrowsIcon fontSize="small" /> },
    { label: 'Saved Squads', path: '/saved-squads', icon: <BookmarkIcon fontSize="small" /> },
  ];

  const managementNav: NavItem[] = [
    {
      label: 'Team Analytics',
      path: latestSquadId ? `/analytics/${latestSquadId}` : '/saved-squads',
      icon: <AnalyticsIcon fontSize="small" />,
      matchPrefixes: ['/analytics'],
    },
    {
      label: 'Playing XI Builder',
      path: latestSquadId ? `/playing-xi/${latestSquadId}` : '/saved-squads',
      icon: <FormatListNumberedIcon fontSize="small" />,
      matchPrefixes: ['/playing-xi'],
    },
  ];

  const isRouteActive = (item: NavItem) => {
    if (item.path === '/' && location.pathname === '/') return true;
    if (item.path !== '/' && location.pathname === item.path) return true;
    if (item.matchPrefixes?.some((p) => location.pathname.startsWith(p))) return true;
    return false;
  };

  const breadcrumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Overview', path: '/' }];
    return [
      { label: 'Home', path: '/' },
      ...parts.map((part, idx) => ({
        label: part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        path: `/${parts.slice(0, idx + 1).join('/')}`,
      })),
    ];
  }, [location.pathname]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logoutUser();
    showSnackbar('Signed out successfully', 'info');
    navigate('/');
  };

  const drawerWidth = isMobile ? EXPANDED_WIDTH : sidebarCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const renderNavItem = (item: NavItem) => {
    const active = isRouteActive(item);
    const button = (
      <ListItemButton
        key={item.label}
        component={Link}
        to={item.path}
        onClick={() => isMobile && setSidebarOpen(false)}
        sx={{
          mx: 1,
          my: 0.35,
          px: sidebarCollapsed && !isMobile ? 1.5 : 1.75,
          py: 1,
          borderRadius: '10px',
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
          position: 'relative',
          color: active ? '#FFFFFF' : 'text.secondary',
          bgcolor: active ? `${accentColor}20` : 'transparent',
          '&::before': active
            ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 8,
                bottom: 8,
                width: 3,
                borderRadius: '0 3px 3px 0',
                bgcolor: accentColor,
              }
            : undefined,
          '&:hover': {
            bgcolor: active ? `${accentColor}28` : 'rgba(255,255,255,0.04)',
            color: '#FFFFFF',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: sidebarCollapsed && !isMobile ? 0 : 34,
            color: active ? accentColor : 'inherit',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {(!sidebarCollapsed || isMobile) && (
          <ListItemText
            primary={item.label}
            slotProps={{
              primary: {
                noWrap: true,
                sx: { fontSize: '0.86rem', fontWeight: active ? 600 : 500 },
              },
            }}
          />
        )}
      </ListItemButton>
    );

    if (sidebarCollapsed && !isMobile) {
      return (
        <Tooltip key={item.label} title={item.label} placement="right">
          {button}
        </Tooltip>
      );
    }
    return button;
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: DESIGN_TOKENS.bgSecondary,
        borderRight: `1px solid ${DESIGN_TOKENS.border}`,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
          px: 2,
          height: 64,
          borderBottom: `1px solid ${DESIGN_TOKENS.border}`,
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          component={Link}
          to="/"
          sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${accentColor}, #1E293B)`,
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            IPL
          </Box>
          {(!sidebarCollapsed || isMobile) && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.1 }}
              >
                IPL SQUAD
              </Typography>
              <Typography variant="caption" sx={{ color: accentColor, fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.65rem' }}>
                BUILDER
              </Typography>
            </Box>
          )}
        </Stack>
        {!isMobile && !sidebarCollapsed && (
          <IconButton size="small" onClick={toggleSidebarCollapsed} aria-label="Collapse sidebar">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {(!sidebarCollapsed || isMobile) && (
          <Typography variant="caption" sx={{ px: 2.5, py: 0.75, display: 'block', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.08em' }}>
            MAIN
          </Typography>
        )}
        <List disablePadding>{mainNav.map(renderNavItem)}</List>

        <Divider sx={{ my: 1.5, mx: 2 }} />
        {(!sidebarCollapsed || isMobile) && (
          <Typography variant="caption" sx={{ px: 2.5, py: 0.75, display: 'block', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.08em' }}>
            MANAGEMENT
          </Typography>
        )}
        <List disablePadding>{managementNav.map(renderNavItem)}</List>

        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 1.5, mx: 2 }} />
            {(!sidebarCollapsed || isMobile) && (
              <Typography variant="caption" sx={{ px: 2.5, py: 0.75, display: 'block', color: 'text.disabled', fontWeight: 700, letterSpacing: '0.08em' }}>
                ADMINISTRATION
              </Typography>
            )}
            <List disablePadding>
              {renderNavItem({
                label: 'Admin Console',
                path: '/admin',
                icon: <AdminPanelSettingsIcon fontSize="small" />,
                matchPrefixes: ['/admin'],
              })}
            </List>
          </>
        )}
      </Box>

      <Box sx={{ borderTop: `1px solid ${DESIGN_TOKENS.border}`, py: 1 }}>
        <List disablePadding>
          {user ? (
            <>
              {renderNavItem({ label: 'Settings', path: '/settings', icon: <SettingsIcon fontSize="small" /> })}
              {renderNavItem({ label: 'Profile', path: '/profile', icon: <PersonIcon fontSize="small" /> })}
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  mx: 1,
                  my: 0.35,
                  px: sidebarCollapsed && !isMobile ? 1.5 : 1.75,
                  py: 1,
                  borderRadius: '10px',
                  justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: 'error.main' },
                }}
              >
                <ListItemIcon sx={{ minWidth: sidebarCollapsed && !isMobile ? 0 : 34, color: 'inherit', justifyContent: 'center' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {(!sidebarCollapsed || isMobile) && (
                  <ListItemText
                    primary="Logout"
                    slotProps={{ primary: { sx: { fontSize: '0.86rem', fontWeight: 500 } } }}
                  />
                )}
              </ListItemButton>
            </>
          ) : (
            renderNavItem({ label: 'Sign In', path: '/login', icon: <LoginIcon fontSize="small" /> })
          )}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: DESIGN_TOKENS.bgMain }}>
      {!isMobile && (
        <Box component="nav" sx={{ width: drawerWidth, flexShrink: 0, transition: 'width 180ms ease' }}>
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                transition: 'width 180ms ease',
                borderRight: `1px solid ${DESIGN_TOKENS.border}`,
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        </Box>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: EXPANDED_WIDTH } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, pb: isMobile ? 8 : 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(9,11,16,0.86)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${DESIGN_TOKENS.border}`,
            height: 64,
            justifyContent: 'center',
          }}
        >
          <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1.5, md: 3 }, justifyContent: 'space-between', gap: 1.5 }}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
              {isMobile ? (
                <IconButton onClick={() => setSidebarOpen(true)} edge="start" aria-label="Open menu">
                  <MenuIcon />
                </IconButton>
              ) : (
                sidebarCollapsed && (
                  <IconButton onClick={toggleSidebarCollapsed} size="small" aria-label="Expand sidebar">
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                )
              )}

              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{ display: { xs: 'none', sm: 'flex' }, '& .MuiBreadcrumbs-separator': { color: 'text.disabled' } }}
              >
                {breadcrumbs.map((b, idx) =>
                  idx === breadcrumbs.length - 1 ? (
                    <Typography key={b.path} variant="body2" color="text.primary" noWrap sx={{ fontWeight: 600 }}>
                      {b.label}
                    </Typography>
                  ) : (
                    <MuiLink
                      key={b.path}
                      component={Link}
                      to={b.path}
                      underline="hover"
                      color="text.secondary"
                      variant="body2"
                    >
                      {b.label}
                    </MuiLink>
                  )
                )}
              </Breadcrumbs>
            </Stack>

            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
              <Select
                size="small"
                value={activeSeason?.id || ''}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                sx={{
                  height: 36,
                  minWidth: { xs: 112, sm: 136 },
                  bgcolor: DESIGN_TOKENS.bgCard,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                {(catalog?.seasons || []).map((season) => (
                  <MenuItem key={season.id} value={season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>

              <Tooltip title="Season & Squad Alerts">
                <IconButton
                  size="small"
                  onClick={(e) => setNotifAnchor(e.currentTarget)}
                  sx={{ border: `1px solid ${DESIGN_TOKENS.border}`, borderRadius: '10px', width: 36, height: 36 }}
                >
                  <Badge badgeContent={userSquads.length > 0 ? 1 : 0} color="primary">
                    <NotificationsIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      width: 310,
                      p: 2,
                      bgcolor: DESIGN_TOKENS.bgSecondary,
                      border: `1px solid ${DESIGN_TOKENS.borderStrong}`,
                    },
                  },
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Season & Roster Brief
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Stack spacing={1.25}>
                  <Alert severity="info" variant="outlined" sx={{ py: 0.5 }}>
                    Active Cycle: <strong>{activeSeason?.name || 'IPL 2025'}</strong> — Impact Player{' '}
                    {activeSeason?.impactPlayerEnabled ? 'Enabled' : 'Disabled'}.
                  </Alert>
                  {user && (
                    <Typography variant="caption" color="text.secondary">
                      You have {userSquads.length} saved custom squad{userSquads.length === 1 ? '' : 's'}.
                    </Typography>
                  )}
                </Stack>
              </Popover>

              {user ? (
                <>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.25 }}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: accentColor,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    slotProps={{
                      paper: {
                        sx: {
                          minWidth: 210,
                          bgcolor: DESIGN_TOKENS.bgSecondary,
                          border: `1px solid ${DESIGN_TOKENS.borderStrong}`,
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2" noWrap>{user.displayName}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {user.email || 'Franchise Manager'}
                      </Typography>
                      {user.role === 'admin' && (
                        <Chip size="small" label="Admin" color="warning" sx={{ mt: 0.75, height: 20, fontSize: '0.68rem' }} />
                      )}
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>Profile</MenuItem>
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/saved-squads'); }}>Saved Squads</MenuItem>
                    <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>Settings</MenuItem>
                    {user.role === 'admin' && (
                      <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin'); }}>Admin Console</MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  size="small"
                  startIcon={<LoginIcon fontSize="small" />}
                  sx={{ height: 36 }}
                >
                  Sign In
                </Button>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 2.5, md: 3 }, maxWidth: 1600, width: '100%', mx: 'auto' }}>
          {children}
        </Box>
      </Box>

      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            borderTop: `1px solid ${DESIGN_TOKENS.border}`,
          }}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(_, val) => navigate(val)}
            sx={{ bgcolor: DESIGN_TOKENS.bgSecondary, height: 60 }}
          >
            <BottomNavigationAction label="Home" value="/" icon={<HomeIcon fontSize="small" />} />
            <BottomNavigationAction label="Build" value="/builder" icon={<BuildIcon fontSize="small" />} />
            <BottomNavigationAction label="Players" value="/players" icon={<GroupsIcon fontSize="small" />} />
            <BottomNavigationAction label="Saved" value="/saved-squads" icon={<BookmarkIcon fontSize="small" />} />
            <BottomNavigationAction label="Compare" value="/comparison" icon={<CompareArrowsIcon fontSize="small" />} />
          </BottomNavigation>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3800}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: '10px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
