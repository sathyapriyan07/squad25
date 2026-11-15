import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingState, EmptyState } from '../../components/common/CommonUi';
import { AppLayout } from '../../components/layout/AppLayout';
import { HomePage } from '../../pages/Home/HomePage';
import { SeasonsPage } from '../../pages/Seasons/SeasonsPage';
import { FranchisesPage } from '../../pages/Franchises/FranchisesPage';
import { PlayersPage } from '../../pages/Players/PlayersPage';
import { PlayerDetailPage } from '../../pages/Players/PlayerDetailPage';
import { SharedSquadPage } from '../../pages/SharedSquad/SharedSquadPage';
import { LoginPage } from '../../pages/Auth/LoginPage';
import { RegisterPage } from '../../pages/Auth/RegisterPage';
import { DashboardPage } from '../../pages/Dashboard/DashboardPage';
import { SquadBuilderPage } from '../../pages/SquadBuilder/SquadBuilderPage';
import { PlayingXIBuilderPage } from '../../pages/PlayingXI/PlayingXIBuilderPage';
import { ComparisonPage } from '../../pages/Comparison/ComparisonPage';
import { AnalyticsPage } from '../../pages/Analytics/AnalyticsPage';
import { SavedSquadsPage } from '../../pages/SavedSquads/SavedSquadsPage';
import { ProfilePage } from '../../pages/Profile/ProfilePage';
import { SettingsPage } from '../../pages/Settings/SettingsPage';
import { AdminDashboardPage } from '../../pages/admin/AdminDashboardPage';
import { SeasonsManagementPage } from '../../pages/admin/SeasonsManagementPage';
import { TeamsManagementPage } from '../../pages/admin/TeamsManagementPage';
import { PlayersManagementPage } from '../../pages/admin/PlayersManagementPage';
import { StatisticsManagementPage } from '../../pages/admin/StatisticsManagementPage';
import { RatingsManagementPage } from '../../pages/admin/RatingsManagementPage';
import { EligibilityManagementPage } from '../../pages/admin/EligibilityManagementPage';
import { RulesManagementPage } from '../../pages/admin/RulesManagementPage';
import { ImportsManagementPage } from '../../pages/admin/ImportsManagementPage';
import { AdminSquadsPage, AdminUsersPage } from '../../pages/admin/AdminSquadsAndUsersPage';

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
    </AppLayout>
  );
}
