import { useState, useEffect } from "react";
import {
  Building2,
  BedDouble,
  Droplet,
  ArrowRightLeft,
  CheckCircle2,
  Plus,
} from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import { useAuth } from "../context/AuthContext";
import { fetchTransfers } from "../services/api";

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const hospitalId = user?.hospital_id || "hosp_001";

  const [transfers, setTransfers] = useState<any[]>([]);

  useEffect(() => {
    fetchTransfers().then((data) => {
      if (data && Array.isArray(data)) setTransfers(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-700">
              <Building2 size={20} />
              <p className="text-xs font-bold uppercase tracking-wider">
                HOSPITAL COORDINATOR PORTAL
              </p>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-[#172019]">
              Facility Capacity & Resource Management
            </h1>
            <p className="mt-1 text-sm text-[#647067]">
              Logged in as <span className="font-bold">{user?.username}</span> (Scoped to: <span className="font-mono font-bold text-green-800">{hospitalId}</span>)
            </p>
          </div>

          <button className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-green-800">
            <Plus size={16} />
            Update Bed Inventory
          </button>
        </div>

        {/* Hospital-scoped summary metrics */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <BedDouble className="text-green-700" size={24} />
            <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Hospital Beds</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">22 Available</p>
            <p className="mt-1 text-xs text-slate-400">6 ICU Beds Free</p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Droplet className="text-red-600" size={24} />
            <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Blood Stock</p>
            <p className="mt-1 text-3xl font-bold text-red-700">10 Units (O-)</p>
            <p className="mt-1 text-xs text-slate-400">A+ 20 Units | B+ 15 Units</p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <ArrowRightLeft className="text-orange-500" size={24} />
            <p className="mt-3 text-xs font-semibold text-slate-500 uppercase">Incoming Transfers</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{transfers.length} Requests</p>
            <p className="mt-1 text-xs text-slate-400">Requires Coordinator Approval</p>
          </div>
        </div>

        {/* Incoming Transfer Requests for this Hospital */}
        <div className="mt-8 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Incoming Transfer & Bed Reservation Queue ({hospitalId})
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Review and accept incoming patient transfer requests routed to your facility.
          </p>

          <div className="mt-5 space-y-3">
            {transfers.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-green-300"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{t.id}</span>
                    <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                      {t.status || "PENDING"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {t.patient_condition || t.patient}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    From: {t.source_hospital || t.from} $\rightarrow$ To: {t.target_hospital || t.to}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Accepted Transfer ${t.id}! Bed status set to RESERVED.`)}
                    className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                  >
                    <CheckCircle2 size={15} />
                    Accept Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
