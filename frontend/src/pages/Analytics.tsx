import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  BedDouble,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../components/common/Sidebar";
import { fetchAnalyticsTrends } from "../services/api";

const hospitals = [
  { name: "City General", utilization: 72 },
  { name: "St. Mary's", utilization: 81 },
  { name: "Central Emergency", utilization: 94 },
  { name: "Green Valley", utilization: 64 },
];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsTrends();
      if (data && data.trends) {
        setChartData(data.trends);
      } else {
        setChartData([
          { time: "00:00", emergencies: 3, bedOccupancy: 62 },
          { time: "04:00", emergencies: 1, bedOccupancy: 58 },
          { time: "08:00", emergencies: 8, bedOccupancy: 74 },
          { time: "12:00", emergencies: 14, bedOccupancy: 88 },
          { time: "16:00", emergencies: 11, bedOccupancy: 82 },
          { time: "20:00", emergencies: 6, bedOccupancy: 70 },
        ]);
      }
    } catch (e) {
      console.error("Analytics fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              OPERATIONS & DEMAND ANALYTICS
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
              Analytics & Bottlenecks
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Monitor resource utilization, emergency demand trends, and peak capacity hours.
            </p>
          </div>

          <button
            onClick={loadAnalyticsData}
            className="flex items-center gap-1.5 rounded-lg border border-[#DDE5DF] bg-white px-3 py-2 text-xs font-medium text-[#172019] shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Trends
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <TrendingUp className="text-green-700" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Average Bed Utilization
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              78%
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <BedDouble className="text-green-600" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Beds Currently Occupied
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              421
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Activity className="text-orange-500" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Emergency Surge Requests
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              47
            </p>
          </div>
        </div>

        {/* Demand Trends Graph */}
        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-green-700" size={22} />

            <div>
              <h2 className="font-semibold text-[#172019]">
                24-Hour Emergency Demand vs Bed Occupancy Trend
              </h2>

              <p className="text-sm text-[#647067]">
                Live trends aggregated by backend analytics endpoints.
              </p>
            </div>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEmergencies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="emergencies"
                  stroke="#16a34a"
                  fillOpacity={1}
                  fill="url(#colorEmergencies)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-green-700" />

            <div>
              <h2 className="font-semibold text-[#172019]">
                Hospital Capacity Breakdown
              </h2>

              <p className="text-sm text-[#647067]">
                Current bed occupancy across connected facilities.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {hospitals.map((hospital) => (
              <div key={hospital.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-[#172019]">
                    {hospital.name}
                  </span>

                  <span className="text-[#647067]">
                    {hospital.utilization}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#E8EEE9]">
                  <div
                    className={`h-full rounded-full ${
                      hospital.utilization >= 90
                        ? "bg-red-500"
                        : hospital.utilization >= 80
                          ? "bg-orange-500"
                          : "bg-green-600"
                    }`}
                    style={{
                      width: `${hospital.utilization}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}