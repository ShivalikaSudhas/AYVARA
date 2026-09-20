import { useEffect, useState } from "react";
import {
  fetchHospitals,
  fetchUtilizationMetrics,
  fetchResponseTimeMetrics,
  fetchEmergencies,
} from "../services/api";

interface Hospital {
  id: string;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface UtilizationMetrics {
  total_capacity: number;
  occupied_beds: number;
  overall_utilization_pct: number;
}

interface ResponseTimeMetrics {
  active_dispatches: number;
}

interface Emergency {
  id: string;
  status: string;
}

function LoadingBlock({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-[#647067]">
      {text}
    </div>
  );
}

function ErrorBlock({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
      {text}
    </div>
  );
}

export default function Dashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [utilization, setUtilization] =
    useState<UtilizationMetrics | null>(null);
  const [responseTimes, setResponseTimes] =
    useState<ResponseTimeMetrics | null>(null);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(false);

        const [hospitalData, utilizationData, responseData, emergencyData] =
          await Promise.all([
            fetchHospitals(),
            fetchUtilizationMetrics(),
            fetchResponseTimeMetrics(),
            fetchEmergencies(),
          ]);

        setHospitals(Array.isArray(hospitalData) ? hospitalData : []);
        setUtilization(utilizationData);
        setResponseTimes(responseData);
        setEmergencies(Array.isArray(emergencyData) ? emergencyData : []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeEmergencies = emergencies.filter((emergency) =>
    ["pending", "matched", "dispatched"].includes(
      emergency.status?.toLowerCase()
    )
  ).length;

  const availableBeds = utilization
    ? utilization.total_capacity - utilization.occupied_beds
    : null;

  const stats = [
    {
      title: "Available Beds",
      value: availableBeds,
      description: "Across the hospital network",
    },
    {
      title: "Hospitals Online",
      value: hospitals.length,
      description: "Connected facilities",
    },
    {
      title: "Active Emergencies",
      value: activeEmergencies,
      description: "Currently being handled",
    },
    {
      title: "Active Dispatches",
      value: responseTimes?.active_dispatches ?? null,
      description: "Ambulances currently dispatched",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      {/* Header */}
      <section className="mb-10">
        <p className="section-label mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
          Command Center
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#172019]">
              Resource Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Monitor hospital capacity and emergency resources.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            System Operational
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-10">
          <ErrorBlock text="Unable to load dashboard data. Please check the backend connection." />
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="mb-10 rounded-2xl border border-[#e4e9e5] bg-white">
          <LoadingBlock text="Loading dashboard data..." />
        </div>
      ) : (
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-[#e4e9e5] bg-white p-5"
            >
              <p className="text-sm font-medium text-[#647067]">
                {stat.title}
              </p>

              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#172019]">
                {stat.value ?? "—"}
              </p>

              <p className="mt-1 text-xs text-[#8a948d]">
                {stat.description}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Hospital Network */}
      <section className="mb-10">
        <div className="mb-4">
          <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
            Hospital Network
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#172019]">
            Connected Hospitals
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e4e9e5] bg-white">
          {loading ? (
            <LoadingBlock text="Loading hospitals..." />
          ) : hospitals.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#647067]">
              No hospital data available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="border-b border-[#e4e9e5] bg-[#fafcfb]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                      Hospital
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                      Address
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                      Location
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {hospitals.map((hospital) => (
                    <tr
                      key={hospital.id}
                      className="border-b border-[#eef1ef] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-[#172019]">
                          {hospital.name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#647067]">
                        {hospital.address || "Not provided"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#647067]">
                        {hospital.latitude != null &&
                        hospital.longitude != null
                          ? `${hospital.latitude.toFixed(
                              4
                            )}, ${hospital.longitude.toFixed(4)}`
                          : "Not provided"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Connected
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Network Utilization */}
      <section className="mb-10">
        <div className="mb-4">
          <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
            Capacity
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#172019]">
            Network Utilization
          </h2>
        </div>

        <div className="rounded-2xl border border-[#e4e9e5] bg-white p-6">
          {loading ? (
            <LoadingBlock text="Loading utilization..." />
          ) : utilization ? (
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-[#647067]">Total Capacity</p>
                <p className="mt-2 text-2xl font-semibold text-[#172019]">
                  {utilization.total_capacity}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#647067]">Occupied Beds</p>
                <p className="mt-2 text-2xl font-semibold text-[#172019]">
                  {utilization.occupied_beds}
                </p>
              </div>

              <div>
                <p className="text-sm text-[#647067]">Utilization</p>
                <p className="mt-2 text-2xl font-semibold text-[#172019]">
                  {utilization.overall_utilization_pct}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#647067]">
              Utilization data unavailable.
            </p>
          )}
        </div>
      </section>

      {/* Active Emergencies */}
      <section className="mb-10">
        <div className="mb-4">
          <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
            Emergency Response
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#172019]">
            Active Emergencies
          </h2>
        </div>

        <div className="rounded-2xl border border-[#e4e9e5] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold text-[#172019]">
                {loading ? "—" : activeEmergencies}
              </p>

              <p className="mt-1 text-sm text-[#647067]">
                Emergency requests currently being handled.
              </p>
            </div>

            <a
              href="/emergency"
              className="rounded-full bg-green-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-900"
            >
              View Emergencies
            </a>
          </div>
        </div>
      </section>

      {/* System Activity */}
      <section>
        <div className="mb-4">
          <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
            System
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#172019]">
            System Activity
          </h2>
        </div>

        <div className="rounded-2xl border border-[#e4e9e5] bg-white p-6">
          <p className="text-sm text-[#647067]">
            Live activity is being provided by the connected hospital
            services.
          </p>
        </div>
      </section>
    </main>
  );
}
