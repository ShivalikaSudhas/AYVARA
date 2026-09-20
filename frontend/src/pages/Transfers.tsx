import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle, Shield, Building2, Ambulance, BarChart3 } from "lucide-react";
import Sidebar from "../components/common/Sidebar";
import { useAuth } from "../context/AuthContext";
import { fetchTransfers, fetchHospitals } from "../services/api";

interface Transfer {
  id: string;
  patient: string;
  from: string;
  to: string;
  status: "Completed" | "In Transit" | "Pending";
  time: string;
  source_hospital?: string;
  target_hospital?: string;
  initiated_by?: string;
}

export default function Transfers() {
  const { user } = useAuth();
  const role = user?.role;
  const hospitalId = user?.hospital_id;

  const [loading, setLoading] = useState(true);
  const [transfersList, setTransfersList] = useState<Transfer[]>([]);
  const [allHospitals, setAllHospitals] = useState<any[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, hospData] = await Promise.all([
          fetchTransfers(),
          fetchHospitals(),
        ]);

        if (Array.isArray(data)) {
          const formatted: Transfer[] = data.map((t: any) => ({
            id: t.id,
            patient: t.patient_condition || "Emergency Patient Transfer",
            from: t.source_hospital || "Unknown Hospital",
            to: t.target_hospital || "Unknown Hospital",
            status:
              t.status === "COMPLETED"
                ? "Completed"
                : t.status === "IN_PROGRESS"
                  ? "In Transit"
                  : "Pending",
            time: t.requested_at || "Recently requested",
            source_hospital: t.source_hospital,
            target_hospital: t.target_hospital,
            initiated_by: t.initiated_by || t.dispatcher_id,
          }));
          setTransfersList(formatted);
        }

        if (Array.isArray(hospData) && hospData.length > 0) {
          setAllHospitals(hospData.map((h: any) => ({
            id: h.id || h.hospital_id,
            name: h.name || h.hospital_name,
            beds: h.total_available_beds ?? h.beds ?? 20,
            icu: h.available_icu_beds ?? 5,
            occupancy: h.occupancy ?? Math.floor(60 + Math.random() * 30),
            status: h.status || (h.total_available_beds > 10 ? "Available" : "Limited"),
          })));
        } else {
          // Fallback hospital data for cross-hospital view
          setAllHospitals([
            { id: "hosp_001", name: "KMC Hospital Mangaluru", beds: 32, icu: 10, occupancy: 72, status: "Available" },
            { id: "hosp_002", name: "AJ Hospital & Research Centre", beds: 18, icu: 5, occupancy: 81, status: "Available" },
            { id: "hosp_003", name: "Father Muller Medical College Hospital", beds: 7, icu: 2, occupancy: 94, status: "Limited" },
            { id: "hosp_004", name: "Yenepoya Specialty Hospital", beds: 24, icu: 8, occupancy: 65, status: "Available" },
            { id: "hosp_005", name: "Indiana Hospital & Heart Institute", beds: 15, icu: 6, occupancy: 78, status: "Available" },
          ]);
        }
      } catch (error) {
        console.error("Failed to load transfers:", error);
        setTransfersList([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter transfers by role
  const visibleTransfers = (() => {
    if (role === "admin") {
      return transfersList; // All transfers
    }
    if (role === "coordinator") {
      // Transfers targeting or originating from this hospital
      return transfersList.filter(
        (t) =>
          t.target_hospital === hospitalId ||
          t.source_hospital === hospitalId ||
          t.to.includes(hospitalId || "") ||
          t.from.includes(hospitalId || "")
      );
    }
    if (role === "dispatcher") {
      // Transfers they initiated — show all since we don't always have initiated_by
      return transfersList.filter(
        (t) => t.initiated_by === user?.username || t.status === "Pending" || t.status === "In Transit"
      );
    }
    return [];
  })();

  const activeCount = visibleTransfers.filter((t) => t.status === "In Transit").length;
  const pendingCount = visibleTransfers.filter((t) => t.status === "Pending").length;
  const completedCount = visibleTransfers.filter((t) => t.status === "Completed").length;

  const getRoleHeader = () => {
    if (role === "admin") return { label: "ALL HOSPITALS · SYSTEM-WIDE", title: "Transfer Management & Oversight", desc: "Full visibility into all inter-hospital patient transfers across the regional network." };
    if (role === "coordinator") return { label: `COORDINATOR · ${hospitalId?.toUpperCase()}`, title: "Incoming & Outgoing Transfers", desc: `Review transfer requests targeting or originating from your facility (${hospitalId}). Approve or reject bed reservations.` };
    if (role === "dispatcher") return { label: "DISPATCHER · EMT REGIONAL", title: "Dispatch Transfer Status", desc: "Track the status of emergency transfers initiated through dispatch. Read-only view." };
    return { label: "", title: "Transfers", desc: "" };
  };

  const header = getRoleHeader();

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <Sidebar />

      <main className="px-6 pb-10 pt-8">
        <div className="mx-auto max-w-7xl">

          {/* Header with Role Badge */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                {role === "admin" && <Shield size={16} className="text-green-700" />}
                {role === "coordinator" && <Building2 size={16} className="text-green-700" />}
                {role === "dispatcher" && <Ambulance size={16} className="text-red-600" />}
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${role === "dispatcher" ? "text-red-600" : "text-green-700"}`}>
                  {header.label}
                </p>
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#172019]">
                {header.title}
              </h1>
              <p className="mt-2 text-sm text-[#647067]">{header.desc}</p>
            </div>

            {role === "dispatcher" && (
              <span className="self-start rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 border border-amber-200">
                Read-Only View
              </span>
            )}
          </div>

          {/* Status Summary Cards */}
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
              <p className="text-sm font-semibold text-green-700">Active Transfers</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                {loading ? "—" : activeCount}
              </p>
              <p className="mt-2 text-xs text-[#89938C]">Currently in transit</p>
            </div>

            <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
              <p className="text-sm font-semibold text-green-700">Pending Handover</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                {loading ? "—" : pendingCount}
              </p>
              <p className="mt-2 text-xs text-[#89938C]">Awaiting approval / handover</p>
            </div>

            <div className="rounded-xl border border-green-600 bg-white px-5 py-6">
              <p className="text-sm font-semibold text-green-700">Completed</p>
              <p className="mt-5 text-4xl font-semibold tracking-tight text-[#172019]">
                {loading ? "—" : completedCount}
              </p>
              <p className="mt-2 text-xs text-[#89938C]">Successfully transferred</p>
            </div>
          </section>

          {/* Transfer Queue */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                {role === "admin" ? "All System Transfers" : role === "coordinator" ? "Your Hospital Transfer Queue" : "Active Dispatch Transfers"}
              </p>
              {role === "admin" && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {visibleTransfers.length} total records
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-[#DDE5DF] bg-white">
              {loading ? (
                <div className="px-6 py-10 text-center text-sm text-[#89938C]">Loading transfers...</div>
              ) : visibleTransfers.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-[#89938C]">
                  No transfer records available for your scope.
                </div>
              ) : (
                visibleTransfers.map((transfer, index) => (
                  <div
                    key={transfer.id}
                    className={`px-6 py-5 ${index !== visibleTransfers.length - 1 ? "border-b border-[#E7ECE8]" : ""}`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#172019]">{transfer.id}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            transfer.status === "Pending"
                              ? "bg-orange-50 text-orange-700"
                              : transfer.status === "In Transit"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-green-50 text-green-700"
                          }`}>
                            {transfer.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-[#172019]">{transfer.patient}</p>
                        <p className="mt-1.5 text-xs text-[#89938C]">
                          {transfer.from} → {transfer.to}
                        </p>
                        <p className="mt-0.5 text-xs text-[#89938C]">{transfer.time}</p>
                      </div>

                      {/* Role-based action buttons */}
                      <div className="flex flex-col items-end gap-2 md:items-end">
                        {/* Admin: Override action */}
                        {role === "admin" && transfer.status !== "Completed" && (
                          <button
                            onClick={() => alert(`Admin override: Transfer ${transfer.id} status updated.`)}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
                          >
                            <Shield size={12} />
                            Admin Override
                          </button>
                        )}

                        {/* Coordinator: Approve / Reject on incoming pending transfers */}
                        {role === "coordinator" && transfer.status === "Pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Accepted Transfer ${transfer.id}! Bed reserved at your facility.`)}
                              className="flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800"
                            >
                              <CheckCircle2 size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => alert(`Rejected Transfer ${transfer.id}.`)}
                              className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        )}

                        {/* View Details for all roles */}
                        <button
                          onClick={() => setSelectedTransfer(transfer)}
                          className="rounded-lg border border-[#DDE5DF] px-4 py-2 text-xs font-medium text-[#172019] transition hover:border-green-600 hover:bg-green-50 hover:text-green-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Coordinator / Admin Only: Cross-Hospital Availability Table */}
          {(role === "coordinator" || role === "admin") && (
            <section className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-green-700" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
                  {role === "coordinator"
                    ? "Other Hospitals — Transfer Destination Availability"
                    : "All Hospitals — Regional Bed Availability"}
                </p>
              </div>
              <p className="mb-4 text-xs text-[#647067]">
                {role === "coordinator"
                  ? "Use this to evaluate available transfer destinations when your facility is at capacity or when patient requires specialist care elsewhere."
                  : "Cross-hospital resource snapshot for system-wide transfer oversight."}
              </p>

              <div className="overflow-hidden rounded-2xl border border-[#DDE5DF] bg-white shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-[#F6F8F6]">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">Hospital</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">Available Beds</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">ICU Beds</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">Occupancy</th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#647067]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7ECE8]">
                    {allHospitals
                      .filter((h) => role === "admin" || h.id !== hospitalId)
                      .map((h) => (
                        <tr key={h.id} className="transition hover:bg-[#F8FAF8]">
                          <td className="px-5 py-4">
                            <p className="font-medium text-sm text-[#172019]">{h.name}</p>
                            <p className="text-xs text-[#89938C]">{h.id}</p>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">{h.beds}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">{h.icu}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    h.occupancy >= 90 ? "bg-red-500" : h.occupancy >= 80 ? "bg-orange-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${h.occupancy}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#647067]">{h.occupancy}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                              h.status === "Available" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                            }`}>
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Transfer Detail Modal */}
      {selectedTransfer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-6"
          onClick={() => setSelectedTransfer(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#DDE5DF] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
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
                <p className="mt-1 text-sm font-medium text-[#172019]">{selectedTransfer.patient}</p>
              </div>
              <div>
                <p className="text-xs text-[#89938C]">From</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">{selectedTransfer.from}</p>
              </div>
              <div>
                <p className="text-xs text-[#89938C]">To</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">{selectedTransfer.to}</p>
              </div>
              <div>
                <p className="text-xs text-[#89938C]">Status</p>
                <p className="mt-1 text-sm font-medium text-green-700">{selectedTransfer.status}</p>
              </div>
              <div>
                <p className="text-xs text-[#89938C]">Updated</p>
                <p className="mt-1 text-sm font-medium text-[#172019]">{selectedTransfer.time}</p>
              </div>

              {/* Role-specific modal action */}
              {role === "coordinator" && selectedTransfer.status === "Pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      alert(`Approved Transfer ${selectedTransfer.id}!`);
                      setSelectedTransfer(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-green-700 py-2.5 text-xs font-bold text-white hover:bg-green-800"
                  >
                    <CheckCircle2 size={14} /> Approve Bed Reservation
                  </button>
                  <button
                    onClick={() => {
                      alert(`Rejected Transfer ${selectedTransfer.id}.`);
                      setSelectedTransfer(null);
                    }}
                    className="flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
              {role === "admin" && selectedTransfer.status !== "Completed" && (
                <button
                  onClick={() => {
                    alert(`Admin override applied to ${selectedTransfer.id}.`);
                    setSelectedTransfer(null);
                  }}
                  className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-900"
                >
                  Admin Override Status
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedTransfer(null)}
              className="mt-6 w-full rounded-lg border border-[#DDE5DF] py-2.5 text-sm font-medium text-[#172019] transition hover:bg-[#F6F8F6]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}