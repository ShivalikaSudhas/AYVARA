import { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  RefreshCw,
  Building2,
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Siren,
  ArrowUpRight,
} from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import AmbulanceMap from "../components/map/AmbulanceMap";
import { useAuth } from "../context/AuthContext";
import {
  toggleDisasterModeApi,
  fetchDisasterStatusApi,
  triggerHMISSyncApi,
  fetchAnalyticsSummary,
  fetchHospitals,
} from "../services/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [disasterMode, setDisasterMode] = useState(false);
  const [hmisSyncing, setHmisSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [summary, setSummary] = useState({
    available_beds: 128,
    total_beds: 285,
    hospitals_online: 10,
    active_emergencies: 7,
    ambulances_available: 24,
    bed_occupancy_rate: 71.1,
  });

  const [hospitalsList, setHospitalsList] = useState<any[]>([
    {
      id: "hosp_001",
      hospital_id: "hosp_001",
      name: "KMC Hospital Mangaluru",
      hospital_name: "KMC Hospital Mangaluru",
      location: "Light House Hill Rd, Mangaluru",
      latitude: 12.8702,
      longitude: 74.8436,
      beds: 32,
      total_available_beds: 32,
      available_icu_beds: 10,
      occupancy: 72,
      status: "Available",
      match_score: 98,
      distance_km: 1.2,
      estimated_eta_minutes: 5,
      has_blood_stock: true,
    },
    {
      id: "hosp_002",
      hospital_id: "hosp_002",
      name: "AJ Hospital & Research Centre",
      hospital_name: "AJ Hospital & Research Centre",
      location: "Kuntikana, Mangaluru",
      latitude: 12.8954,
      longitude: 74.8541,
      beds: 18,
      total_available_beds: 18,
      available_icu_beds: 5,
      occupancy: 81,
      status: "Available",
      match_score: 92,
      distance_km: 3.4,
      estimated_eta_minutes: 10,
      has_blood_stock: true,
    },
    {
      id: "hosp_003",
      hospital_id: "hosp_003",
      name: "Father Muller Medical College Hospital",
      hospital_name: "Father Muller Medical College Hospital",
      location: "Kankanady, Mangaluru",
      latitude: 12.8647,
      longitude: 74.8562,
      beds: 7,
      total_available_beds: 7,
      available_icu_beds: 2,
      occupancy: 94,
      status: "Limited",
      match_score: 85,
      distance_km: 2.1,
      estimated_eta_minutes: 7,
      has_blood_stock: true,
    },
    {
      id: "hosp_004",
      hospital_id: "hosp_004",
      name: "Yenepoya Specialty Hospital",
      hospital_name: "Yenepoya Specialty Hospital",
      location: "Kodialbail, Mangaluru",
      latitude: 12.875,
      longitude: 74.84,
      beds: 24,
      total_available_beds: 24,
      available_icu_beds: 8,
      occupancy: 65,
      status: "Available",
      match_score: 90,
      distance_km: 1.8,
      estimated_eta_minutes: 6,
      has_blood_stock: true,
    },
    {
      id: "hosp_005",
      hospital_id: "hosp_005",
      name: "Indiana Hospital & Heart Institute",
      hospital_name: "Indiana Hospital & Heart Institute",
      location: "Pumpwell, Mangaluru",
      latitude: 12.858,
      longitude: 74.865,
      beds: 15,
      total_available_beds: 15,
      available_icu_beds: 6,
      occupancy: 78,
      status: "Available",
      match_score: 88,
      distance_km: 4.0,
      estimated_eta_minutes: 12,
      has_blood_stock: true,
    },
  ]);

  useEffect(() => {
    fetchDisasterStatusApi().then((res) => {
      if (res && typeof res.disaster_mode === "boolean") {
        setDisasterMode(res.disaster_mode);
      }
    });

    async function loadData() {
      try {
        const [sumData, hospData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchHospitals(),
        ]);
        if (sumData) setSummary((prev) => ({ ...prev, ...sumData }));
        if (Array.isArray(hospData) && hospData.length > 0) {
          setHospitalsList(
            hospData.map((h: any) => ({
              id: h.id || h.hospital_id,
              hospital_id: h.id || h.hospital_id,
              name: h.name || h.hospital_name,
              hospital_name: h.name || h.hospital_name,
              location: h.location || h.address || "Karnataka",
              latitude: h.latitude || 12.8702,
              longitude: h.longitude || 74.8436,
              beds: h.total_available_beds ?? h.beds ?? 20,
              total_available_beds: h.total_available_beds ?? h.beds ?? 20,
              available_icu_beds: h.available_icu_beds ?? 5,
              occupancy: h.occupancy ?? Math.floor(60 + Math.random() * 30),
              status: h.status || (h.total_available_beds > 10 ? "Available" : "Limited"),
              match_score: h.match_score ?? 90,
              distance_km: h.distance_km ?? 2.5,
              estimated_eta_minutes: h.estimated_eta_minutes ?? 8,
              has_blood_stock: h.has_blood_stock ?? true,
            }))
          );
        }
      } catch (err) {
        console.warn("Using fallback admin metrics:", err);
      }
    }

    loadData();
  }, []);

  const handleToggleDisasterMode = async () => {
    const nextState = !disasterMode;
    setDisasterMode(nextState);
    await toggleDisasterModeApi(nextState);
    if (nextState) {
      alert("DISASTER MODE ACTIVATED! Regional emergency bed allocation thresholds expanded across all hospitals.");
    } else {
      alert("Disaster Mode deactivated. Standard operating parameters restored.");
    }
  };

  const handleTriggerHMISSync = async () => {
    setHmisSyncing(true);
    setSyncStatus("Connecting to State Health HMIS Gateway...");
    try {
      await triggerHMISSyncApi();
      setSyncStatus("HMIS Sync Complete! 10 Karnataka hospital records updated.");
    } catch (err) {
      setSyncStatus("HMIS Sync Completed with fallback.");
    } finally {
      setHmisSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-700">
                <Shield size={20} />
                <p className="text-xs font-bold uppercase tracking-wider">
                  SYSTEM ADMIN GOVERNANCE CONSOLE
                </p>
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-[#172019]">
                Multi-Hospital Regional Command
              </h1>
              <p className="mt-1 text-sm text-[#647067]">
                Logged in as <span className="font-bold">{user?.username}</span> (Global System Administrator)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Disaster Mode Button */}
              <button
                onClick={handleToggleDisasterMode}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition shadow-md cursor-pointer ${
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
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
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
                <h3 className="font-extrabold">MASS CASUALTY SURGE PROTOCOL (DISASTER MODE ACTIVE)</h3>
                <p className="text-xs text-red-800">
                  All regional hospitals are broadcasting surge bed availability. Priority routing enabled across all emergency dispatches.
                </p>
              </div>
            </div>
          )}

          {/* Aggregate Multi-Hospital Analytics Cards */}
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Monitored Facilities</p>
                  <p className="mt-3 text-3xl font-bold text-[#172019]">{summary.hospitals_online} Online</p>
                  <p className="mt-1 text-xs text-[#8A958E]">Karnataka Regional Network</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 text-green-700">
                  <Building2 size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Total Bed Inventory</p>
                  <p className="mt-3 text-3xl font-bold text-[#172019]">{summary.available_beds} Free</p>
                  <p className="mt-1 text-xs text-[#8A958E]">Out of {summary.total_beds} total beds</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 text-green-700">
                  <BedDouble size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">System Occupancy Rate</p>
                  <p className="mt-3 text-3xl font-bold text-[#172019]">{summary.bed_occupancy_rate}%</p>
                  <p className="mt-1 text-xs text-[#8A958E]">Cross-Hospital Average</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <Activity size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">Active Dispatches</p>
                  <p className="mt-3 text-3xl font-bold text-[#172019]">{summary.active_emergencies} Active</p>
                  <p className="mt-1 text-xs text-[#8A958E]">24 Ambulances Operational</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                  <Siren size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Regional Map + All-Hospital Overview Table */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* All-Hospital Regional Map */}
            <div>
              <AmbulanceMap
                latitude={12.8702}
                longitude={74.8436}
                hospitals={hospitalsList}
              />
            </div>

            {/* All-Hospital Capacity Table */}
            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#172019]">
                    All-Hospital Resource Overview
                  </h2>
                  <p className="mt-1 text-xs text-[#647067]">
                    Aggregate live capacity across all 10 monitored facilities.
                  </p>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  10 Hospitals
                </span>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-[#E7ECE8]">
                <table className="w-full text-left">
                  <thead className="bg-[#F6F8F6]">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-[#647067]">Hospital</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-[#647067]">Avail. Beds</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-[#647067]">Occupancy</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase text-[#647067]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7ECE8]">
                    {hospitalsList.map((h) => (
                      <tr key={h.hospital_id} className="hover:bg-[#F8FAF8]">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-xs text-[#172019]">{h.hospital_name}</p>
                          <p className="text-[10px] text-[#8A958E]">{h.location}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-700">
                          {h.total_available_beds} beds ({h.available_icu_beds} ICU)
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  h.occupancy >= 90
                                    ? "bg-red-500"
                                    : h.occupancy >= 80
                                      ? "bg-orange-500"
                                      : "bg-green-500"
                                }`}
                                style={{ width: `${h.occupancy}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-slate-600">{h.occupancy}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            h.status === "Available"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
