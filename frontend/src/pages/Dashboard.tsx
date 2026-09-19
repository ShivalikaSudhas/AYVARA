import {
  BedDouble,
  Building2,
  Siren,
  Ambulance,
  ArrowUpRight,
  Activity,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";

const stats = [
  {
    title: "Available Beds",
    value: "128",
    description: "Across all hospitals",
    icon: BedDouble,
  },
  {
    title: "Hospitals Online",
    value: "12",
    description: "Connected facilities",
    icon: Building2,
  },
  {
    title: "Active Emergencies",
    value: "7",
    description: "Currently being handled",
    icon: Siren,
  },
  {
    title: "Ambulances",
    value: "24",
    description: "Available for dispatch",
    icon: Ambulance,
  },
];

const hospitals = [
  {
    name: "City General Hospital",
    location: "Central District",
    beds: 32,
    occupancy: 72,
    status: "Available",
  },
  {
    name: "St. Mary's Medical Center",
    location: "North District",
    beds: 18,
    occupancy: 81,
    status: "Available",
  },
  {
    name: "Central Emergency Hospital",
    location: "East District",
    beds: 7,
    occupancy: 94,
    status: "Limited",
  },
  {
    name: "Green Valley Hospital",
    location: "West District",
    beds: 25,
    occupancy: 64,
    status: "Available",
  },
];

const emergencies = [
  {
    id: "ER-1042",
    type: "Road Accident",
    location: "MG Road",
    priority: "Critical",
    time: "2 min ago",
  },
  {
    id: "ER-1041",
    type: "Cardiac Emergency",
    location: "Indiranagar",
    priority: "High",
    time: "7 min ago",
  },
  {
    id: "ER-1039",
    type: "Trauma",
    location: "Airport Road",
    priority: "Moderate",
    time: "14 min ago",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              COMMAND CENTER
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172019]">
              Resource Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Monitor hospital capacity, emergencies and ambulance
              availability.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-sm font-medium text-green-700">
              System Operational
            </span>
          </div>
        </div>

        {/* Stats */}
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#647067]">
                      {stat.title}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#172019]">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-[#8A958E]">
                      {stat.description}
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Hospital Resource Status */}
        <section className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#172019]">
                Hospital Resource Status
              </h2>

              <p className="mt-1 text-sm text-[#647067]">
                Current capacity across connected facilities.
              </p>
            </div>

            <button className="flex items-center gap-1 text-sm font-medium text-green-700 transition hover:text-green-800">
              View all
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-[#E7ECE8]">
            <table className="w-full text-left">
              <thead className="bg-[#F6F8F6]">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                    Hospital
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                    Available Beds
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                    Occupancy
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E7ECE8]">
                {hospitals.map((hospital) => (
                  <tr
                    key={hospital.name}
                    className="transition hover:bg-[#F8FAF8]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#172019]">
                        {hospital.name}
                      </p>

                      <p className="mt-1 text-xs text-[#8A958E]">
                        {hospital.location}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {hospital.beds}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              hospital.occupancy >= 90
                                ? "bg-red-500"
                                : hospital.occupancy >= 80
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${hospital.occupancy}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs text-[#647067]">
                          {hospital.occupancy}%
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          hospital.status === "Available"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {hospital.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom Sections */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Emergencies */}
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <Siren size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-[#172019]">
                  Active Emergencies
                </h2>

                <p className="text-sm text-[#647067]">
                  Requests requiring coordination.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {emergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="flex items-center justify-between rounded-xl border border-[#E7ECE8] p-4 transition hover:bg-[#FAFBFA]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#172019]">
                        {emergency.id}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          emergency.priority === "Critical"
                            ? "bg-red-50 text-red-700"
                            : emergency.priority === "High"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {emergency.priority}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#647067]">
                      {emergency.type} · {emergency.location}
                    </p>
                  </div>

                  <span className="text-xs text-[#8A958E]">
                    {emergency.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Activity */}
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <Activity size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-[#172019]">
                  System Activity
                </h2>

                <p className="text-sm text-[#647067]">
                  Latest coordination events.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500" />

                <div>
                  <p className="text-sm text-slate-700">
                    Bed reservation confirmed
                  </p>

                  <p className="text-xs text-[#8A958E]">
                    Central Emergency Hospital · 3 min ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-green-600" />

                <div>
                  <p className="text-sm text-slate-700">
                    Ambulance dispatched
                  </p>

                  <p className="text-xs text-[#8A958E]">
                    Unit A-17 · 6 min ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-orange-500" />

                <div>
                  <p className="text-sm text-slate-700">
                    Hospital capacity updated
                  </p>

                  <p className="text-xs text-[#8A958E]">
                    City General Hospital · 9 min ago
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-red-500" />

                <div>
                  <p className="text-sm text-slate-700">
                    Emergency request created
                  </p>

                  <p className="text-xs text-[#8A958E]">
                    ER-1039 · 14 min ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}