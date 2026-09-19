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

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Operations
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Analytics
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Monitor resource utilization and hospital performance.
            </p>
          </div>

          {/* Overview */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Operations Overview
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Average Utilization
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  78%
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Across connected hospitals
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Beds Utilized
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  421
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Currently occupied
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Emergency Requests
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  47
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Active and recent requests
                </p>
              </div>

            </div>
          </section>

          {/* Hospital Utilization */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Hospital Utilization
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-6">
              <div>
                <h2 className="text-lg font-semibold text-[#172019]">
                  Bed Occupancy
                </h2>

                <p className="mt-1 text-sm text-[#647067]">
                  Current bed utilization across connected hospitals.
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {hospitals.map((hospital) => (
                  <div key={hospital.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#172019]">
                        {hospital.name}
                      </span>

                      <span className="text-sm font-medium text-green-700">
                        {hospital.utilization}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-[#E8EEE9]">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{
                          width: `${hospital.utilization}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}