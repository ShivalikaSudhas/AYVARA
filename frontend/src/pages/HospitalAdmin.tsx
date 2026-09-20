import { useEffect, useState } from "react";
import {
  fetchHospitals,
  fetchDepartments,
  fetchBeds,
  fetchResources,
  fetchBloodInventory,
} from "../services/api";

interface Hospital {
  id: string;
  name: string;
  address?: string | null;
}

interface Department {
  id: string;
  hospital_id: string;
  name: string;
  status: string;
}

export default function HospitalAdmin() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [bedCount, setBedCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [bloodCount, setBloodCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadHospitals() {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchHospitals();

        setHospitals(data);

        if (data.length > 0) {
          setSelectedHospital(data[0]);
        }
      } catch (err) {
        console.error("Failed to load hospitals:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadHospitals();
  }, []);

  useEffect(() => {
    async function loadResources() {
      if (!selectedHospital) return;

      try {
        const departmentData = await fetchDepartments(selectedHospital.id);
        setDepartments(departmentData);

        let beds = 0;
        let resources = 0;

        for (const department of departmentData) {
          const [bedData, resourceData] = await Promise.all([
            fetchBeds(department.id),
            fetchResources(department.id),
          ]);

          beds += bedData.length;
          resources += resourceData.length;
        }

        const bloodData = await fetchBloodInventory(selectedHospital.id);

        setBedCount(beds);
        setResourceCount(resources);
        setBloodCount(bloodData.length);
      } catch (err) {
        console.error("Failed to load hospital resources:", err);
      }
    }

    loadResources();
  }, [selectedHospital]);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      <section className="mb-10">
        <p className="section-label mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
          Hospital Administration
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#172019]">
          Resource Management
        </h1>

        <p className="mt-2 text-sm text-[#647067]">
          Monitor current resources across the hospital network.
        </p>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-[#e4e9e5] bg-white">
          <div className="flex items-center justify-center py-16 text-sm text-[#647067]">
            Loading hospital resources...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          Unable to load hospital resources. Please check the backend
          connection.
        </div>
      ) : hospitals.length === 0 ? (
        <div className="rounded-2xl border border-[#e4e9e5] bg-white py-12 text-center text-sm text-[#647067]">
          No hospitals available.
        </div>
      ) : (
        <>
          {hospitals.length > 1 && (
            <section className="mb-8">
              <label
                htmlFor="hospital"
                className="mb-2 block text-sm font-medium text-[#172019]"
              >
                Hospital
              </label>

              <select
                id="hospital"
                value={selectedHospital?.id || ""}
                onChange={(event) => {
                  const hospital = hospitals.find(
                    (item) => item.id === event.target.value
                  );

                  setSelectedHospital(hospital || null);
                }}
                className="w-full max-w-md rounded-xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm text-[#172019] outline-none focus:border-green-700"
              >
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </section>
          )}

          <section className="mb-10">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Current Resources
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                {selectedHospital?.name || "Hospital Resources"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Departments</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {departments.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Beds</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {bedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Resources</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {resourceCount}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
                <p className="text-sm text-[#647067]">Blood Inventory</p>
                <p className="mt-3 text-3xl font-semibold text-[#172019]">
                  {bloodCount}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Departments
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Hospital Departments
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e4e9e5] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left">
                  <thead className="border-b border-[#e4e9e5] bg-[#fafcfb]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                        Department
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {departments.map((department) => (
                      <tr
                        key={department.id}
                        className="border-b border-[#eef1ef] last:border-0"
                      >
                        <td className="px-5 py-4 font-medium text-[#172019]">
                          {department.name}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            {department.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}