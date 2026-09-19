import { Building2, Search, Plus, MapPin } from "lucide-react";

import Sidebar from "../components/common/Sidebar";

const hospitals = [
  {
    name: "City General Hospital",
    location: "Central District",
    beds: 32,
    departments: 8,
    status: "Available",
  },
  {
    name: "St. Mary's Medical Center",
    location: "North District",
    beds: 18,
    departments: 6,
    status: "Available",
  },
  {
    name: "Central Emergency Hospital",
    location: "East District",
    beds: 7,
    departments: 9,
    status: "Limited",
  },
  {
    name: "Green Valley Hospital",
    location: "West District",
    beds: 25,
    departments: 5,
    status: "Available",
  },
];

export default function Hospitals() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              FACILITIES
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
              Hospitals
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Manage connected hospitals and their departments.
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-800">
            <Plus size={18} />
            Add Hospital
          </button>
        </div>

        {/* Search */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-[#DDE5DF] bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-[#8A958E]" />

          <input
            placeholder="Search hospitals..."
            className="w-full bg-transparent text-sm text-[#172019] outline-none placeholder:text-[#8A958E]"
          />
        </div>

        {/* Hospital Cards */}
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {hospitals.map((hospital) => (
            <div
              key={hospital.name}
              className="rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="rounded-xl bg-green-50 p-3 text-green-700">
                    <Building2 size={24} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-[#172019]">
                      {hospital.name}
                    </h2>

                    <div className="mt-1 flex items-center gap-1 text-xs text-[#8A958E]">
                      <MapPin size={13} />
                      {hospital.location}
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    hospital.status === "Available"
                      ? "bg-green-50 text-green-700"
                      : "bg-orange-50 text-orange-700"
                  }`}
                >
                  {hospital.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F6F8F6] p-4">
                  <p className="text-xs text-[#8A958E]">
                    Available Beds
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#172019]">
                    {hospital.beds}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F6F8F6] p-4">
                  <p className="text-xs text-[#8A958E]">
                    Departments
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#172019]">
                    {hospital.departments}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}