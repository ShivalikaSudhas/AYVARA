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

        setHospitals(hospitalData);
        setUtilization(utilizationData);
        setResponseTimes(responseData);
        setEmergencies(emergencyData);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const availableBeds = utilization
    ? utilization.total_capacity - utilization.occupied_beds
    : null;

  const activeEmergencies = emergencies.filter((emergency) =>
    ["pending", "matched", "dispatched"].includes(
      emergency.status.toLowerCase()
    )
  ).length;

  const stats = [
    {
      title: "Available Beds",
      value: availableBeds,
      description: "Across all hospitals",
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
      value: responseTimes?.active_dispatches,
      description: "Currently in progress",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
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

      {loading ? (
        <div className="mb-10 rounded-2xl border border-[#e4e9e5] bg-white">
          <LoadingBlock text="Loading dashboard data..." />
        </div>
      ) : error ? (
        <div className="mb-10">
          <ErrorBlock text="Unable to load dashboard data. Please check the backend connection." />
        </div>
      ) : (
        <>
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

          <section className="mb-10">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Hospital Network
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Hospital Resource Status
              </h2>
            </div>

            <div className="rounded-2xl border border-[#e4e9e5] bg-white p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm text-[#647067]">Network Capacity</p>
                  <p className="mt-2 text-3xl font-semibold text-[#172019]">
                    {utilization?.total_capacity ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-[#8a948d]">
                    Total beds
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#647067]">
                    Network Utilization
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-[#172019]">
                    {utilization?.overall_utilization_pct != null
                      ? `${utilization.overall_utilization_pct}%`
                      : "—"}
                  </p>
                  <p className="mt-1 text-xs text-[#8a948d]">
                    Current occupancy
                  </p>
                </div>
              </div>
            </div>
          </section>

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
                    {activeEmergencies}
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
                Connected to {hospitals.length} hospital
                {hospitals.length !== 1 ? "s" : ""}. Emergency and resource
                data is loaded directly from the backend services.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
