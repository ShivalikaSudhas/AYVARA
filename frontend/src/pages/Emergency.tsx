import { useState } from "react";
import {
  Siren,
  MapPin,
  Ambulance,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";
import { createEmergencyAndMatch, HospitalMatchResult } from "../services/api";

export default function Emergency() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<HospitalMatchResult[] | null>(null);

  // Form State
  const [condition, setCondition] = useState("Acute Cardiac Arrest");
  const [lat, setLat] = useState("40.7128");
  const [lng, setLng] = useState("-74.0060");
  const [priority, setPriority] = useState<"critical" | "high" | "moderate" | "low">("critical");
  const [specialties, setSpecialties] = useState("cardiology, icu");
  const [bloodType, setBloodType] = useState("O_negative");

  const [emergenciesList, setEmergenciesList] = useState([
    {
      id: "ER-1042",
      type: "Road Accident",
      location: "MG Road (40.712, -74.006)",
      priority: "Critical",
      status: "Matching Hospital",
      ambulance: "A-17",
    },
    {
      id: "ER-1041",
      type: "Cardiac Emergency",
      location: "Indiranagar (40.730, -73.935)",
      priority: "High",
      status: "Hospital Assigned",
      ambulance: "A-12",
    },
    {
      id: "ER-1039",
      type: "Trauma",
      location: "Airport Road (40.758, -73.985)",
      priority: "Moderate",
      status: "Awaiting Dispatch",
      ambulance: "Unassigned",
    },
  ]);

  const handleSubmitTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const specArray = specialties.split(",").map((s) => s.trim());
      const results = await createEmergencyAndMatch({
        patient_condition: condition,
        latitude: parseFloat(lat) || 40.7128,
        longitude: parseFloat(lng) || -74.006,
        priority: priority,
        required_specialties: specArray,
        blood_type_needed: bloodType,
      });

      setMatchResults(results);

      // Add to list
      const newId = `ER-${Math.floor(1000 + Math.random() * 9000)}`;
      setEmergenciesList((prev) => [
        {
          id: newId,
          type: condition,
          location: `Lat: ${lat}, Lng: ${lng}`,
          priority: priority.charAt(0).toUpperCase() + priority.slice(1),
          status: "Hospital Matched",
          ambulance: "Unit A-09",
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Emergency triage error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              EMERGENCY RESPONSE
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
              Emergency Requests & Smart Triage
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Create triage requests and execute real-time P3 multi-hospital smart matching.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            <Plus size={18} />
            New Emergency Triage
          </button>
        </div>

        {/* Priority metrics */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-600">Critical Priority</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {emergenciesList.filter((e) => e.priority === "Critical").length}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm font-medium text-orange-600">High Priority</p>
            <p className="mt-2 text-3xl font-bold text-orange-700">
              {emergenciesList.filter((e) => e.priority === "High").length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">Active Requests</p>
            <p className="mt-2 text-3xl font-bold text-[#172019]">
              {emergenciesList.length}
            </p>
          </div>
        </div>

        {/* Emergency Cards List */}
        <div className="mt-6 space-y-4">
          {emergenciesList.map((emergency) => (
            <div
              key={emergency.id}
              className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm transition hover:border-green-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <Siren size={23} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[#172019]">{emergency.id}</h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          emergency.priority === "Critical"
                            ? "bg-red-50 text-red-700"
                            : emergency.priority === "High"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {emergency.priority}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#647067]">{emergency.type}</p>
                  </div>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {emergency.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[#E7ECE8] pt-5 md:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-[#647067]">
                  <MapPin size={17} />
                  {emergency.location}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#647067]">
                  <Ambulance size={17} />
                  {emergency.ambulance}
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="rounded-lg border border-[#DDE5DF] px-4 py-2 text-sm font-medium text-[#172019] transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                >
                  View Smart Match
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Triage & Smart Match Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Sparkles size={22} />
                  <h2 className="text-xl font-bold text-[#172019]">
                    Emergency Triage & P3 Matching Engine
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMatchResults(null);
                  }}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {!matchResults ? (
                <form onSubmit={handleSubmitTriage} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500">
                      Patient Condition / Incident
                    </label>
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e: any) => setPriority(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="moderate">Moderate</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">
                        Required Specialties
                      </label>
                      <input
                        type="text"
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                        placeholder="cardiology, icu"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">
                        Blood Needed
                      </label>
                      <select
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none"
                      >
                        <option value="O_negative">O- Negative</option>
                        <option value="A_positive">A+ Positive</option>
                        <option value="B_positive">B+ Positive</option>
                        <option value="AB_positive">AB+ Positive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
                    >
                      {loading ? "Matching..." : "Execute Smart Match"}
                    </button>
                  </div>
                </form>
              ) : (
                /* Matching Results */
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-green-200 bg-green-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                      P3 Match Engine Execution Successful
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Evaluated spatial distance, ICU bed capacity, specialty match, and blood inventory.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {matchResults.map((result, idx) => (
                      <div
                        key={result.hospital_id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-green-300"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
                                #{idx + 1}
                              </span>
                              <h3 className="font-bold text-slate-800">
                                {result.hospital_name}
                              </h3>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Hospital ID: {result.hospital_id}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                              {result.match_score}% Match
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 text-xs md:grid-cols-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-green-600" />
                            {result.distance_km} km away
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-green-600" />
                            ETA: {result.estimated_eta_minutes} mins
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Building2 size={14} className="text-green-600" />
                            {result.available_icu_beds} ICU Beds Free
                          </div>

                          <div className="flex items-center gap-1.5 font-semibold text-green-700">
                            <CheckCircle2 size={14} />
                            {result.has_blood_stock ? "Blood Stock Verified" : "Blood Depleted"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end pt-3">
                    <button
                      onClick={() => setMatchResults(null)}
                      className="rounded-xl bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      New Triage Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}