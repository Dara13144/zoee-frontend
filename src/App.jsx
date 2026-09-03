import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import StreamerSearch from './pages/StreamerSearch';
import StreamerProfile from './pages/StreamerProfile';
import PublicDonationPage from './pages/PublicDonationPage';
import LeaderboardAvatar from './pages/LeaderboardAvatar';
import Donate from './pages/Donate';
import OBSAlert from './pages/OBSAlert';
import OBSLeaderboard from './pages/OBSLeaderboard';
import OBSGoal from './pages/OBSGoal';
import OBSTicker from './pages/OBSTicker';
import BecomeStreamer from './pages/BecomeStreamer';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import Donations from './pages/dashboard/Donations';
import Goals from './pages/dashboard/Goals';
import DonationPageSettings from './pages/dashboard/DonationPageSettings';
import LeaderboardSettings from './pages/dashboard/LeaderboardSettings';
import TickerSettings from './pages/dashboard/TickerSettings';
import AlertSettings from './pages/dashboard/AlertSettings';
import TelegramSettings from './pages/dashboard/TelegramSettings';
import ProfileSettings from './pages/dashboard/ProfileSettings';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Web Pages with Main Navigation Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<StreamerSearch />} />
            <Route path="become-streamer" element={<BecomeStreamer />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Public Creator Donation & Tip Pages */}
            <Route path="tip" element={<StreamerSearch />} />
            <Route path="tip/:username" element={<PublicDonationPage />} />
            <Route path="tip/@:username" element={<PublicDonationPage />} />
            <Route path="donate/:username" element={<PublicDonationPage />} />
            <Route path="streamer/:username" element={<PublicDonationPage />} />
            <Route path="@:username" element={<PublicDonationPage />} />
            
            {/* Real-time Public Leaderboard Avatar Pages */}
            <Route path="leaderboard-avatar/:username" element={<LeaderboardAvatar />} />
            <Route path="leaderboard/:username" element={<LeaderboardAvatar />} />
          </Route>

          {/* Standalone OBS Browser Source Overlays (Clean, Transparent) */}
          <Route path="/alert/:username" element={<OBSAlert />} />
          <Route path="/overlay/supporters/:username" element={<OBSLeaderboard />} />
          <Route path="/overlay/leaderboard/:username" element={<OBSLeaderboard />} />
          <Route path="/widget/supporters/:username" element={<OBSLeaderboard />} />
          <Route path="/overlay/goal/:username" element={<OBSGoal />} />
          <Route path="/overlay/target/:username" element={<OBSGoal />} />
          <Route path="/widget/goal/:username" element={<OBSGoal />} />
          <Route path="/ticker/:username" element={<OBSTicker />} />
          <Route path="/overlay/ticker/:username" element={<OBSTicker />} />

          {/* Streamer Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="donation-page" element={<DonationPageSettings />} />
            <Route path="leaderboard" element={<LeaderboardSettings />} />
            <Route path="leaderboard-settings" element={<LeaderboardSettings />} />
            <Route path="ticker" element={<TickerSettings />} />
            <Route path="donations" element={<Donations />} />
            <Route path="goals" element={<Goals />} />
            <Route path="alerts" element={<AlertSettings />} />
            <Route path="telegram" element={<TelegramSettings />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>

          {/* Admin Management Suite */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
