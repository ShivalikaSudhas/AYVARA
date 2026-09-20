const hospitals = [
  {
    name: "City General Hospital",
    beds: 32,
    status: "Available",
  },
  {
    name: "St. Mary's Medical Center",
    beds: 18,
    status: "Available",
  },
  {
    name: "Central Emergency Hospital",
    beds: 7,
    status: "Limited",
  },
  {
    name: "Green Valley Hospital",
    beds: 25,
    status: "Available",
  },
];

export default function HospitalStatus() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Hospital Resource Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current bed availability across connected hospitals.
          </p>
        </div>

        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          Live
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {hospitals.map((hospital) => (
          <div
            key={hospital.name}
            className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
          >
            <div>
              <p className="font-medium text-slate-900">
                {hospital.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {hospital.beds} beds available
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                hospital.status === "Available"
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {hospital.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
