import { useState, useEffect } from "react";
import {
  Siren,
  Ambulance,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import AmbulanceMap from "../components/map/AmbulanceMap";
import { useAuth } from "../context/AuthContext";
import {
  createEmergencyAndMatch,
  HospitalMatchResult,
  fetchPendingCitizenReportsApi,
  confirmCitizenReportApi,
  createDispatchApi,
} from "../services/api";

export default function DispatcherConsole() {
  const { user } = useAuth();

  const [citizenReports, setCitizenReports] = useState<any[]>([]);

  useEffect(() => {
    fetchPendingCitizenReportsApi().then((data) => {
      if (Array.isArray(data)) setCitizenReports(data);
    });
  }, []);

  const [condition, setCondition] = useState("Trauma / Accident Case");
  const [lat, setLat] = useState(12.8702);
  const [lng, setLng] = useState(74.8436);
  const [matches, setMatches] = useState<HospitalMatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmCitizenReport = async (report: any) => {
    setCondition(report.description);
    if (report.latitude && report.longitude) {
      setLat(report.latitude);
      setLng(report.longitude);
    }
    await confirmCitizenReportApi(report.id, { patient_condition: report.description, priority: "critical" });
    setCitizenReports((prev) => prev.filter((r) => r.id !== report.id));
    alert(`Report ${report.id} confirmed! Converted to official Emergency Request for dispatch.`);
  };

  const handleDismissCitizenReport = (reportId: string) => {
    setCitizenReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  const handleDispatchToFacility = async (m: HospitalMatchResult) => {
    const res = await createDispatchApi("EMG-101", m.hospital_id, "ALS-Unit-04");
    alert(`Dispatched Ambulance Unit ${res.unit_id || "ALS-Unit-04"} to ${m.hospital_name}! Status: ${res.status}`);
  };

  const handleExecuteDispatchMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const results = await createEmergencyAndMatch({
        patient_condition: condition,
        latitude: lat,
        longitude: lng,
        required_specialties: ["icu", "trauma"],
        blood_type_needed: "O_negative",
        priority: "critical",
      });
      setMatches(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-600">
              <Ambulance size={22} />
              <p className="text-xs font-bold uppercase tracking-wider">
                REGIONAL DISPATCH CONSOLE
              </p>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-[#172019]">
              Dispatcher Command & Spatial Map Console
            </h1>
            <p className="mt-1 text-sm text-[#647067]">
              Logged in as <span className="font-bold">{user?.username}</span> (EMT / Regional Dispatcher)
            </p>
          </div>
        </div>

        {/* Citizen SOS Reports Confirmation Queue */}
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <Siren size={20} />
              <h2 className="text-lg font-bold">
                Unconfirmed Public Citizen SOS Reports ({citizenReports.length})
              </h2>
            </div>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
              Requires Dispatcher Verification
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {citizenReports.length === 0 ? (
              <p className="text-xs text-slate-500">No pending citizen reports in queue.</p>
            ) : (
              citizenReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{report.id}</span>
                      <span className="text-xs text-slate-400">· {report.phone || "No phone"}</span>
                      <span className="text-xs text-slate-400">· {report.created_at || report.time || "Recent"}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {report.description}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      GPS Coordinates: {report.latitude}, {report.longitude}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirmCitizenReport(report)}
                      className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                    >
                      <CheckCircle2 size={15} />
                      Confirm & Match
                    </button>

                    <button
                      onClick={() => handleDismissCitizenReport(report.id)}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      <XCircle size={15} />
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Content Grid: Triage Form + Live Spatial Leaflet Map */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Emergency Triage Form */}
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Emergency Triage & P3 Smart Match
            </h2>

            <form onSubmit={handleExecuteDispatchMatch} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Patient Incident / Condition
                </label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-green-600 focus:outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Incident Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 12.8702)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-green-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Incident Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 74.8436)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
              >
                <Sparkles size={16} />
                {loading ? "Calculating P3 Algorithm..." : "Run P3 Smart Match & Route Map"}
              </button>
            </form>

            {matches && (
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-800">
                  P3 Ranked Hospital Results:
                </h3>
                {matches.map((m, idx) => (
                  <div
                    key={m.hospital_id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        #{idx + 1} {m.hospital_name} ({m.distance_km} km away, ETA: {m.estimated_eta_minutes}m)
                      </p>
                      <p className="text-xs text-slate-500">
                        Match Score: <strong className="text-green-700">{m.match_score}%</strong> | ICU Beds: {m.available_icu_beds}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDispatchToFacility(m)}
                      className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                    >
                      <Plus size={14} />
                      Dispatch
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spatial Leaflet Routing Map */}
          <div>
            <AmbulanceMap
              latitude={lat}
              longitude={lng}
              hospitals={matches || []}
              onLocationSelect={(selectedLat, selectedLng) => {
                setLat(selectedLat);
                setLng(selectedLng);
              }}
            />
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
