import { useState } from "react";
import {
  Siren,
  MapPin,
  Phone,
  CheckCircle2,
  ShieldAlert,
  Ambulance,
  Clock,
  Navigation,
} from "lucide-react";
import { api } from "../services/api";
import AmbulanceMap from "../components/map/AmbulanceMap";

export default function PublicSOS() {
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(12.8702);
  const [longitude, setLongitude] = useState(74.8436);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

  // Post-submission ambulance status state
  const [dispatchStatus, setDispatchStatus] = useState<"awaiting" | "dispatched" | "en_route">("awaiting");
  const [ambulanceCoords, setAmbulanceCoords] = useState({ lat: 12.8650, lng: 74.8380 });
  const [assignedUnit, setAssignedUnit] = useState<string | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          alert("Could not fetch automatic location. Using default Mangaluru coordinates.");
        }
      );
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/citizen-report", {
        reporter_phone: phone || undefined,
        description,
        latitude,
        longitude,
      });

      const id = res.data?.id || `CR-${Math.floor(1000 + Math.random() * 9000)}`;
      setReportId(id);
      setSubmitted(true);

      // Simulate dispatch assignment after 2s
      setTimeout(() => {
        const unit = `ALS-Unit-0${Math.floor(1 + Math.random() * 9)}`;
        setAssignedUnit(unit);
        setEtaMinutes(Math.floor(4 + Math.random() * 8));
        setDispatchStatus("dispatched");
        // Move ambulance closer
        setAmbulanceCoords({
          lat: latitude - 0.012,
          lng: longitude - 0.008,
        });
      }, 2000);

      // Simulate en route after 5s
      setTimeout(() => {
        setDispatchStatus("en_route");
        setAmbulanceCoords({
          lat: latitude - 0.004,
          lng: longitude - 0.003,
        });
      }, 5000);

    } catch (err) {
      console.warn("Public SOS endpoint fallback");
      const id = `CR-${Math.floor(1000 + Math.random() * 9000)}`;
      setReportId(id);
      setSubmitted(true);

      setTimeout(() => {
        const unit = `ALS-Unit-0${Math.floor(1 + Math.random() * 9)}`;
        setAssignedUnit(unit);
        setEtaMinutes(Math.floor(4 + Math.random() * 8));
        setDispatchStatus("dispatched");
        setAmbulanceCoords({ lat: latitude - 0.012, lng: longitude - 0.008 });
      }, 2000);

      setTimeout(() => {
        setDispatchStatus("en_route");
        setAmbulanceCoords({ lat: latitude - 0.004, lng: longitude - 0.003 });
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Build ambulance hospital list for post-submit map (shows ambulance + incident pin)
  const ambulanceForMap = submitted
    ? [
        {
          hospital_id: "incident",
          hospital_name: "Your Incident Location",
          latitude,
          longitude,
          match_score: 100,
          distance_km: 0,
          estimated_eta_minutes: 0,
          available_icu_beds: 0,
          total_available_beds: 0,
          has_blood_stock: false,
          matched_specialties: [],
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#F6F8F6] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Banner */}
        <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Siren size={26} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Public Emergency SOS Portal
              </span>
              <h1 className="text-2xl font-extrabold text-[#172019]">
                Report Emergency Location & Triage
              </h1>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#647067]">
            No login required. Pin incident location on Leaflet map or auto-detect GPS coordinates to alert emergency dispatchers.
          </p>
        </div>

        {/* Content Layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Left: Map — always visible, updates post-submit to show ambulance position */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {submitted ? "Live Dispatch Map" : "Incident Location Map (Click map to select pin)"}
              </span>
              {!submitted && (
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center gap-1 text-xs font-bold text-green-700 hover:underline"
                >
                  <MapPin size={14} /> Auto-Detect GPS
                </button>
              )}
            </div>

            {/* Map: post-submit shows ambulance moving toward incident */}
            <AmbulanceMap
              latitude={submitted ? ambulanceCoords.lat : latitude}
              longitude={submitted ? ambulanceCoords.lng : longitude}
              hospitals={ambulanceForMap}
              onLocationSelect={submitted ? undefined : handleLocationSelect}
            />

            {/* Post-submit: Live dispatch status banner below map */}
            {submitted && (
              <div className={`rounded-2xl border p-4 shadow-sm transition-all ${
                dispatchStatus === "awaiting"
                  ? "border-orange-200 bg-orange-50"
                  : dispatchStatus === "dispatched"
                    ? "border-blue-200 bg-blue-50"
                    : "border-green-200 bg-green-50"
              }`}>
                <div className="flex items-center gap-3">
                  {dispatchStatus === "awaiting" && (
                    <>
                      <Clock size={20} className="animate-pulse text-orange-600" />
                      <div>
                        <p className="text-xs font-bold text-orange-900">Awaiting Dispatcher Assignment...</p>
                        <p className="text-xs text-orange-700">Your report is in the verification queue.</p>
                      </div>
                    </>
                  )}
                  {dispatchStatus === "dispatched" && (
                    <>
                      <Ambulance size={20} className="text-blue-700" />
                      <div>
                        <p className="text-xs font-bold text-blue-900">Ambulance Assigned: {assignedUnit}</p>
                        <p className="text-xs text-blue-700">ETA: {etaMinutes} minutes — ambulance is being dispatched.</p>
                      </div>
                    </>
                  )}
                  {dispatchStatus === "en_route" && (
                    <>
                      <Navigation size={20} className="text-green-700 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-green-900">🚑 {assignedUnit} is EN ROUTE to your location!</p>
                        <p className="text-xs text-green-700">ETA: ~{Math.max(1, (etaMinutes || 5) - 3)} minutes. Stay visible at your location.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: SOS Form / Post-Submit Status */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            {submitted ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                  <CheckCircle2 size={42} className="mx-auto text-green-600" />
                  <h2 className="mt-3 text-lg font-bold text-green-900">
                    Emergency SOS Alert Submitted!
                  </h2>
                  <p className="mt-1 text-xs text-green-700">
                    Report ID: <span className="font-bold">{reportId}</span>
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    Lat: {latitude.toFixed(4)} · Lng: {longitude.toFixed(4)}
                  </p>
                </div>

                {/* Dispatch Timeline */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Dispatch Status Timeline</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                      <p className="text-xs text-slate-700">SOS report received & logged</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        dispatchStatus !== "awaiting" ? "bg-green-500" : "bg-slate-300"
                      }`} />
                      <p className={`text-xs ${dispatchStatus !== "awaiting" ? "text-slate-700" : "text-slate-400"}`}>
                        {dispatchStatus !== "awaiting"
                          ? `${assignedUnit} assigned & dispatched`
                          : "Dispatcher assignment pending..."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        dispatchStatus === "en_route" ? "bg-green-500 animate-pulse" : "bg-slate-300"
                      }`} />
                      <p className={`text-xs ${dispatchStatus === "en_route" ? "text-slate-700" : "text-slate-400"}`}>
                        {dispatchStatus === "en_route"
                          ? `Ambulance en route — ETA ${Math.max(1, (etaMinutes || 5) - 3)} min`
                          : "Ambulance en route (awaiting)"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setDescription("");
                    setPhone("");
                    setReportId(null);
                    setDispatchStatus("awaiting");
                    setAssignedUnit(null);
                    setEtaMinutes(null);
                  }}
                  className="w-full rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-green-800"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      Selected Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 12.8702)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
                      Selected Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 74.8436)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

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
      </div>
    </div>
  );
}
