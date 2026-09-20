import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchTransfers } from "../services/api";

interface Transfer {
  transfer_id: string;
  origin_hospital_id: string;
  origin_hospital_name: string;
  destination_hospital_id: string;
  destination_hospital_name: string;
  patient_id: string;
  reason: string;
  department_needed: string;
  status: string;
  response_notes?: string | null;
  created_at: string;
  updated_at: string;
}

type TransferStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "In Transit"
  | "Completed"
  | "Cancelled";

function getStatus(status: string): TransferStatus {
  switch (status.toLowerCase()) {
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "in_transit":
      return "In Transit";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function statusStyle(status: TransferStatus) {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700";
    case "Accepted":
    case "In Transit":
      return "bg-blue-50 text-blue-700";
    case "Rejected":
    case "Cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTransfer, setSelectedTransfer] =
    useState<Transfer | null>(null);

  useEffect(() => {
    async function loadTransfers() {
      try {
        setLoading(true);
        setError(false);

        const data = await fetchTransfers();

        setTransfers(data);
      } catch (err) {
        console.error("Failed to load transfers:", err);
        setError(true);
        setTransfers([]);
      } finally {
        setLoading(false);
      }
    }

    loadTransfers();
  }, []);

  const completedCount = transfers.filter(
    (transfer) => getStatus(transfer.status) === "Completed"
  ).length;

  const inTransitCount = transfers.filter(
    (transfer) => getStatus(transfer.status) === "In Transit"
  ).length;

  const pendingCount = transfers.filter(
    (transfer) => getStatus(transfer.status) === "Pending"
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      <section className="mb-10">
        <p className="section-label mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
          Transfers
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#172019]">
          Resource Transfers
        </h1>

        <p className="mt-2 text-sm text-[#647067]">
          Monitor transfers between connected hospitals.
        </p>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-[#e4e9e5] bg-white">
          <div className="flex items-center justify-center py-16 text-sm text-[#647067]">
            Loading transfers...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          Unable to load transfers. Please check the backend connection.
        </div>
      ) : (
        <>
          <section className="mb-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
              <p className="text-sm text-[#647067]">Pending</p>
              <p className="mt-3 text-3xl font-semibold text-[#172019]">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
              <p className="text-sm text-[#647067]">In Transit</p>
              <p className="mt-3 text-3xl font-semibold text-[#172019]">
                {inTransitCount}
              </p>
            </div>

            <div className="rounded-2xl border border-[#e4e9e5] bg-white p-5">
              <p className="text-sm text-[#647067]">Completed</p>
              <p className="mt-3 text-3xl font-semibold text-[#172019]">
                {completedCount}
              </p>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                Transfer Queue
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                Active Transfers
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e4e9e5] bg-white">
              {transfers.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#647067]">
                  No transfers available.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left">
                    <thead className="border-b border-[#e4e9e5] bg-[#fafcfb]">
                      <tr>
                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                          Transfer
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                          Route
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                          Department
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                          Status
                        </th>

                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#647067]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {transfers.map((transfer) => {
                        const status = getStatus(transfer.status);

                        return (
                          <tr
                            key={transfer.transfer_id}
                            className="border-b border-[#eef1ef] last:border-0"
                          >
                            <td className="px-5 py-5">
                              <p className="font-medium text-[#172019]">
                                {transfer.transfer_id}
                              </p>

                              <p className="mt-1 text-xs text-[#8a948d]">
                                Patient: {transfer.patient_id}
                              </p>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#172019]">
                              <div>{transfer.origin_hospital_name}</div>

                              <div className="my-1 text-xs text-[#8a948d]">
                                ↓
                              </div>

                              <div>{transfer.destination_hospital_name}</div>
                            </td>

                            <td className="px-5 py-5 text-sm text-[#172019]">
                              {transfer.department_needed}
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <button
                                type="button"
                                onClick={() => setSelectedTransfer(transfer)}
                                className="rounded-full border border-[#dfe5e1] px-4 py-2 text-xs font-medium text-[#172019] transition hover:border-green-700 hover:text-green-800"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {selectedTransfer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-lg rounded-2xl border border-[#e4e9e5] bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-label text-xs font-semibold uppercase tracking-[0.18em] text-green-800">
                  Transfer Details
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#172019]">
                  {selectedTransfer.transfer_id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransfer(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#647067] transition hover:bg-[#f4f6f4] hover:text-[#172019]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Source Hospital
                </p>

                <p className="mt-1 text-sm text-[#172019]">
                  {selectedTransfer.origin_hospital_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Destination Hospital
                </p>

                <p className="mt-1 text-sm text-[#172019]">
                  {selectedTransfer.destination_hospital_name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Patient ID
                </p>

                <p className="mt-1 text-sm text-[#172019]">
                  {selectedTransfer.patient_id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Reason
                </p>

                <p className="mt-1 text-sm text-[#172019]">
                  {selectedTransfer.reason}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Department Needed
                </p>

                <p className="mt-1 text-sm text-[#172019]">
                  {selectedTransfer.department_needed}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Created At
                </p>

                <p className="mt-1 text-sm text-[#172019]">
                  {new Date(selectedTransfer.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                    getStatus(selectedTransfer.status)
                  )}`}
                >
                  {getStatus(selectedTransfer.status)}
                </span>
              </div>

              {selectedTransfer.response_notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8a948d]">
                    Response Notes
                  </p>

                  <p className="mt-1 text-sm text-[#172019]">
                    {selectedTransfer.response_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
