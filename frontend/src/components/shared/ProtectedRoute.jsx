import { Navigate, Outlet, useLocation } from "react-router-dom";

import LoadingState from "@/components/shared/LoadingState";
import { useAuth } from "@/context/auth-context";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

