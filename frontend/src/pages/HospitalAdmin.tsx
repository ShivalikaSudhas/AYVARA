import {
  Settings,
  BedDouble,
  Droplets,
  Building2,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";

const resources = [
  {
    name: "General Beds",
    value: 128,
    icon: BedDouble,
  },
  {
    name: "Blood Units",
    value: 86,
    icon: Droplets,
  },
  {
    name: "Departments",
    value: 28,
    icon: Building2,
  },
];

export default function HospitalAdmin() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <p className="text-sm font-semibold tracking-wide text-green-700">
          ADMINISTRATION
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
          Hospital Admin
        </h1>

        <p className="mt-2 text-sm text-[#647067]">
          Manage hospital resources and operational settings.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;

            return (
              <div
                key={resource.name}
                className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm transition hover:border-green-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <Icon size={22} />
                  </div>

                  <button className="text-[#89938C] transition hover:text-green-700">
                    <Settings size={18} />
                  </button>
                </div>

                <p className="mt-5 text-sm text-[#647067]">
                  {resource.name}
                </p>

                <p className="mt-1 text-3xl font-bold text-[#172019]">
                  {resource.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#172019]">
            Resource Management
          </h2>

          <p className="mt-1 text-sm text-[#647067]">
            Update resource availability for your hospital.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {["General Beds", "ICU Beds", "Ventilators", "Blood Units"].map(
              (resource) => (
                <div
                  key={resource}
                  className="rounded-xl border border-[#E7ECE8] p-4"
                >
                  <label className="text-sm font-medium text-[#172019]">
                    {resource}
                  </label>

                  <input
                    type="number"
                    defaultValue="20"
                    className="mt-2 w-full rounded-lg border border-[#DDE5DF] bg-white px-3 py-2 text-sm text-[#172019] outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              )
            )}
          </div>

          <button className="mt-6 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}