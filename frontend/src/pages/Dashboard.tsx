import { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import { fetchAnalyticsSummary, fetchHospitals } from "../services/api";

interface AnalyticsSummary {
  available_beds: number;
  total_beds: number;
  hospitals_online: number;
  active_emergencies: number;
  ambulances_available: number;
  bed_occupancy_rate: number;
}

interface Hospital {
  id: string;
  name: string;
  location: string;
  total_available_beds: number;
  available_icu_beds: number;
  occupancy: number;
  status: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(false);

        const [summaryData, hospitalData] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchHospitals(),
        ]);

        setSummary(summaryData);
        setHospitals(hospitalData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div>
            <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Hospital Network
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Overview of hospital resources and emergency activity.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-[#DDE5DF] bg-white px-5 py-4 text-sm text-[#647067]">
              Unable to load the latest hospital data. Please check that the
              backend is running.
            </div>
          )}

          {/* Hospital Status */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Hospital Status
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Available Beds
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  {loading ? "—" : summary?.available_beds ?? "—"}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  {loading
                    ? "Loading..."
                    : `of ${summary?.total_beds ?? "—"} total beds`}
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Hospitals Online
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  {loading ? "—" : summary?.hospitals_online ?? "—"}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Connected to network
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Active Emergencies
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  {loading ? "—" : summary?.active_emergencies ?? "—"}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Requiring coordination
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Bed Occupancy
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  {loading
                    ? "—"
                    : `${summary?.bed_occupancy_rate ?? "—"}%`}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Across hospital network
                </p>
              </div>
            </div>
          </section>

          {/* Connected Hospitals */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Connected Hospitals
              </p>
            </div>

            {loading ? (
              <div className="rounded-xl border border-[#DDE5DF] bg-white px-6 py-8 text-sm text-[#89938C]">
                Loading hospitals...
              </div>
            ) : hospitals.length === 0 ? (
              <div className="rounded-xl border border-[#DDE5DF] bg-white px-6 py-8 text-sm text-[#89938C]">
                No hospitals available.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="rounded-xl border border-green-600 bg-white px-5 py-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          {hospital.name}
                        </p>

                        <p className="mt-1 text-xs text-[#89938C]">
                          {hospital.location}
                        </p>
                      </div>

                      <span className="text-xs font-semibold text-green-700">
                        {hospital.status}
                      </span>
                    </div>

                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-[#89938C]">
                          Available Beds
                        </p>

                        <p className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                          {hospital.total_available_beds}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-[#89938C]">ICU Beds</p>

                        <p className="mt-2 text-lg font-semibold text-[#172019]">
                          {hospital.available_icu_beds}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}