import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Hospitals from "./pages/Hospitals";
import Emergency from "./pages/Emergency";
import Transfers from "./pages/Transfers";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import PublicSOS from "./pages/PublicSOS";
import AdminDashboard from "./pages/AdminDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import DispatcherConsole from "./pages/DispatcherConsole";

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "coordinator") return <CoordinatorDashboard />;
  if (user.role === "dispatcher") return <DispatcherConsole />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Unauthenticated Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/sos" element={<PublicSOS />} />

          {/* Role Landing Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
            <Route path="/coordinator" element={<CoordinatorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["dispatcher"]} />}>
            <Route path="/dispatcher" element={<DispatcherConsole />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "coordinator", "dispatcher"]} />}>
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          {/* Root and Dashboard Fallback Routes */}
          <Route path="/" element={<DashboardRouter />} />
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}