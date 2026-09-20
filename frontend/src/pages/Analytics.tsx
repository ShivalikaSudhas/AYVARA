import { useEffect, useState } from "react";
import { fetchUtilizationMetrics, fetchResponseTimeMetrics } from "../services/api";

export default function Analytics() {
  const [utilization, setUtilization] = useState<any>(null);
  const [responseTimes, setResponseTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(false);

        const [utilizationData, responseData] = await Promise.all([
          fetchUtilizationMetrics(),
          fetchResponseTimeMetrics(),
        ]);

        setUtilization(utilizationData);
        setResponseTimes(responseData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      <section className="mb-10">
        <p className="section-label mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
          Analytics
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#172019]">
          Hospital Analytics
        </h1>

        <p className="mt-2 text-sm text-[#647067]">
          Monitor hospital capacity and emergency response performance.
        </p>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-[#e4e9e5] bg-white">
          <div className="flex items-center justify-center py-16 text-sm text-[#647067]">
            Loading analytics...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          Unable to load analytics data. Please check the backend connection.
        </div>
      ) : (
        <>
          {/* Bed Capacity */}
          <section className="mb-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Hospital Capacity
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Bed Utilization
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Total Capacity</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {utilization?.total_capacity ?? "—"}
                </p>
                <p className="mt-1 text-xs text-[#8a948d]">
                  Beds across the network
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Occupied Beds</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {utilization?.occupied_beds ?? "—"}
                </p>
                <p className="mt-1 text-xs text-[#8a948d]">
                  Currently occupied
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Utilization</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {utilization?.overall_utilization_pct != null
                    ? `${utilization.overall_utilization_pct.toFixed(1)}%`
                    : "—"}
                </p>
                <p className="mt-1 text-xs text-[#8a948d]">
                  Overall bed utilization
                </p>
              </div>
            </div>
          </section>

          {/* Department Breakdown */}
          <section className="mb-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Departments
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Department Utilization
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e4e9e5] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left">
                  <thead className="border-b border-[#e4e9e5] bg-[#fafcfb]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                        Department
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                        Total Beds
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                        Occupied
                      </th>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                        Utilization
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {utilization?.department_breakdown?.map(
                      (department: any) => (
                        <tr
                          key={department.department}
                          className="border-b border-[#eef1ef] last:border-0"
                        >
                          <td className="px-5 py-4 font-medium text-[#172019]">
                            {department.department}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#647067]">
                            {department.total}
                          </td>

                          <td className="px-5 py-4 text-sm text-[#647067]">
                            {department.occupied}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-[#172019]">
                            {department.utilization_pct}%
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Response Performance */}
          <section>
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Emergency Response
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Response Performance
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">
                  Average Dispatch
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {responseTimes?.average_dispatch_seconds ?? "—"}s
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">
                  Average ETA
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {responseTimes?.average_eta_minutes ?? "—"} min
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">
                  Dispatches Today
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {responseTimes?.dispatches_today ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">
                  Active Dispatches
                </p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {responseTimes?.active_dispatches ?? "—"}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}