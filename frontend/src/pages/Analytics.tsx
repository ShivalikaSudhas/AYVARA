import {
  BarChart3,
  TrendingUp,
  BedDouble,
  Activity,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";

const hospitals = [
  { name: "City General", utilization: 72 },
  { name: "St. Mary's", utilization: 81 },
  { name: "Central Emergency", utilization: 94 },
  { name: "Green Valley", utilization: 64 },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <p className="text-sm font-semibold tracking-wide text-green-700">
          OPERATIONS
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
          Analytics
        </h1>

        <p className="mt-2 text-sm text-[#647067]">
          Monitor resource utilization and hospital performance.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <TrendingUp className="text-green-700" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Average Utilization
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              78%
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <BedDouble className="text-green-600" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Beds Utilized
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              421
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Activity className="text-orange-500" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Emergency Requests
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              47
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-green-700" />

            <div>
              <h2 className="font-semibold text-[#172019]">
                Hospital Utilization
              </h2>

              <p className="text-sm text-[#647067]">
                Current bed occupancy by hospital.
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