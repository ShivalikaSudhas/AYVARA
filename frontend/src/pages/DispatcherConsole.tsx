import { useState } from "react";
import {
  Siren,
  Ambulance,
  Plus,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  createEmergency,
  type HospitalMatchResult,
} from "../services/api";

export default function DispatcherConsole() {
  const { user } = useAuth();

  const [citizenReports, setCitizenReports] = useState([
    {
      id: "CR-9001",
      phone: "+91 98765 43210",
      description: "Severe 2-wheeler accident near KMC Lighthouse Hill",
      location: "12.8702, 74.8436 (Mangaluru)",
      status: "PENDING",
      time: "5 min ago",
    },
    {
      id: "CR-9002",
      phone: "+91 91234 56789",
      description: "Elderly person chest pain near MG Road",
      location: "12.8654, 74.8415 (Mangaluru)",
      status: "PENDING",
      time: "12 min ago",
    },
  ]);

  const [condition, setCondition] = useState("Trauma / Accident Case");
  const [lat, setLat] = useState("12.8702");
  const [lng, setLng] = useState("74.8436");
  const [matches, setMatches] = useState<HospitalMatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmCitizenReport = (
    reportId: string,
    desc: string
  ) => {
    setCondition(desc);
    setCitizenReports((prev) =>
      prev.filter((report) => report.id !== reportId)
    );

    alert(
      `Report ${reportId} confirmed! Converted to official Emergency Request for dispatch.`
    );
  };

  const handleDismissCitizenReport = (reportId: string) => {
    setCitizenReports((prev) =>
      prev.filter((report) => report.id !== reportId)
    );
  };

  const handleExecuteDispatchMatch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const latitude = Number.parseFloat(lat);
    const longitude = Number.parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      alert("Please enter valid latitude and longitude.");
      return;
    }

    setLoading(true);

    try {
      const result = await createEmergency({
        patient_condition: condition.trim(),
        latitude,
        longitude,
        severity: "critical",
        required_specialties: ["icu", "trauma"],
        blood_type_needed: "O_negative",
      });

      setMatches(result.matches);
    } catch (error) {
      console.error("Failed to create emergency:", error);
      alert("Unable to create emergency. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="mx-auto max-w-7xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-600">
              <Ambulance size={22} />

              <p className="text-xs font-bold uppercase tracking-wider">
                REGIONAL DISPATCH CONSOLE
              </p>
            </div>

            <h1 className="mt-1 text-3xl font-extrabold text-[#172019]">
              Dispatcher Command & Citizen SOS Queue
            </h1>

            <p className="mt-1 text-sm text-[#647067]">
              Logged in as{" "}
              <span className="font-bold">{user?.username}</span>{" "}
              (EMT / Regional Dispatcher)
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <Siren size={20} />

              <h2 className="text-lg font-bold">
                Unconfirmed Public Citizen SOS Reports (
                {citizenReports.length})
              </h2>
            </div>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
              Requires Dispatcher Verification
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {citizenReports.length === 0 ? (
              <p className="text-xs text-slate-500">
                No pending citizen reports in queue.
              </p>
            ) : (
              citizenReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {report.id}
                      </span>

                      <span className="text-xs text-slate-400">
                        · {report.phone}
                      </span>

                      <span className="text-xs text-slate-400">
                        · {report.time}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {report.description}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      GPS: {report.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleConfirmCitizenReport(
                          report.id,
                          report.description
                        )
                      }
                      className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                    >
                      <CheckCircle2 size={15} />
                      Confirm & Create Emergency
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDismissCitizenReport(report.id)
                      }
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

        <div className="mt-8 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Create Emergency & Match Suitable Hospitals
          </h2>

          <form
            onSubmit={handleExecuteDispatchMatch}
            className="mt-4 space-y-4"
          >
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
                  Latitude
                </label>

                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-green-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">
                  Longitude
                </label>

                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-green-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {loading
                ? "Calculating..."
                : "Run Smart Match & Dispatch"}
            </button>
          </form>

          {matches && (
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-800">
                Ranked Hospital Results:
              </h3>

              {matches.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No suitable hospitals were found.
                </p>
              ) : (
                matches.map((match, index) => (
                  <div
                    key={match.hospital_id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        #{index + 1} {match.hospital_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {match.distance_km} km away · ETA:{" "}
                        {match.estimated_eta_minutes}m
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        ICU Beds: {match.available_icu_beds} Free · Blood
                        Stock:{" "}
                        {match.has_blood_stock
                          ? "Available"
                          : "Depleted"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          `Dispatched Ambulance Unit A-09 to ${match.hospital_name}!`
                        )
                      }
                      className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                    >
                      <Plus size={14} />
                      Dispatch to Facility
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}