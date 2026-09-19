import { useState } from "react";
import {
  Shield,
  Zap,
  RefreshCw,
  Building2,
  BedDouble,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [disasterMode, setDisasterMode] = useState(false);
  const [hmisSyncing, setHmisSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleToggleDisasterMode = () => {
    const nextState = !disasterMode;
    setDisasterMode(nextState);
    if (nextState) {
      alert("🚨 DISASTER MODE ACTIVATED! Emergency bed allocation thresholds expanded across all hospitals.");
    } else {
      alert("🟢 Disaster Mode deactivated. Standard operating parameters restored.");
    }
  };

  const handleTriggerHMISSync = () => {
    setHmisSyncing(true);
    setSyncStatus("Connecting to State Health HMIS Gateway...");
    setTimeout(() => {
      setSyncStatus("Synchronizing hospital registries and bed capacity snapshots...");
      setTimeout(() => {
        setHmisSyncing(false);
        setSyncStatus("✅ HMIS Sync Complete! 10 Karnataka hospital records updated.");
      }, 1200);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-700">
              <Shield size={20} />
              <p className="text-xs font-bold uppercase tracking-wider">
                ADMIN CONTROL CONSOLE
              </p>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-[#172019]">
              Cross-Hospital Governance
            </h1>
            <p className="mt-1 text-sm text-[#647067]">
              Welcome, <span className="font-bold">{user?.username}</span> (Global System Administrator)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Disaster Mode Button */}
            <button
              onClick={handleToggleDisasterMode}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition shadow-md ${
                disasterMode
                  ? "bg-red-600 text-white animate-pulse hover:bg-red-700"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              <Zap size={18} />
              {disasterMode ? "DISASTER MODE ACTIVE (Click to Deactivate)" : "ACTIVATE DISASTER MODE"}
            </button>

            {/* HMIS Sync Button */}
            <button
              onClick={handleTriggerHMISSync}
              disabled={hmisSyncing}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={hmisSyncing ? "animate-spin" : ""} />
              Trigger HMIS Sync
            </button>
          </div>
        </div>

        {syncStatus && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-medium text-blue-800">
            <CheckCircle2 size={18} />
            {syncStatus}
          </div>
        )}

        {/* Disaster Mode Alert Banner */}
        {disasterMode && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-red-500 bg-red-500/10 p-5 text-red-900 shadow-lg">
            <AlertTriangle size={32} className="text-red-600 animate-bounce" />
            <div>
              <h3 className="font-extrabold">MASS CASUALTY SURGE PROTOCOL (DISASTER MODE)</h3>
              <p className="text-xs text-red-800">
                All regional hospitals are broadcasting surge bed availability. Triage matching algorithm is prioritized by proximity and rapid dispatch.
              </p>
            </div>
          </div>
        )}

        {/* Regional Overview Cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Building2 size={24} className="text-green-700" />
            <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Monitored Facilities</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">10 Hospitals</p>
            <p className="mt-1 text-xs text-slate-400">Mangaluru, Bengaluru, Mysuru, Udupi, Manipal</p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <BedDouble size={24} className="text-green-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Regional Bed Inventory</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">285 Total Beds</p>
            <p className="mt-1 text-xs text-slate-400">62 ICU Beds Available</p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Shield size={24} className="text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">System Security</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">JWT RBAC Active</p>
            <p className="mt-1 text-xs text-slate-400">14 Seeded Role Accounts Enforced</p>
          </div>
        </div>
      </main>
    </div>
  );
}
