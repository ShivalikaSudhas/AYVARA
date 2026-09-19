import Sidebar from "../components/common/Sidebar";

const hospitals = [
  {
    name: "City General Hospital",
    location: "Central District",
    beds: 32,
    utilization: 72,
    status: "Available",
  },
  {
    name: "St. Mary's Medical Center",
    location: "North District",
    beds: 18,
    utilization: 81,
    status: "Available",
  },
  {
    name: "Central Emergency Hospital",
    location: "East District",
    beds: 7,
    utilization: 94,
    status: "Limited",
  },
  {
    name: "Green Valley Hospital",
    location: "West District",
    beds: 25,
    utilization: 64,
    status: "Available",
  },
];

const emergencies = [
  {
    id: "ER-1042",
    type: "Road Accident",
    location: "MG Road",
    priority: "Critical",
  },
  {
    id: "ER-1041",
    type: "Cardiac Emergency",
    location: "Indiranagar",
    priority: "High",
  },
  {
    id: "ER-1039",
    type: "Trauma",
    location: "Airport Road",
    priority: "Moderate",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              City General Hospital
            </h1>
          </div>

          {/* Hospital Status */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Hospital Status
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">

              {/* Available Beds */}
              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Available Beds
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  128
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  of 180 total beds
                </p>
              </div>

              {/* ICU Beds */}
              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  ICU Beds
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  14
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  of 20 total beds
                </p>
              </div>

              {/* Blood Units */}
              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Blood Units
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  86
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Available inventory
                </p>
              </div>

              {/* Ambulances */}
              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Ambulances
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  24
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  7 currently active
                </p>
              </div>

            </div>
          </section>

          {/* Emergencies */}
          <section className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white">
            <div className="flex items-center justify-between border-b border-[#E7ECE8] px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938C]">
                  Emergency Response
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[#172019]">
                  Active Emergencies
                </h2>
              </div>

              <div className="text-sm font-medium text-green-700">
                3 active
              </div>
            </div>

            <div>
              {emergencies.map((emergency, index) => (
                <div
                  key={emergency.id}
                  className={`px-6 py-5 ${
                    index !== emergencies.length - 1
                      ? "border-b border-[#E7ECE8]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#172019]">
                        {emergency.id}
                      </span>

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
                </div>
              ))}
            </div>
          </section>

          {/* Connected Hospitals */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Connected Hospitals
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {hospitals.map((hospital) => (
                <div
                  key={hospital.name}
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

                  <div className="mt-6">
                    <p className="text-xs text-[#89938C]">
                      Available Beds
                    </p>

                    <p className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                      {hospital.beds}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}