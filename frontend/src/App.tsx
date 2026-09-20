import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import Emergency from "./pages/Emergency";
import Transfers from "./pages/Transfers";
import Analytics from "./pages/Analytics";
import HospitalAdmin from "./pages/HospitalAdmin";
import Login from "./pages/Login";
import PublicSOS from "./pages/PublicSOS";
import AdminDashboard from "./pages/AdminDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import DispatcherConsole from "./pages/DispatcherConsole";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Unauthenticated Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/sos" element={<PublicSOS />} />

          {/* Protected Routes (JWT Role Guarded) */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
            <Route path="/coordinator" element={<CoordinatorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["dispatcher"]} />}>
            <Route path="/dispatcher" element={<DispatcherConsole />} />
          </Route>

          {/* General Command Center Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/transfers" element={<Transfers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/hospital-admin" element={<HospitalAdmin />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}