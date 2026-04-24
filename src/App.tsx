import { Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from '@/components/common/error-boundary';
import { GuestRoute, ProtectedRoute } from '@/components/common/protected-route';
import { ControlPanelLayout, StudentLayout } from '@/layouts/app-layout';
import { AuthLayout } from '@/layouts/auth-layout';
import { PublicLayout } from '@/layouts/public-layout';
import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminEventDetailsPage } from '@/pages/admin/AdminEventDetailsPage';
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage';
import { AnnouncementManagerPage } from '@/pages/admin/AnnouncementManagerPage';
import { ApprovalQueuePage } from '@/pages/admin/ApprovalQueuePage';
import { CreateEventPage } from '@/pages/admin/CreateEventPage';
import { EditEventPage } from '@/pages/admin/EditEventPage';
import { ManageClubsPage } from '@/pages/admin/ManageClubsPage';
import { ManageEventsPage } from '@/pages/admin/ManageEventsPage';
import { QrAttendancePage } from '@/pages/admin/QrAttendancePage';
import { BrowseEventsPage } from '@/pages/public/BrowseEventsPage';
import { EventPreviewPage } from '@/pages/public/EventPreviewPage';
import { LandingPage } from '@/pages/public/LandingPage';
import { CertificateCenterPage } from '@/pages/student/CertificateCenterPage';
import { ClubDetailsPage } from '@/pages/student/ClubDetailsPage';
import { ClubsPage } from '@/pages/student/ClubsPage';
import { DashboardPage } from '@/pages/student/DashboardPage';
import { EventDetailsPage } from '@/pages/student/EventDetailsPage';
import { EventsPage } from '@/pages/student/EventsPage';
import { LeaderboardPage } from '@/pages/student/LeaderboardPage';
import { MyRegistrationsPage } from '@/pages/student/MyRegistrationsPage';
import { NotificationsPage } from '@/pages/student/NotificationsPage';
import { ProfilePage } from '@/pages/student/ProfilePage';
import { SavedEventsPage } from '@/pages/student/SavedEventsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route element={<LandingPage />} path="/" />
          <Route element={<BrowseEventsPage />} path="/browse" />
          <Route element={<EventPreviewPage />} path="/events/:slug" />
        </Route>

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route element={<SignInPage />} path="/signin" />
            <Route element={<SignUpPage />} path="/signup" />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['student']} />}>
          <Route element={<StudentLayout />}>
            <Route element={<DashboardPage />} path="/app" />
            <Route element={<EventsPage />} path="/app/events" />
            <Route element={<MyRegistrationsPage />} path="/app/attendance" />
            <Route element={<EventDetailsPage />} path="/app/events/:slug" />
            <Route element={<ClubsPage />} path="/app/clubs" />
            <Route element={<ClubDetailsPage />} path="/app/clubs/:slug" />
            <Route element={<LeaderboardPage />} path="/app/leaderboard" />
            <Route element={<NotificationsPage />} path="/app/notifications" />
            <Route element={<ProfilePage />} path="/app/profile" />
            <Route element={<SavedEventsPage />} path="/app/saved" />
            <Route element={<MyRegistrationsPage />} path="/app/registrations" />
            <Route element={<CertificateCenterPage />} path="/app/certificates" />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allow={['organizer', 'admin']} />}>
          <Route element={<ControlPanelLayout />}>
            <Route element={<AdminDashboardPage />} path="/admin" />
            <Route element={<ManageEventsPage />} path="/admin/events" />
            <Route element={<CreateEventPage />} path="/admin/events/create" />
            <Route element={<EditEventPage />} path="/admin/events/:id/edit" />
            <Route element={<AdminEventDetailsPage />} path="/admin/events/view/:slug" />
            <Route element={<ManageClubsPage />} path="/admin/clubs" />
            <Route element={<AnnouncementManagerPage />} path="/admin/announcements" />
            <Route element={<QrAttendancePage />} path="/admin/attendance" />
            <Route element={<ProtectedRoute allow={['admin']} />}>
              <Route element={<ApprovalQueuePage />} path="/admin/approvals" />
              <Route element={<AnalyticsPage />} path="/admin/analytics" />
            </Route>
          </Route>
        </Route>

        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </ErrorBoundary>
  );
}
