import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Siren,
  X,
} from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import {
  createEmergencyAndMatch,
  HospitalMatchResult,
} from "../services/api";

export default function Emergency() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchResults, setMatchResults] = useState<HospitalMatchResult[] | null>(
    null
  );

  const [condition, setCondition] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [priority, setPriority] = useState<
    "critical" | "high" | "moderate" | "low"
  >("critical");
  const [specialties, setSpecialties] = useState("");
  const [bloodType, setBloodType] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);

    try {
      const requiredSpecialties = specialties
        .split(",")
        .map((specialty) => specialty.trim())
        .filter(Boolean);

      const results = await createEmergencyAndMatch({
        patient_condition: condition,
        latitude: Number(lat),
        longitude: Number(lng),
        priority,
        required_specialties: requiredSpecialties,
        blood_type_needed: bloodType || undefined,
      });

      setMatchResults(results);
    } catch (error) {
      console.error("Emergency matching failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setMatchResults(null);
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Emergency Response
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                Emergency Requests
              </h1>

              <p className="mt-2 text-sm text-[#647067]">
                Create and coordinate emergency requests with hospital
                matching.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
            >
              <Plus size={17} />
              New Emergency
            </button>
          </div>

          {/* Emergency Workflow */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Emergency Workflow
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">
              <div className="border-b border-[#E7ECE8] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
                    <Siren size={19} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-[#172019]">
                      Emergency Triage
                    </h2>

                    <p className="mt-1 text-sm text-[#647067]">
                      Submit an emergency to find suitable hospitals based on
                      location, capacity, specialties, and blood availability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      01
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#172019]">
                      Submit Request
                    </p>
                    <p className="mt-1 text-xs text-[#89938C]">
                      Enter patient and incident details.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      02
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#172019]">
                      Match Hospitals
                    </p>
                    <p className="mt-1 text-xs text-[#89938C]">
                      Backend evaluates available hospitals.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      03
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#172019]">
                      Review Matches
                    </p>
                    <p className="mt-1 text-xs text-[#89938C]">
                      Compare the returned hospital matches.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Match Results */}
          {matchResults && (
            <section className="mt-8">
              <div className="mb-4">
                <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  Matching Results
                </p>

                <p className="mt-2 text-sm text-[#647067]">
                  Hospitals returned by the emergency matching service.
                </p>
              </div>

              <div className="space-y-3">
                {matchResults.length === 0 ? (
                  <div className="rounded-2xl border border-[#DDE5DF] bg-white px-6 py-8 text-sm text-[#89938C]">
                    No matching hospitals were found.
                  </div>
                ) : (
                  matchResults.map((result, index) => (
                    <div
                      key={result.hospital_id}
                      className="rounded-2xl border border-[#DDE5DF] bg-white px-6 py-5"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-green-700">
                              #{index + 1}
                            </span>

                            <h2 className="font-semibold text-[#172019]">
                              {result.hospital_name}
                            </h2>
                          </div>

                          <p className="mt-1 text-xs text-[#89938C]">
                            Hospital ID: {result.hospital_id}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-green-700">
                          {result.match_score}% Match
                        </span>
                      </div>

                      <div className="mt-5 grid gap-4 border-t border-[#E7ECE8] pt-4 md:grid-cols-4">
                        <div className="flex items-center gap-2 text-xs text-[#647067]">
                          <MapPin size={14} className="text-green-700" />
                          {result.distance_km} km away
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#647067]">
                          <Clock size={14} className="text-green-700" />
                          ETA: {result.estimated_eta_minutes} mins
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#647067]">
                          <Building2 size={14} className="text-green-700" />
                          {result.available_icu_beds} ICU beds free
                        </div>

                        <div className="flex items-center gap-2 text-xs text-green-700">
                          <CheckCircle2 size={14} />
                          {result.has_blood_stock
                            ? "Blood stock available"
                            : "Blood stock unavailable"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* New Emergency Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E7ECE8] pb-4">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  Emergency Response
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#172019]">
                  {matchResults ? "Hospital Matches" : "New Emergency"}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#89938C] transition hover:bg-[#F6F8F6] hover:text-[#172019]"
              >
                <X size={18} />
              </button>
            </div>

            {!matchResults ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-[#172019]">
                    Patient Condition / Incident
                  </label>

                  <input
                    type="text"
                    value={condition}
                    onChange={(event) => setCondition(event.target.value)}
                    placeholder="e.g. Acute Cardiac Emergency"
                    required
                    className="mt-2 w-full rounded-lg border border-[#DDE5DF] px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-[#172019]">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(event) => setLat(event.target.value)}
                      placeholder="e.g. 12.9716"
                      required
                      className="mt-2 w-full rounded-lg border border-[#DDE5DF] px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#172019]">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(event) => setLng(event.target.value)}
                      placeholder="e.g. 77.5946"
                      required
                      className="mt-2 w-full rounded-lg border border-[#DDE5DF] px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-[#172019]">
                      Priority
                    </label>

                    <select
                      value={priority}
                      onChange={(event) =>
                        setPriority(
                          event.target.value as
                            | "critical"
                            | "high"
                            | "moderate"
                            | "low"
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-[#DDE5DF] bg-white px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="moderate">Moderate</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#172019]">
                      Required Specialties
                    </label>

                    <input
                      type="text"
                      value={specialties}
                      onChange={(event) =>
                        setSpecialties(event.target.value)
                      }
                      placeholder="cardiology, icu"
                      className="mt-2 w-full rounded-lg border border-[#DDE5DF] px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#172019]">
                      Blood Type Needed
                    </label>

                    <select
                      value={bloodType}
                      onChange={(event) => setBloodType(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#DDE5DF] bg-white px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    >
                      <option value="">Not specified</option>
                      <option value="O_negative">O- Negative</option>
                      <option value="A_positive">A+ Positive</option>
                      <option value="B_positive">B+ Positive</option>
                      <option value="AB_positive">AB+ Positive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#E7ECE8] pt-5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-[#DDE5DF] px-4 py-2.5 text-sm font-medium text-[#647067] transition hover:bg-[#F6F8F6]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Finding Hospitals..." : "Find Hospitals"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                {matchResults.length === 0 ? (
                  <div className="rounded-xl border border-[#DDE5DF] px-5 py-6 text-sm text-[#89938C]">
                    No matching hospitals were found.
                  </div>
                ) : (
                  matchResults.map((result, index) => (
                    <div
                      key={result.hospital_id}
                      className="rounded-xl border border-[#DDE5DF] px-5 py-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-green-700">
                              #{index + 1}
                            </span>

                            <h3 className="font-semibold text-[#172019]">
                              {result.hospital_name}
                            </h3>
                          </div>

                          <p className="mt-1 text-xs text-[#89938C]">
                            {result.hospital_id}
                          </p>
                        </div>

                        <span className="text-sm font-semibold text-green-700">
                          {result.match_score}% Match
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-[#E7ECE8] pt-4 text-xs text-[#647067] md:grid-cols-2">
                        <span>
                          Distance: {result.distance_km} km
                        </span>

                        <span>
                          ETA: {result.estimated_eta_minutes} mins
                        </span>

                        <span>
                          ICU beds: {result.available_icu_beds}
                        </span>

                        <span className="text-green-700">
                          {result.has_blood_stock
                            ? "Blood stock available"
                            : "Blood stock unavailable"}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex justify-end border-t border-[#E7ECE8] pt-5">
                  <button
                    onClick={() => setMatchResults(null)}
                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
                  >
                    New Emergency
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}