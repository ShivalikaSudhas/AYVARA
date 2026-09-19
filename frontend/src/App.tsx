import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import Emergency from "./pages/Emergency";
import Transfers from "./pages/Transfers";
import Analytics from "./pages/Analytics";
import HospitalAdmin from "./pages/HospitalAdmin";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Dashboard />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/hospital-admin" element={<HospitalAdmin />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}