import { useState, useEffect } from "react";
import {
  Building2,
  BedDouble,
  Droplet,
  ArrowRightLeft,
  CheckCircle2,
  Plus,
  Activity,
  Wind,
  Save,
} from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import { useAuth } from "../context/AuthContext";
import { fetchTransfers } from "../services/api";

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || "hosp_001";
  const hospitalName =
    hospitalId === "hosp_001"
      ? "KMC Hospital Mangaluru"
      : hospitalId === "hosp_002"
        ? "AJ Hospital & Research Centre"
        : "Father Muller Medical College Hospital";

  const [transfers, setTransfers] = useState<any[]>([]);
  const [editingResources, setEditingResources] = useState(false);
  const [deptResources, setDeptResources] = useState({
    icuBeds: 10,
    generalBeds: 22,
    emergencyBeds: 8,
    ventilators: 6,
    bloodUnitsO: 12,
    bloodUnitsA: 18,
  });

  useEffect(() => {
    fetchTransfers().then((data) => {
      if (data && Array.isArray(data)) {
        setTransfers(
          data.filter(
            (t: any) =>
              t.target_hospital === hospitalId ||
              t.target_hospital === hospitalName ||
              !t.target_hospital
          )
        );
      }
    });
  }, [hospitalId, hospitalName]);

  const totalBeds = deptResources.icuBeds + deptResources.generalBeds + deptResources.emergencyBeds;
  const occupancyRate = 72.4;

  const handleSaveResources = () => {
    setEditingResources(false);
    alert(`Resource updates saved for ${hospitalName}!`);
  };

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-green-700">
                <Building2 size={20} />
                <p className="text-xs font-bold uppercase tracking-wider">
                  HOSPITAL COORDINATOR PORTAL
                </p>
              </div>
              <h1 className="mt-1 text-3xl font-extrabold text-[#172019]">
                {hospitalName} ({hospitalId})
              </h1>
              <p className="mt-1 text-sm text-[#647067]">
                Logged in as <span className="font-bold">{user?.username}</span> · Department-Level Capacity & Transfer Response
              </p>
            </div>

            <button
              onClick={() => setEditingResources(!editingResources)}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-green-800 cursor-pointer"
            >
              {editingResources ? <Save size={16} /> : <Plus size={16} />}
              {editingResources ? "Save Resource Updates" : "Update Department Capacity"}
            </button>
          </div>

          {/* Single Hospital Occupancy & Analytics Bar */}
          <div className="mt-6 rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                  Single-Hospital Utilization Analytics
                </span>
                <h3 className="mt-0.5 text-base font-bold text-slate-900">
                  Facility Live Occupancy: {occupancyRate}%
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-3 w-48 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-green-800">{totalBeds} Total Available Beds</span>
              </div>
            </div>
          </div>

          {/* Department Bed & Resource Breakdown (Main View) */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                Department-Level Resources & Inventory
              </p>
              <span className="text-xs text-slate-400">Scoped strictly to {hospitalId}</span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <BedDouble className="text-green-700" size={24} />
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">ICU Dept</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Available ICU Beds</p>
                {editingResources ? (
                  <input
                    type="number"
                    value={deptResources.icuBeds}
                    onChange={(e) => setDeptResources({ ...deptResources, icuBeds: parseInt(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-xl font-bold"
                  />
                ) : (
                  <p className="mt-1 text-3xl font-bold text-slate-900">{deptResources.icuBeds} Free</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Critical Care Unit</p>
              </div>

              <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <BedDouble className="text-blue-600" size={24} />
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">General Ward</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">General Ward Beds</p>
                {editingResources ? (
                  <input
                    type="number"
                    value={deptResources.generalBeds}
                    onChange={(e) => setDeptResources({ ...deptResources, generalBeds: parseInt(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-xl font-bold"
                  />
                ) : (
                  <p className="mt-1 text-3xl font-bold text-slate-900">{deptResources.generalBeds} Free</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Inpatient Wards</p>
              </div>

              <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <Wind className="text-purple-600" size={24} />
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">Ventilators</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Ventilator Inventory</p>
                {editingResources ? (
                  <input
                    type="number"
                    value={deptResources.ventilators}
                    onChange={(e) => setDeptResources({ ...deptResources, ventilators: parseInt(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-xl font-bold"
                  />
                ) : (
                  <p className="mt-1 text-3xl font-bold text-slate-900">{deptResources.ventilators} Ready</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Mechanical Ventilators</p>
              </div>

              <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <Droplet className="text-red-600" size={24} />
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Blood Bank</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Blood Stock (O- & A+)</p>
                {editingResources ? (
                  <input
                    type="number"
                    value={deptResources.bloodUnitsO}
                    onChange={(e) => setDeptResources({ ...deptResources, bloodUnitsO: parseInt(e.target.value) || 0 })}
                    className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-xl font-bold"
                  />
                ) : (
                  <p className="mt-1 text-3xl font-bold text-red-700">{deptResources.bloodUnitsO} Units</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Universal Donor Stock</p>
              </div>
            </div>

            {editingResources && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSaveResources}
                  className="rounded-xl bg-green-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-green-800"
                >
                  Save All Changes
                </button>
              </div>
            )}
          </section>

          {/* Incoming Transfer Requests for this Hospital */}
          <section className="mt-8 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Incoming Transfer Queue ({hospitalName})
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review and accept incoming patient transfer requests routed to your facility.
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                {transfers.length} Pending Actions
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {transfers.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No incoming transfer requests targeting {hospitalName} currently.
                </p>
              ) : (
                transfers.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between transition hover:border-green-300"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.id}</span>
                        <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                          {t.status || "PENDING"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {t.patient_condition || t.patient || "Emergency Trauma Transfer"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Origin: {t.source_hospital || t.from || "Regional Clinic"} $\rightarrow$ Target: {hospitalName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Accepted Transfer ${t.id}! Reserved ICU bed in ${hospitalName}.`)}
                        className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800 cursor-pointer"
                      >
                        <CheckCircle2 size={15} />
                        Approve Bed Reservation
                      </button>
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
