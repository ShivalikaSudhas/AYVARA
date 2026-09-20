import { useState } from "react";
import { Loader2, MapPin, Siren, X } from "lucide-react";
import {
  createEmergency,
  type EmergencyMatchRequest,
  type HospitalMatchResult,
} from "../services/api";
import AmbulanceMap from "../components/map/AmbulanceMap";

type Severity = "critical" | "high" | "moderate" | "low";

interface EmergencyRequest {
  patientCondition: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  specialty: string;
  bloodType?: string;
}

function severityStyle(severity: Severity) {
  switch (severity) {
    case "critical":
      return "bg-red-50 text-red-700";
    case "high":
      return "bg-orange-50 text-orange-700";
    case "moderate":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-green-50 text-green-700";
  }
}

function severityLabel(severity: Severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function EmergencyCard({
  request,
  index,
}: {
  request: EmergencyRequest;
  index: number;
}) {
  return (
    <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Siren size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#172019]">
              Emergency Request #{index + 1}
            </p>

            <p className="mt-1 text-xs text-[#8a948d]">
              {request.patientCondition}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${severityStyle(
            request.severity
          )}`}
        >
          {severityLabel(request.severity)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#8a948d]">
            Location
          </p>

          <p className="mt-1 text-sm text-[#172019]">
            {request.latitude.toFixed(5)}, {request.longitude.toFixed(5)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-[#8a948d]">
            Specialty
          </p>

          <p className="mt-1 text-sm text-[#172019]">
            {request.specialty}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Emergency() {
  const [showNewEmergency, setShowNewEmergency] = useState(false);
  const [patientCondition, setPatientCondition] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [severity, setSeverity] = useState<Severity>("critical");
  const [specialty, setSpecialty] = useState("");
  const [bloodType, setBloodType] = useState("");

  const [matches, setMatches] = useState<HospitalMatchResult[]>([]);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLocationSelect(
    selectedLatitude: number,
    selectedLongitude: number
  ) {
    setLatitude(Number(selectedLatitude.toFixed(6)));
    setLongitude(Number(selectedLongitude.toFixed(6)));
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

    const payload: EmergencyMatchRequest = {
      patient_condition: patientCondition.trim(),
      severity,
      latitude,
      longitude,
      required_specialties: [specialty],
      ...(bloodType
        ? {
            blood_type_needed: bloodType,
          }
        : {}),
    };

    try {
      setLoading(true);

      const result = await createEmergency(payload);

      setMatches(result.matches);

      setRequests((previous) => [
        ...previous,
        {
          patientCondition: patientCondition.trim(),
          latitude,
          longitude,
          severity,
          specialty,
          bloodType: bloodType || undefined,
        },
      ]);

      setShowNewEmergency(false);
      setPatientCondition("");
      setLatitude(null);
      setLongitude(null);
      setSeverity("critical");
      setSpecialty("");
      setBloodType("");
    } catch (err) {
      console.error("Failed to create emergency:", err);

      setError(
        "Unable to create the emergency request. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      <section className="mb-10">
        <p className="section-label mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          Emergency Response
        </p>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#172019]">
              Emergency Requests
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Create and coordinate emergency transport requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowNewEmergency(true);
            }}
            className="w-fit rounded-full bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900"
          >
            New Emergency
          </button>
        </div>
      </section>

      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
          <p className="text-sm text-[#647067]">Critical</p>
          <p className="mt-3 text-3xl font-semibold text-[#172019]">
            {requests.filter((request) => request.severity === "critical").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
          <p className="text-sm text-[#647067]">High Severity</p>
          <p className="mt-3 text-3xl font-semibold text-[#172019]">
            {requests.filter((request) => request.severity === "high").length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
          <p className="text-sm text-[#647067]">Active Requests</p>
          <p className="mt-3 text-3xl font-semibold text-[#172019]">
            {requests.length}
          </p>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4">
          <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
            Live Requests
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#172019]">
            Emergency Queue
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-[#e4e9e5] bg-white py-12 text-center">
            <Siren size={24} className="mx-auto text-[#8a948d]" />

            <p className="mt-3 text-sm font-medium text-[#172019]">
              No emergency requests created in this session.
            </p>

            <p className="mt-1 text-xs text-[#8a948d]">
              Create a new emergency request to begin hospital matching.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map((request, index) => (
              <EmergencyCard
                key={`${request.latitude}-${request.longitude}-${index}`}
                request={request}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {matches.length > 0 && (
        <section className="mb-10">
          <div className="mb-4">
            <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
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
                className="rounded-2xl border border-[#e4e9e5] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#172019]">
                      {hospital.hospital_name}
                    </h3>

                    <p className="mt-1 text-xs text-[#8a948d]">
                      {hospital.distance_km} km away
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {hospital.match_score}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#8a948d]">ICU Beds</p>
                    <p className="mt-1 text-lg font-semibold text-[#172019]">
                      {hospital.available_icu_beds}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8a948d]">Available Beds</p>
                    <p className="mt-1 text-lg font-semibold text-[#172019]">
                      {hospital.total_available_beds}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8a948d]">Estimated ETA</p>
                    <p className="mt-1 text-lg font-semibold text-[#172019]">
                      {hospital.estimated_eta_minutes} min
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#8a948d]">Blood Stock</p>
                    <p className="mt-1 text-sm font-semibold text-[#172019]">
                      {hospital.has_blood_stock ? "Available" : "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4">
          <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
            Location
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#172019]">
            Emergency Map
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e4e9e5] bg-white">
          <AmbulanceMap
            latitude={latitude ?? 12.9716}
            longitude={longitude ?? 77.5946}
            hospitals={matches}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {latitude !== null && longitude !== null && (
          <div className="mt-3 flex items-center gap-2 text-xs text-[#647067]">
            <MapPin size={14} />
            Selected location: {latitude}, {longitude}
          </div>
        )}
      </section>

      {showNewEmergency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-6 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e4e9e5] bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
                  Emergency Response
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                  New Emergency
                </h2>

                <p className="mt-1 text-sm text-[#647067]">
                  Enter the incident details to find matching hospitals.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!loading) {
                    setShowNewEmergency(false);
                    setError("");
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#647067] transition hover:bg-[#f4f6f4] hover:text-[#172019]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="patientCondition"
                  className="mb-2 block text-sm font-medium text-[#172019]"
                >
                  Patient Condition / Incident
                </label>

                <textarea
                  id="patientCondition"
                  value={patientCondition}
                  onChange={(event) =>
                    setPatientCondition(event.target.value)
                  }
                  rows={4}
                  placeholder="Describe the patient condition or incident..."
                  className="w-full resize-none rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#172019] outline-none placeholder:text-[#9aa39d] focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#172019]">
                  Incident Location
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={latitude !== null ? latitude.toString() : ""}
                    readOnly
                    placeholder="Latitude"
                    className="rounded-xl border border-[#dfe5e1] bg-[#fafcfb] px-4 py-3 text-sm text-[#172019] outline-none"
                  />

                  <input
                    value={longitude !== null ? longitude.toString() : ""}
                    readOnly
                    placeholder="Longitude"
                    className="rounded-xl border border-[#dfe5e1] bg-[#fafcfb] px-4 py-3 text-sm text-[#172019] outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-[#8a948d]">
                  Select the incident location directly on the map below.
                </p>

                <div className="mt-3 overflow-hidden rounded-xl border border-[#e4e9e5]">
                  <AmbulanceMap
                    latitude={latitude ?? 12.9716}
                    longitude={longitude ?? 77.5946}
                    hospitals={[]}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="severity"
                  className="mb-2 block text-sm font-medium text-[#172019]"
                >
                  Severity
                </label>

                <select
                  id="severity"
                  value={severity}
                  onChange={(event) =>
                    setSeverity(event.target.value as Severity)
                  }
                  className="w-full rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#172019] outline-none focus:border-green-700"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="specialty"
                  className="mb-2 block text-sm font-medium text-[#172019]"
                >
                  Required Specialty
                </label>

                <select
                  id="specialty"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  className="w-full rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#172019] outline-none focus:border-green-700"
                >
                  <option value="">Select specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Emergency Medicine">
                    Emergency Medicine
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="bloodType"
                  className="mb-2 block text-sm font-medium text-[#172019]"
                >
                  Blood Type Needed
                </label>

                <select
                  id="bloodType"
                  value={bloodType}
                  onChange={(event) => setBloodType(event.target.value)}
                  className="w-full rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#172019] outline-none focus:border-green-700"
                >
                  <option value="">Not required</option>
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

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleCreateEmergency}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Finding Hospitals...
                  </>
                ) : (
                  "Create Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}