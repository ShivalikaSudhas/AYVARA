import { Navigate, Outlet } from "react-router-dom";
import { useAuth, UserRole } from "../../context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role if trying to access unauthorized page
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "coordinator") return <Navigate to="/coordinator" replace />;
    if (user.role === "dispatcher") return <Navigate to="/dispatcher" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
