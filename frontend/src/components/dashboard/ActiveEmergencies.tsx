const emergencies = [
  {
    id: "#1042",
    status: "Critical",
    description: "Ambulance en route",
    color: "border-red-500 bg-red-50",
  },
  {
    id: "#1041",
    status: "High",
    description: "Hospital matching",
    color: "border-orange-500 bg-orange-50",
  },
  {
    id: "#1039",
    status: "Moderate",
    description: "Awaiting transfer",
    color: "border-yellow-500 bg-yellow-50",
  },
];

export default function ActiveEmergencies() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Active Emergencies
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Emergencies requiring coordination.
      </p>

      <div className="mt-6 space-y-3">
        {emergencies.map((emergency) => (
          <div
            key={emergency.id}
            className={`rounded-lg border-l-4 p-4 ${emergency.color}`}
          >
            <p className="text-sm font-semibold text-slate-900">
              Emergency {emergency.id}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {emergency.status} • {emergency.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}