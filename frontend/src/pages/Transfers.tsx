import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  QrCode,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";
import { fetchTransfers } from "../services/api";

export default function Transfers() {
  const [loading, setLoading] = useState(true);
  const [transfersList, setTransfersList] = useState<any[]>([]);

  const loadTransfersData = async () => {
    setLoading(true);
    try {
      const data = await fetchTransfers();
      if (data && Array.isArray(data)) {
        setTransfersList(
          data.map((t: any) => ({
            id: t.id || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
            patient: t.patient_condition || "Severe Emergency Case",
            from: t.source_hospital || "City General Hospital",
            to: t.target_hospital || "Janapriya Hospital",
            status: t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In Transit" : "Pending",
            time: t.requested_at || "Just now",
          }))
        );
      }
    } catch (e) {
      console.error("Transfers fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfersData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-green-700">
              PATIENT MOVEMENT
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
              Inter-Hospital Transfers
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Track and coordinate inter-hospital patient handovers.
            </p>
          </div>

          <button
            onClick={loadTransfersData}
            className="flex items-center gap-1.5 rounded-lg border border-[#DDE5DF] bg-white px-3 py-2 text-xs font-medium text-[#172019] shadow-sm hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Queue
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <ArrowRightLeft className="text-green-700" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Active Transfers
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              {transfersList.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-500" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Pending Handover
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              {transfersList.filter((t) => t.status === "Pending").length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Completed Handovers
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              {transfersList.filter((t) => t.status === "Completed").length}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#172019]">
            Transfer Queue & Handover
          </h2>

          <div className="mt-5 space-y-3">
            {transfersList.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between rounded-xl border border-[#E7ECE8] p-4 transition hover:border-green-200 hover:bg-[#F9FCF9]"
              >
                <div>
                  <p className="font-medium text-[#172019]">
                    {transfer.id}
                  </p>

                  <p className="mt-1 text-sm text-[#647067]">
                    {transfer.patient}
                  </p>

                  <p className="mt-1 text-xs text-[#89938C]">
                    {transfer.from} → {transfer.to}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#89938C]">
                    {transfer.time}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      transfer.status === "Completed"
                        ? "bg-green-50 text-green-700"
                        : transfer.status === "In Transit"
                          ? "bg-green-50 text-green-700"
                          : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    {transfer.status}
                  </span>

                  <button className="rounded-lg border border-[#DDE5DF] p-2 text-[#647067] transition hover:bg-green-50 hover:text-green-700">
                    <QrCode size={17} />
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