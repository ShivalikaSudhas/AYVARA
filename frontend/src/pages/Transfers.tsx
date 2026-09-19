import { X } from "lucide-react";
import { useState } from "react";

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

type Transfer = (typeof transfers)[number];

export default function Transfers() {
  const [selectedTransfer, setSelectedTransfer] =
    useState<Transfer | null>(null);

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div>
            <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              Patient Movement
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
              Transfers
            </h1>

            <p className="mt-2 text-sm text-[#647067]">
              Track inter-hospital transfers and handovers.
            </p>
          </div>

          {/* Transfer Status */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Transfer Status
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Active Transfers
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  8
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Currently in progress
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Pending Handover
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  3
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Awaiting hospital handover
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Completed Today
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  24
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Transfers completed today
                </p>
              </div>

            </div>
          </section>

          {/* Transfer Queue */}
          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Transfer Queue
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">

              {transfers.map((transfer, index) => (
                <div
                  key={transfer.id}
                  className={`px-6 py-5 ${
                    index !== transfers.length - 1
                      ? "border-b border-[#E7ECE8]"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* Transfer Info */}
                    <div>
                      <p className="font-semibold text-[#172019]">
                        {transfer.id}
                      </p>

                      <p className="mt-1 text-sm text-[#172019]">
                        {transfer.patient}
                      </p>

                      <p className="mt-2 text-xs text-[#89938C]">
                        {transfer.from} → {transfer.to}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-1 md:items-end">
                      <span className="text-sm font-medium text-green-700">
                        {transfer.status}
                      </span>

                      <span className="text-xs text-[#89938C]">
                        {transfer.time}
                      </span>
                    </div>

                    {/* View Details */}
                    <button
                      onClick={() => setSelectedTransfer(transfer)}
                      className="rounded-lg border border-[#DDE5DF] px-4 py-2 text-sm font-medium text-[#172019] transition hover:border-green-600 hover:bg-green-50 hover:text-green-700"
                    >
                      View Details
                    </button>

                  </div>
                </div>
              ))}

            </div>
          </section>

        </div>
      </main>

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6"
          onClick={() => setSelectedTransfer(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  Transfer Details
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#172019]">
                  {selectedTransfer.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTransfer(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#89938C] transition hover:bg-[#F6F8F6] hover:text-[#172019]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Details */}
            <div className="mt-6 space-y-4">

              <div>
                <p className="text-xs text-[#89938C]">
                  Patient
                </p>

                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.patient}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">
                  From
                </p>

                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.from}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">
                  To
                </p>

                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.to}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-green-700">
                  {selectedTransfer.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">
                  Updated
                </p>

                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.time}
                </p>
              </div>

            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedTransfer(null)}
              className="mt-7 w-full rounded-lg bg-green-700 py-2.5 text-sm font-medium text-white transition hover:bg-green-800"
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}