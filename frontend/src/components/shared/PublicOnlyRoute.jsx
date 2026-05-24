import { Navigate, Outlet } from "react-router-dom";

import LoadingState from "@/components/shared/LoadingState";
import { useAuth } from "@/context/auth-context";

export default function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-shell">
        <LoadingState />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

