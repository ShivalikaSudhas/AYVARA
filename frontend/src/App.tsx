import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import Emergency from "./pages/Emergency";
import Transfers from "./pages/Transfers";
import Analytics from "./pages/Analytics";
import HospitalAdmin from "./pages/HospitalAdmin";
import Login from "./pages/Login";

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

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          }
        />

        {/* Hospitals */}
        <Route
          path="/hospitals"
          element={
            <PageTransition>
              <Hospitals />
            </PageTransition>
          }
        />

        {/* Emergency */}
        <Route
          path="/emergency"
          element={
            <PageTransition>
              <Emergency />
            </PageTransition>
          }
        />

        {/* Transfers */}
        <Route
          path="/transfers"
          element={
            <PageTransition>
              <Transfers />
            </PageTransition>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <PageTransition>
              <Analytics />
            </PageTransition>
          }
        />

        {/* Resources */}
        <Route
          path="/hospital-admin"
          element={
            <PageTransition>
              <HospitalAdmin />
            </PageTransition>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}