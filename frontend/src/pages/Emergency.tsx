import { Plus, X } from "lucide-react";
import { useState } from "react";

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

type Emergency = (typeof emergencies)[number];

export default function Emergency() {
  const [selectedEmergency, setSelectedEmergency] =
    useState<Emergency | null>(null);

  const [showNewEmergency, setShowNewEmergency] = useState(false);

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
                Create and coordinate emergency transport requests.
              </p>
            </div>

            <button
              onClick={() => setShowNewEmergency(true)}
              className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
            >
              <Plus size={17} />
              New Emergency
            </button>
          </div>

          {/* Emergency Summary */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Emergency Status
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Critical
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  1
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Active critical requests
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  High Priority
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  1
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Active high priority requests
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Active Requests
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  3
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Currently being coordinated
                </p>
              </div>
            </div>
          </section>

          {/* Active Emergencies */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Active Emergencies
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">
              {emergencies.map((emergency, index) => (
                <div
                  key={emergency.id}
                  className={`px-6 py-5 ${
                    index !== emergencies.length - 1
                      ? "border-b border-[#E7ECE8]"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* Emergency Info */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-[#172019]">
                          {emergency.id}
                        </h2>

                        <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          {emergency.priority}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-[#172019]">
                        {emergency.type}
                      </p>

                      <p className="mt-2 text-xs text-[#89938C]">
                        {emergency.location}
                      </p>
                    </div>

                    {/* Status & Ambulance */}
                    <div className="flex flex-col gap-2 md:items-end">
                      <span className="text-sm font-medium text-green-700">
                        {emergency.status}
                      </span>

                      <p className="text-xs text-[#89938C]">
                        Ambulance: {emergency.ambulance}
                      </p>
                    </div>

                    {/* View Details */}
                    <button
                      onClick={() => setSelectedEmergency(emergency)}
                      className="rounded-lg border border-[#DDE5DF] px-4 py-2 text-sm font-medium text-[#172019] transition hover:border-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Emergency Details Modal */}
      {selectedEmergency && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6"
          onClick={() => setSelectedEmergency(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  Emergency Details
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#172019]">
                  {selectedEmergency.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedEmergency(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#89938C] transition hover:bg-[#F6F8F6] hover:text-[#172019]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-[#89938C]">Emergency Type</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedEmergency.type}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">Location</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedEmergency.location}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">Priority</p>
                <p className="mt-1 text-sm font-medium text-green-700">
                  {selectedEmergency.priority}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">Status</p>
                <p className="mt-1 text-sm font-medium text-green-700">
                  {selectedEmergency.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">Ambulance</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedEmergency.ambulance}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmergency(null)}
              className="mt-7 w-full rounded-lg bg-green-700 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Emergency Modal */}
      {showNewEmergency && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6"
          onClick={() => setShowNewEmergency(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  Emergency Response
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#172019]">
                  New Emergency
                </h2>
              </div>

              <button
                onClick={() => setShowNewEmergency(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#89938C] transition hover:bg-[#F6F8F6] hover:text-[#172019]"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setShowNewEmergency(false);
              }}
            >
              <div>
                <label className="text-sm font-medium text-[#172019]">
                  Emergency Type
                </label>

                <input
                  type="text"
                  placeholder="e.g. Road Accident"
                  className="mt-2 w-full rounded-lg border border-[#DDE5DF] px-3 py-2.5 text-sm text-[#172019] outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#172019]">
                  Location
                </label>

                <input
                  type="text"
                  placeholder="e.g. MG Road"
                  className="mt-2 w-full rounded-lg border border-[#DDE5DF] px-3 py-2.5 text-sm text-[#172019] outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#172019]">
                  Priority
                </label>

                <select
                  defaultValue="High"
                  className="mt-2 w-full rounded-lg border border-[#DDE5DF] bg-white px-3 py-2.5 text-sm text-[#172019] outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Moderate</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-green-700 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
              >
                Create Emergency
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}