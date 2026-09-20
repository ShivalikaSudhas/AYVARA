import { useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Clock3,
  MapPin,
  Plus,
  Siren,
  X,
  Loader2,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";
import AmbulanceMap from "../components/map/AmbulanceMap";
import {
  createEmergencyAndMatch,
  type EmergencyMatchRequest,
  type HospitalMatchResult,
} from "../services/api";

interface Emergency {
  id: string;
  type: string;
  location: string;
  priority: "Critical" | "High" | "Moderate";
  status: "Dispatched" | "Waiting" | "Resolved";
  ambulance: string;
  time: string;
}

const emergencies: Emergency[] = [
  {
    id: "ER-1042",
    type: "Road Accident",
    location: "MG Road",
    priority: "Critical",
    status: "Dispatched",
    ambulance: "AMB-17",
    time: "2 min ago",
  },
  {
    id: "ER-1041",
    type: "Cardiac Emergency",
    location: "Indiranagar",
    priority: "High",
    status: "Waiting",
    ambulance: "AMB-12",
    time: "8 min ago",
  },
  {
    id: "ER-1039",
    type: "Severe Trauma",
    location: "Koramangala",
    priority: "High",
    status: "Dispatched",
    ambulance: "AMB-08",
    time: "14 min ago",
  },
  {
    id: "ER-1037",
    type: "Respiratory Emergency",
    location: "Whitefield",
    priority: "Moderate",
    status: "Resolved",
    ambulance: "AMB-21",
    time: "31 min ago",
  },
];

export default function Emergency() {
  const [showNewEmergency, setShowNewEmergency] = useState(false);

  const [patientCondition, setPatientCondition] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [priority, setPriority] =
    useState<EmergencyMatchRequest["priority"]>("critical");

  const [specialty, setSpecialty] = useState("");
  const [bloodType, setBloodType] = useState("");

  const [matches, setMatches] = useState<HospitalMatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const criticalCount = emergencies.filter(
    (emergency) => emergency.priority === "Critical"
  ).length;

  const highCount = emergencies.filter(
    (emergency) => emergency.priority === "High"
  ).length;

  const activeCount = emergencies.filter(
    (emergency) => emergency.status !== "Resolved"
  ).length;

  function handleLocationSelect(lat: number, lng: number) {
    setLatitude(Number(lat.toFixed(6)));
    setLongitude(Number(lng.toFixed(6)));
  }

  async function handleCreateEmergency() {
    setError("");

    if (!patientCondition.trim()) {
      setError("Please enter the patient condition or incident.");
      return;
    }

    if (latitude === null || longitude === null) {
      setError("Please select the incident location on the map.");
      return;
    }

    if (!specialty) {
      setError("Please select a required specialty.");
      return;
    }

    setLoading(true);

    try {
      const payload: EmergencyMatchRequest = {
        patient_condition: patientCondition,
        latitude,
        longitude,
        required_specialties: [specialty],
        blood_type_needed: bloodType || undefined,
        priority,
      };

      const hospitalMatches = await createEmergencyAndMatch(payload);

      setMatches(hospitalMatches);
      setShowNewEmergency(false);

      // Reset form
      setPatientCondition("");
      setLatitude(null);
      setLongitude(null);
      setPriority("critical");
      setSpecialty("");
      setBloodType("");
    } catch (err) {
      console.error(err);
      setError("Unable to process the emergency request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] text-[#172019]">
      <Sidebar />
      <main className="mx-auto max-w-7xl px-6 pb-12 pt-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Emergency Response
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Emergency Requests
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Create and coordinate emergency transport requests.
            </p>
          </div>

          <button
            onClick={() => {
              setError("");
              setShowNewEmergency(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-900"
          >
            <Plus size={17} />
            New Emergency
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E8D8D8] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#647067]">Critical</p>

                <p className="mt-2 text-3xl font-semibold text-red-700">
                  {criticalCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Siren size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DFD4] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#647067]">High Priority</p>

                <p className="mt-2 text-3xl font-semibold text-orange-600">
                  {highCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#647067]">Active Requests</p>

                <p className="mt-2 text-3xl font-semibold text-green-700">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <Ambulance size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Queue */}
        <section className="mt-8">
          <div className="mb-4">
            <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Active Queue
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#172019]">
              Emergency Requests
            </h2>
          </div>

          <div className="space-y-3">
            {emergencies.map((emergency) => (
              <EmergencyCard
                key={emergency.id}
                emergency={emergency}
              />
            ))}
          </div>
        </section>

        {/* Hospital Matches */}
        {matches.length > 0 && (
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Hospital Matching
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Recommended Hospitals
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((hospital) => (
                <div
                  key={hospital.hospital_id}
                  className="rounded-2xl border border-[#DDE5DF] bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#172019]">
                        {hospital.hospital_name}
                      </h3>

                      <p className="mt-1 text-xs text-[#647067]">
                        {hospital.distance_km} km ·{" "}
                        {hospital.estimated_eta_minutes} min ETA
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {hospital.match_score}% Match
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-[#F6F8F6] p-3">
                      <p className="text-xs text-[#89938C]">
                        Available Beds
                      </p>

                      <p className="mt-1 font-semibold text-[#172019]">
                        {hospital.total_available_beds}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F6F8F6] p-3">
                      <p className="text-xs text-[#89938C]">
                        ICU Beds
                      </p>

                      <p className="mt-1 font-semibold text-[#172019]">
                        {hospital.available_icu_beds}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#647067]">
                    Specialty:{" "}
                    {hospital.matched_specialties.join(", ")}
                  </div>

                  <div className="mt-1 text-xs text-[#647067]">
                    Blood stock:{" "}
                    <span
                      className={
                        hospital.has_blood_stock
                          ? "font-medium text-green-700"
                          : "font-medium text-red-600"
                      }
                    >
                      {hospital.has_blood_stock
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map */}
        <section className="mt-8">
          <AmbulanceMap
            latitude={latitude ?? 12.9716}
            longitude={longitude ?? 77.5946}
            hospitals={matches}
            onLocationSelect={handleLocationSelect}
          />
        </section>
      </main>

      {/* New Emergency Modal */}
      {showNewEmergency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  Emergency Response
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                  Patient Condition / Incident
                </h2>
              </div>

              <button
                onClick={() => setShowNewEmergency(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#647067] transition hover:bg-gray-100 hover:text-[#172019]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Patient Condition */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#172019]">
                  Patient Condition / Incident
                </label>

                <textarea
                  value={patientCondition}
                  onChange={(e) =>
                    setPatientCondition(e.target.value)
                  }
                  rows={3}
                  placeholder="e.g. Severe road accident with suspected spinal injury"
                  className="w-full resize-none rounded-xl border border-[#DDE5DF] bg-white px-4 py-3 text-sm outline-none transition focus:border-green-700"
                />
              </div>

              {/* Coordinates */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#172019]">
                    Incident Location
                  </label>

                  <span className="text-xs text-[#89938C]">
                    Click map to select
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="relative">
                    <MapPin
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938C]"
                    />

                    <input
                      type="text"
                      value={
                        latitude !== null
                          ? latitude
                          : ""
                      }
                      readOnly
                      placeholder="Latitude"
                      className="w-full rounded-xl border border-[#DDE5DF] bg-[#F8FAF8] py-3 pl-9 pr-3 text-sm text-[#647067] outline-none"
                    />
                  </div>

                  <div className="relative">
                    <MapPin
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938C]"
                    />

                    <input
                      type="text"
                      value={
                        longitude !== null
                          ? longitude
                          : ""
                      }
                      readOnly
                      placeholder="Longitude"
                      className="w-full rounded-xl border border-[#DDE5DF] bg-[#F8FAF8] py-3 pl-9 pr-3 text-sm text-[#647067] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#172019]">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target
                        .value as EmergencyMatchRequest["priority"]
                    )
                  }
                  className="w-full rounded-xl border border-[#DDE5DF] bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Required Specialty */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#172019]">
                  Required Specialties
                </label>

                <select
                  value={specialty}
                  onChange={(e) =>
                    setSpecialty(e.target.value)
                  }
                  className="w-full rounded-xl border border-[#DDE5DF] bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
                >
                  <option value="">
                    Select specialty
                  </option>
                  <option value="Cardiology">
                    Cardiology
                  </option>
                  <option value="Neurology">
                    Neurology
                  </option>
                  <option value="Trauma">
                    Trauma
                  </option>
                  <option value="Orthopedics">
                    Orthopedics
                  </option>
                  <option value="Pulmonology">
                    Pulmonology
                  </option>
                  <option value="General Surgery">
                    General Surgery
                  </option>
                  <option value="Emergency Medicine">
                    Emergency Medicine
                  </option>
                </select>
              </div>

              {/* Blood Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#172019]">
                  Blood Type Needed
                </label>

                <select
                  value={bloodType}
                  onChange={(e) =>
                    setBloodType(e.target.value)
                  }
                  className="w-full rounded-xl border border-[#DDE5DF] bg-white px-4 py-3 text-sm outline-none focus:border-green-700"
                >
                  <option value="">
                    No blood required
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setShowNewEmergency(false)}
                className="rounded-full border border-[#DDE5DF] px-5 py-2.5 text-sm font-medium text-[#647067] transition hover:bg-[#F6F8F6]"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateEmergency}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-green-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Matching Hospitals..." : "Create Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmergencyCard({
  emergency,
}: {
  emergency: Emergency;
}) {
  const priorityStyles = {
    Critical: "bg-red-50 text-red-700 border-red-100",
    High: "bg-orange-50 text-orange-700 border-orange-100",
    Moderate: "bg-yellow-50 text-yellow-700 border-yellow-100",
  };

  const statusStyles = {
    Dispatched: "bg-green-50 text-green-700",
    Waiting: "bg-orange-50 text-orange-700",
    Resolved: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              emergency.priority === "Critical"
                ? "bg-red-50 text-red-600"
                : emergency.priority === "High"
                  ? "bg-orange-50 text-orange-600"
                  : "bg-yellow-50 text-yellow-600"
            }`}
          >
            <Siren size={20} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-[#172019]">
                {emergency.id}
              </h3>

              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  priorityStyles[emergency.priority]
                }`}
              >
                {emergency.priority}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  statusStyles[emergency.status]
                }`}
              >
                {emergency.status}
              </span>
            </div>

            <p className="mt-1 text-sm font-medium text-[#172019]">
              {emergency.type}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#647067]">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />
                {emergency.location}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Ambulance size={13} />
                {emergency.ambulance}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} />
                {emergency.time}
              </span>
            </div>
          </div>
        </div>

        <button className="rounded-full border border-[#DDE5DF] px-4 py-2 text-sm font-medium text-[#172019] transition hover:bg-[#F6F8F6]">
          View Details
        </button>
      </div>
    </div>
  );
}