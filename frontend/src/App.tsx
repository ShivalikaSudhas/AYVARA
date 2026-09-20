import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Sidebar from "./components/common/Sidebar";

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

function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isPublicSOS = location.pathname === "/sos";

  const isProtectedRolePage =
    location.pathname === "/admin" ||
    location.pathname === "/coordinator" ||
    location.pathname === "/dispatcher";

  const showSidebar =
    !isLoginPage && !isPublicSOS && !isProtectedRolePage;

  return (
    <>
      {showSidebar && <Sidebar />}

      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Unauthenticated Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/sos" element={<PublicSOS />} />

          {/* Protected Admin Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["admin"]} />}
          >
            <Route
              path="/admin"
              element={
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              }
            />
          </Route>

          {/* Protected Coordinator Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["coordinator"]} />}
          >
            <Route
              path="/coordinator"
              element={
                <PageTransition>
                  <CoordinatorDashboard />
                </PageTransition>
              }
            />
          </Route>

          {/* Protected Dispatcher Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["dispatcher"]} />}
          >
            <Route
              path="/dispatcher"
              element={
                <PageTransition>
                  <DispatcherConsole />
                </PageTransition>
              }
            />
          </Route>

          {/* General Command Center Routes */}
          <Route
            path="/"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />

          <Route
            path="/hospitals"
            element={
              <PageTransition>
                <Hospitals />
              </PageTransition>
            }
          />

          <Route
            path="/emergency"
            element={
              <PageTransition>
                <Emergency />
              </PageTransition>
            }
          />

          <Route
            path="/transfers"
            element={
              <PageTransition>
                <Transfers />
              </PageTransition>
            }
          />

          <Route
            path="/analytics"
            element={
              <PageTransition>
                <Analytics />
              </PageTransition>
            }
          />

          <Route
            path="/hospital-admin"
            element={
              <PageTransition>
                <HospitalAdmin />
              </PageTransition>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}