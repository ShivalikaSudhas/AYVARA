import Sidebar from "../components/common/Sidebar";

const resources = [
  {
    name: "General Beds",
    value: 128,
  },
  {
    name: "Blood Units",
    value: 86,
  },
  {
    name: "Departments",
    value: 28,
  },
];

const editableResources = [
  "General Beds",
  "ICU Beds",
  "Ventilators",
  "Blood Units",
];

export default function HospitalAdmin() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Resources
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Hospital Resources
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              View and update the current resources for your hospital.
            </p>
          </div>

          {/* Resource Overview */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Current Resources
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {resources.map((resource) => (
                <div
                  key={resource.name}
                  className="rounded-xl border border-green-600 bg-white px-5 py-6"
                >
                  <p className="text-sm font-semibold text-green-700">
                    {resource.name}
                  </p>

                  <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                    {resource.value}
                  </p>

                  <p className="mt-2 text-xs text-[#89938C]">
                    Current availability
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Update Resources */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Update Resources
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {editableResources.map((resource) => (
                  <div key={resource}>
                    <label className="text-sm font-medium text-[#172019]">
                      {resource}
                    </label>

                    <input
                      type="number"
                      defaultValue="20"
                      min="0"
                      className="mt-2 w-full rounded-lg border border-[#DDE5DF] bg-white px-3 py-2.5 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-1 focus:ring-green-600"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
                  Save Changes
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}