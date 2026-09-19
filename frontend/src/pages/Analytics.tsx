import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../components/common/Sidebar";
import { fetchAnalyticsTrends } from "../services/api";

interface Trend {
  time: string;
  emergencies: number;
  bedOccupancy: number;
}

export default function Analytics() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchAnalyticsTrends();
        setTrends(data?.trends ?? []);
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
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div>
            <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Analytics
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Hospital Analytics
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Monitor emergency activity and hospital capacity trends.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-[#DDE5DF] bg-white px-5 py-4 text-sm text-[#647067]">
              Unable to load analytics data. Please check that the backend is
              running.
            </div>
          )}

          {/* Demand Trends */}
          <section className="mt-8 rounded-2xl border border-[#DDE5DF] bg-white">
            <div className="border-b border-[#E7ECE8] px-6 py-5">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Demand Trends
              </p>

              <h2 className="mt-1 text-lg font-semibold text-[#172019]">
                Emergency Activity
              </h2>

              <p className="mt-1 text-sm text-[#647067]">
                Emergency cases recorded across the hospital network.
              </p>
            </div>

            <div className="px-6 py-6">
              {loading ? (
                <div className="flex h-[320px] items-center justify-center text-sm text-[#89938C]">
                  Loading analytics...
                </div>
              ) : trends.length === 0 ? (
                <div className="flex h-[320px] items-center justify-center text-sm text-[#89938C]">
                  No analytics data available.
                </div>
              ) : (
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trends}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        stroke="#E7ECE8"
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="time"
                        tick={{
                          fill: "#89938C",
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: "#89938C",
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          border: "1px solid #DDE5DF",
                          borderRadius: "10px",
                          backgroundColor: "#FFFFFF",
                          boxShadow: "none",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="emergencies"
                        name="Emergencies"
                        stroke="#15803D"
                        fill="#DCFCE7"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          {/* Hospital Utilization */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Hospital Capacity
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">
              {loading ? (
                <div className="px-6 py-8 text-sm text-[#89938C]">
                  Loading capacity data...
                </div>
              ) : trends.length === 0 ? (
                <div className="px-6 py-8 text-sm text-[#89938C]">
                  No capacity data available.
                </div>
              ) : (
                <div className="grid gap-0 md:grid-cols-3">
                  <div className="border-b border-[#E7ECE8] px-6 py-5 md:border-b-0 md:border-r">
                    <p className="text-xs text-[#89938C]">Current Occupancy</p>

                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                      {trends[trends.length - 1]?.bedOccupancy ?? "—"}%
                    </p>
                  </div>

                  <div className="border-b border-[#E7ECE8] px-6 py-5 md:border-b-0 md:border-r">
                    <p className="text-xs text-[#89938C]">Peak Occupancy</p>

                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                      {Math.max(
                        ...trends.map((item) => item.bedOccupancy)
                      )}
                      %
                    </p>
                  </div>

                  <div className="px-6 py-5">
                    <p className="text-xs text-[#89938C]">
                      Average Occupancy
                    </p>

                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                      {Math.round(
                        trends.reduce(
                          (sum, item) => sum + item.bedOccupancy,
                          0
                        ) / trends.length
                      )}
                      %
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}