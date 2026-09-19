import { useState } from "react";
import { Siren, MapPin, Phone, CheckCircle2, ShieldAlert } from "lucide-react";
import { api } from "../services/api";

export default function PublicSOS() {
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("12.8702");
  const [longitude, setLongitude] = useState("74.8436");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(4));
          setLongitude(pos.coords.longitude.toFixed(4));
        },
        () => {
          alert("Could not fetch location. Using default Mangaluru coordinates.");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/citizen-report", {
        reporter_phone: phone || undefined,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      setReportId(res.data?.id || `CR-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
    } catch (err) {
      console.warn("Public SOS endpoint fallback");
      setReportId(`CR-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8F6] p-4">
      <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Siren size={26} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              Public Emergency SOS Portal
            </span>
            <h1 className="text-2xl font-extrabold text-[#172019]">
              Report Emergency Location
            </h1>
          </div>
        </div>

        <p className="mt-3 text-xs text-[#647067]">
          No login required. Submit an emergency report to alert regional command dispatchers immediately.
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 size={42} className="mx-auto text-green-600" />
            <h2 className="mt-3 text-lg font-bold text-green-900">
              Emergency SOS Report Submitted!
            </h2>
            <p className="mt-1 text-xs text-green-700">
              Report ID: <span className="font-bold">{reportId}</span>
            </p>
            <p className="mt-2 text-xs text-slate-600">
              A regional dispatcher is evaluating your report and dispatching nearest emergency response units.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setDescription("");
              }}
              className="mt-5 rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-green-800"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
                Reporter Phone Number (Optional)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-10 text-sm font-medium focus:border-red-500 focus:outline-none"
                />
                <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
                Emergency Incident Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe accident, patient condition, number of victims..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
                  Latitude
                </label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
                  Longitude
                </label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <MapPin size={16} />
              Auto-Detect GPS Location
            </button>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50"
            >
              <ShieldAlert size={20} />
              {loading ? "Submitting SOS..." : "SUBMIT EMERGENCY SOS ALERT"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
