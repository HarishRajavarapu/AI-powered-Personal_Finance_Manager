import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PublicOnlyRoute from "@/components/shared/PublicOnlyRoute";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";
import AppLayout from "@/layouts/AppLayout";

const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const BudgetsPage = lazy(() => import("@/pages/BudgetsPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const InsightsPage = lazy(() => import("@/pages/InsightsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));

function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      richColors
      closeButton
      theme={theme === "system" ? "system" : theme}
      position="top-right"
    />
  );
}

function PageFallback() {
  return (
    <div className="page-shell">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card h-36 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="finance-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<PublicOnlyRoute />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<Navigate to="/" replace />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="budgets" element={<BudgetsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="insights" element={<InsightsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <AppToaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
