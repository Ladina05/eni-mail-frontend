import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { MailboxPage } from "./pages/inbox/MailboxPage";
import { ComposePage } from "./pages/inbox/ComposePage";
import { SentPage } from "./pages/sent/SentPage";
import { DraftsPage } from "./pages/drafts/DraftsPage";
import { ContactsPage } from "./pages/contacts/ContactsPage";
import { GroupsPage } from "./pages/groups/GroupsPage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { AdminPage } from "./pages/admin/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route
                    path="inbox"
                    element={<MailboxPage folder="inbox" />}
                  />
                  <Route path="sent" element={<SentPage />} />
                  <Route path="drafts" element={<DraftsPage />} />
                  <Route
                    path="archive"
                    element={<MailboxPage folder="archive" />}
                  />
                  <Route
                    path="trash"
                    element={<MailboxPage folder="trash" />}
                  />
                  <Route path="compose" element={<ComposePage />} />
                  <Route path="contacts" element={<ContactsPage />} />
                  <Route path="groups" element={<GroupsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="admin" element={<AdminPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
