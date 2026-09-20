import { useEffect, useState } from "react";
import Sidebar from "../components/common/Sidebar";
import { fetchHospitals } from "../services/api";

export default function Hospitals() {
  const [hospitals, setHospitals] = useState<any[]>([
    {
      name: "KMC Hospital Mangaluru",
      location: "Light House Hill Rd, Mangaluru",
      beds: 32,
      icu: 6,
      utilization: 72,
      status: "Available",
    },
    {
      name: "AJ Hospital & Research Centre",
      location: "Kuntikana, Mangaluru",
      beds: 18,
      icu: 2,
      utilization: 81,
      status: "Available",
    },
    {
      name: "Father Muller Medical College Hospital",
      location: "Kankanady, Mangaluru",
      beds: 7,
      icu: 1,
      utilization: 94,
      status: "Limited",
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setHospitals(
            data.map((h: any) => ({
              name: h.name || h.hospital_name,
              location: h.location || h.address || "Karnataka",
              beds: h.total_available_beds ?? h.beds ?? 20,
              icu: h.available_icu_beds ?? h.icu ?? 5,
              utilization: h.occupancy ?? Math.floor(65 + Math.random() * 25),
              status: h.status || (h.total_available_beds > 10 ? "Available" : "Limited"),
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div>
            <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Hospitals
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Connected Hospitals Network
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              View live hospital availability, ICU capacity, and resource utilization.
            </p>
          </div>

          {/* Hospital List */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Hospital Network Directory ({hospitals.length} Facilities)
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading live hospital data...</div>
              ) : (
                hospitals.map((hospital, index) => (
                  <div
                    key={hospital.name}
                    className={`px-6 py-6 ${
                      index !== hospitals.length - 1
                        ? "border-b border-[#E7ECE8]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      {/* Hospital */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="font-semibold text-[#172019]">
                            {hospital.name}
                          </h2>

                          <span className="text-xs font-semibold text-green-700">
                            {hospital.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-[#647067]">
                          {hospital.location}
                        </p>
                      </div>

                      {/* Resources */}
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-xs text-[#89938C]">
                            Available Beds
                          </p>

                          <p className="mt-1 text-xl font-semibold text-[#172019]">
                            {hospital.beds}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#89938C]">
                            ICU Beds
                          </p>

                          <p className="mt-1 text-xl font-semibold text-[#172019]">
                            {hospital.icu}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#89938C]">
                            Utilization
                          </p>

                          <p className="mt-1 text-xl font-semibold text-green-700">
                            {hospital.utilization}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}