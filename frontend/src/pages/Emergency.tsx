import {
  Siren,
  MapPin,
  Ambulance,
  Plus,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";

const emergencies = [
  {
    id: "ER-1042",
    type: "Road Accident",
    location: "MG Road",
    priority: "Critical",
    status: "Matching Hospital",
    ambulance: "A-17",
  },
  {
    id: "ER-1041",
    type: "Cardiac Emergency",
    location: "Indiranagar",
    priority: "High",
    status: "Hospital Assigned",
    ambulance: "A-12",
  },
  {
    id: "ER-1039",
    type: "Trauma",
    location: "Airport Road",
    priority: "Moderate",
    status: "Awaiting Dispatch",
    ambulance: "Unassigned",
  },
];

export default function Emergency() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              EMERGENCY RESPONSE
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
              Emergency Requests
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Create and coordinate emergency transport requests.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
            <Plus size={18} />
            New Emergency
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-600">
              Critical
            </p>

            <p className="mt-2 text-3xl font-bold text-red-700">
              1
            </p>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm font-medium text-orange-600">
              High Priority
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-700">
              1
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">
              Active Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-[#172019]">
              3
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {emergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm transition hover:border-green-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <Siren size={23} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[#172019]">
                        {emergency.id}
                      </h2>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          emergency.priority === "Critical"
                            ? "bg-red-50 text-red-700"
                            : emergency.priority === "High"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {emergency.priority}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-[#647067]">
                      {emergency.type}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    emergency.status === "Hospital Assigned"
                      ? "bg-green-50 text-green-700"
                      : emergency.status === "Matching Hospital"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-[#F1F4F2] text-[#647067]"
                  }`}
                >
                  {emergency.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[#E7ECE8] pt-5 md:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-[#647067]">
                  <MapPin size={17} />
                  {emergency.location}
                </div>

                <div className="flex items-center gap-2 text-sm text-[#647067]">
                  <Ambulance size={17} />
                  {emergency.ambulance}
                </div>

                <button className="rounded-lg border border-[#DDE5DF] px-4 py-2 text-sm font-medium text-[#172019] transition hover:border-green-200 hover:bg-green-50 hover:text-green-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}