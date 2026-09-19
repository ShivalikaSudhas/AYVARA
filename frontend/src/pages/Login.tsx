import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <div className="flex min-h-screen">
        {/* Left side */}
        <div className="hidden w-1/2 bg-green-800 p-12 lg:flex lg:flex-col">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AYVARA
            </h1>

            <p className="mt-2 text-sm text-green-100">
              Hospital Resource Coordination
            </p>
          </div>

          <div className="flex flex-1 items-center">
            <div className="max-w-md">
              <h2 className="text-4xl font-semibold leading-tight text-white">
                Coordinating resources when they matter most.
              </h2>

              <p className="mt-5 text-sm leading-6 text-green-100">
                Manage hospital resources, emergency requests, transfers, and
                operational capacity from one place.
              </p>
            </div>
          </div>
        </div>

        {/* Login */}
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <h1 className="text-2xl font-bold text-[#172019]">
                AYVARA
              </h1>

              <p className="mt-1 text-sm text-[#647067]">
                Hospital Resource Coordination
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#172019]">
                Sign in
              </h2>

              <p className="mt-2 text-sm text-[#647067]">
                Please sign in to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-[#172019]">
                  Email
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938C]"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="coordinator@hospital.com"
                    className="w-full rounded-md border border-[#DDE5DF] bg-white py-3 pl-10 pr-3 text-sm text-[#172019] outline-none transition placeholder:text-[#A0A9A3] focus:border-green-700 focus:ring-1 focus:ring-green-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#172019]">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938C]"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-md border border-[#DDE5DF] bg-white py-3 pl-10 pr-3 text-sm text-[#172019] outline-none transition placeholder:text-[#A0A9A3] focus:border-green-700 focus:ring-1 focus:ring-green-700"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-green-800 py-3 text-sm font-medium text-white transition hover:bg-green-900"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}