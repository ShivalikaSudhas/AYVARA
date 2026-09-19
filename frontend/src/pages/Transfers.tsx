import {
  ArrowRightLeft,
  CheckCircle2,
  Clock3,
  QrCode,
} from "lucide-react";

import Sidebar from "../components/common/Sidebar";

const transfers = [
  {
    id: "TR-2081",
    patient: "Emergency Case ER-1042",
    from: "City General Hospital",
    to: "Central Emergency Hospital",
    status: "In Transit",
    time: "12 min ago",
  },
  {
    id: "TR-2080",
    patient: "Emergency Case ER-1041",
    from: "St. Mary's Medical Center",
    to: "City General Hospital",
    status: "Completed",
    time: "34 min ago",
  },
  {
    id: "TR-2079",
    patient: "Emergency Case ER-1038",
    from: "Green Valley Hospital",
    to: "St. Mary's Medical Center",
    status: "Pending",
    time: "48 min ago",
  },
];

export default function Transfers() {
  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="ml-64 p-8">
        <p className="text-sm font-semibold tracking-wide text-green-700">
          PATIENT MOVEMENT
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172019]">
          Transfers
        </h1>

        <p className="mt-2 text-sm text-[#647067]">
          Track inter-hospital transfers and handovers.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <ArrowRightLeft className="text-green-700" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Active Transfers
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              8
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <Clock3 className="text-orange-500" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Pending Handover
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              3
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5DF] bg-white p-5 shadow-sm">
            <CheckCircle2 className="text-green-600" size={22} />

            <p className="mt-4 text-sm text-[#647067]">
              Completed Today
            </p>

            <p className="mt-1 text-3xl font-bold text-[#172019]">
              24
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-[#172019]">
            Transfer Queue
          </h2>

          <div className="mt-5 space-y-3">
            {transfers.map((transfer) => (
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