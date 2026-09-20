import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, KeyRound, UserCheck, AlertCircle } from "lucide-react";
import { useAuth, UserRole } from "../context/AuthContext";
import { loginApi } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("coordinator_1");
  const [password, setPassword] = useState("coord123");
  const [role, setRole] = useState<UserRole>("coordinator");
  const [hospitalId, setHospitalId] = useState("hosp_001");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setUsername("admin");
      setPassword("admin123");
      setHospitalId("");
    } else if (selectedRole === "coordinator") {
      setUsername("coordinator_1");
      setPassword("coord123");
      setHospitalId("hosp_001");
    } else {
      setUsername("dispatcher_1");
      setPassword("dispatch123");
      setHospitalId("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await loginApi(username, password);
      const userRole: UserRole = res.role || role;
      const userHospId = res.hospital_id || hospitalId || undefined;

      login(res.access_token, {
        username: res.username || username,
        role: userRole,
        hospital_id: userHospId,
      });

      if (userRole === "admin") navigate("/admin");
      else if (userRole === "coordinator") navigate("/coordinator");
      else if (userRole === "dispatcher") navigate("/dispatcher");
      else navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8F6] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#DDE5DF] bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <Shield size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#172019]">
            Smart Hospital Coordination
          </h1>
          <p className="mt-1 text-sm text-[#647067]">
            Sign in to access your role-scoped portal
          </p>
        </div>

        {/* Quick select demo buttons */}
        <div className="mt-6 flex justify-center gap-2 rounded-xl bg-[#F6F8F6] p-1.5">
          <button
            type="button"
            onClick={() => handleQuickSelect("admin")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              role === "admin"
                ? "bg-white text-green-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect("coordinator")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              role === "coordinator"
                ? "bg-white text-green-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Coordinator
          </button>
          <button
            type="button"
            onClick={() => handleQuickSelect("dispatcher")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              role === "dispatcher"
                ? "bg-white text-green-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Dispatcher
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
              Username
            </label>
            <div className="relative mt-1.5">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-[#DDE5DF] bg-[#FAFCFA] px-4 py-3 pl-10 text-sm font-medium text-[#172019] focus:border-green-600 focus:outline-none"
                required
              />
              <UserCheck size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#DDE5DF] bg-[#FAFCFA] px-4 py-3 pl-10 text-sm font-medium text-[#172019] focus:border-green-600 focus:outline-none"
                required
              />
              <KeyRound size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          {role === "coordinator" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#647067]">
                Hospital ID Scope
              </label>
              <input
                type="text"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#DDE5DF] bg-[#FAFCFA] px-4 py-3 text-sm font-medium text-[#172019] focus:border-green-600 focus:outline-none"
                placeholder="hosp_001"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : `Sign In to ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-400">
            Public Citizen?{" "}
            <button
              onClick={() => navigate("/sos")}
              className="font-semibold text-green-700 underline hover:text-green-800"
            >
              Submit an Emergency SOS Report without Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}