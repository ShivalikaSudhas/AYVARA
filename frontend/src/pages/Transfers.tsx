import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import { fetchTransfers } from "../services/api";

interface Transfer {
  id: string;
  patient: string;
  from: string;
  to: string;
  status: "Completed" | "In Transit" | "Pending";
  time: string;
}

export default function Transfers() {
  const [loading, setLoading] = useState(true);
  const [transfersList, setTransfersList] = useState<Transfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] =
    useState<Transfer | null>(null);

  useEffect(() => {
    async function loadTransfers() {
      try {
        setLoading(true);

        const data = await fetchTransfers();

        if (Array.isArray(data)) {
          const formattedTransfers: Transfer[] = data.map((transfer: any) => ({
            id: transfer.id,
            patient:
              transfer.patient_condition || "Emergency Patient Transfer",
            from: transfer.source_hospital || "Unknown Hospital",
            to: transfer.target_hospital || "Unknown Hospital",
            status:
              transfer.status === "COMPLETED"
                ? "Completed"
                : transfer.status === "IN_PROGRESS"
                  ? "In Transit"
                  : "Pending",
            time: transfer.requested_at || "Recently requested",
          }));

          setTransfersList(formattedTransfers);
        } else {
          setTransfersList([]);
        }
      } catch (error) {
        console.error("Failed to load transfers:", error);
        setTransfersList([]);
      } finally {
        setLoading(false);
      }
    }

    loadTransfers();
  }, []);

  const activeTransfers = transfersList.filter(
    (transfer) => transfer.status === "In Transit"
  ).length;

  const pendingTransfers = transfersList.filter(
    (transfer) => transfer.status === "Pending"
  ).length;

  const completedTransfers = transfersList.filter(
    (transfer) => transfer.status === "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">
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
                  {loading ? "—" : activeTransfers}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Currently in transit
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Pending Handover
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  {loading ? "—" : pendingTransfers}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Awaiting hospital handover
                </p>
              </div>

              <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
                <p className="text-sm font-semibold text-green-700">
                  Completed
                </p>

                <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                  {loading ? "—" : completedTransfers}
                </p>

                <p className="mt-2 text-xs text-[#89938C]">
                  Completed transfers
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                Transfer Queue
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">
              {loading ? (
                <div className="px-6 py-8 text-sm text-[#89938C]">
                  Loading transfers...
                </div>
              ) : transfersList.length === 0 ? (
                <div className="px-6 py-8 text-sm text-[#89938C]">
                  No transfer records available.
                </div>
              ) : (
                transfersList.map((transfer, index) => (
                  <div
                    key={transfer.id}
                    className={`px-6 py-5 ${
                      index !== transfersList.length - 1
                        ? "border-b border-[#E7ECE8]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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

                      <div className="flex flex-col gap-1 md:items-end">
                        <span className="text-sm font-medium text-green-700">
                          {transfer.status}
                        </span>

                        <span className="text-xs text-[#89938C]">
                          {transfer.time}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedTransfer(transfer)}
                        className="rounded-lg border border-[#DDE5DF] px-4 py-2 text-sm font-medium text-[#172019] transition hover:border-green-600 hover:bg-green-50 hover:text-green-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {selectedTransfer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6"
          onClick={() => setSelectedTransfer(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
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

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-[#89938C]">Patient</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.patient}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">From</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.from}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">To</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.to}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">Status</p>
                <p className="mt-1 text-sm font-medium text-green-700">
                  {selectedTransfer.status}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#89938C]">Updated</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">
                  {selectedTransfer.time}
                </p>
              </div>
            </div>

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