import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingState, EmptyState } from '../../components/common/CommonUi';
import { AppLayout } from '../../components/layout/AppLayout';

const HomePage = lazy(() => import('../../pages/Home/HomePage').then((module) => ({ default: module.HomePage })));
const SeasonsPage = lazy(() => import('../../pages/Seasons/SeasonsPage').then((module) => ({ default: module.SeasonsPage })));
const FranchisesPage = lazy(() => import('../../pages/Franchises/FranchisesPage').then((module) => ({ default: module.FranchisesPage })));
const PlayersPage = lazy(() => import('../../pages/Players/PlayersPage').then((module) => ({ default: module.PlayersPage })));
const PlayerDetailPage = lazy(() => import('../../pages/Players/PlayerDetailPage').then((module) => ({ default: module.PlayerDetailPage })));
const SharedSquadPage = lazy(() => import('../../pages/SharedSquad/SharedSquadPage').then((module) => ({ default: module.SharedSquadPage })));
const LoginPage = lazy(() => import('../../pages/Auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('../../pages/Auth/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('../../pages/Dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const SquadBuilderPage = lazy(() => import('../../pages/SquadBuilder/SquadBuilderPage').then((module) => ({ default: module.SquadBuilderPage })));
const PlayingXIBuilderPage = lazy(() => import('../../pages/PlayingXI/PlayingXIBuilderPage').then((module) => ({ default: module.PlayingXIBuilderPage })));
const ComparisonPage = lazy(() => import('../../pages/Comparison/ComparisonPage').then((module) => ({ default: module.ComparisonPage })));
const AnalyticsPage = lazy(() => import('../../pages/Analytics/AnalyticsPage').then((module) => ({ default: module.AnalyticsPage })));
const SavedSquadsPage = lazy(() => import('../../pages/SavedSquads/SavedSquadsPage').then((module) => ({ default: module.SavedSquadsPage })));
const ProfilePage = lazy(() => import('../../pages/Profile/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import('../../pages/Settings/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const AdminDashboardPage = lazy(() => import('../../pages/admin/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const SeasonsManagementPage = lazy(() => import('../../pages/admin/SeasonsManagementPage').then((module) => ({ default: module.SeasonsManagementPage })));
const TeamsManagementPage = lazy(() => import('../../pages/admin/TeamsManagementPage').then((module) => ({ default: module.TeamsManagementPage })));
const PlayersManagementPage = lazy(() => import('../../pages/admin/PlayersManagementPage').then((module) => ({ default: module.PlayersManagementPage })));
const StatisticsManagementPage = lazy(() => import('../../pages/admin/StatisticsManagementPage').then((module) => ({ default: module.StatisticsManagementPage })));
const RatingsManagementPage = lazy(() => import('../../pages/admin/RatingsManagementPage').then((module) => ({ default: module.RatingsManagementPage })));
const EligibilityManagementPage = lazy(() => import('../../pages/admin/EligibilityManagementPage').then((module) => ({ default: module.EligibilityManagementPage })));
const RulesManagementPage = lazy(() => import('../../pages/admin/RulesManagementPage').then((module) => ({ default: module.RulesManagementPage })));
const ImportsManagementPage = lazy(() => import('../../pages/admin/ImportsManagementPage').then((module) => ({ default: module.ImportsManagementPage })));
const AdminSquadsPage = lazy(() =>
  import('../../pages/admin/AdminSquadsAndUsersPage').then((module) => ({ default: module.AdminSquadsPage }))
);
const AdminUsersPage = lazy(() =>
  import('../../pages/admin/AdminSquadsAndUsersPage').then((module) => ({ default: module.AdminUsersPage }))
);

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();
  if (!initialized) return <LoadingState count={3} />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();
  if (!initialized) return <LoadingState count={3} />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'admin') {
    return (
      <EmptyState
        title="Admin Access Required"
        description="Your account does not have administrator privileges to access this module."
      />
    );
  }
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingState count={3} />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/seasons" element={<SeasonsPage />} />
        <Route path="/franchises" element={<FranchisesPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerDetailPage />} />
        <Route path="/squad/:shareSlug" element={<SharedSquadPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Routes */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/builder" element={<RequireAuth><SquadBuilderPage /></RequireAuth>} />
        <Route path="/builder/:squadId" element={<RequireAuth><SquadBuilderPage /></RequireAuth>} />
        <Route path="/playing-xi/:squadId" element={<RequireAuth><PlayingXIBuilderPage /></RequireAuth>} />
        <Route path="/comparison" element={<RequireAuth><ComparisonPage /></RequireAuth>} />
        <Route path="/analytics/:squadId" element={<RequireAuth><AnalyticsPage /></RequireAuth>} />
        <Route path="/saved-squads" element={<RequireAuth><SavedSquadsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
        <Route path="/admin/seasons" element={<RequireAdmin><SeasonsManagementPage /></RequireAdmin>} />
        <Route path="/admin/teams" element={<RequireAdmin><TeamsManagementPage /></RequireAdmin>} />
        <Route path="/admin/players" element={<RequireAdmin><PlayersManagementPage /></RequireAdmin>} />
        <Route path="/admin/player-statistics" element={<RequireAdmin><StatisticsManagementPage /></RequireAdmin>} />
        <Route path="/admin/player-ratings" element={<RequireAdmin><RatingsManagementPage /></RequireAdmin>} />
        <Route path="/admin/eligibility" element={<RequireAdmin><EligibilityManagementPage /></RequireAdmin>} />
        <Route path="/admin/rules" element={<RequireAdmin><RulesManagementPage /></RequireAdmin>} />
        <Route path="/admin/imports" element={<RequireAdmin><ImportsManagementPage /></RequireAdmin>} />
        <Route path="/admin/squads" element={<RequireAdmin><AdminSquadsPage /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
