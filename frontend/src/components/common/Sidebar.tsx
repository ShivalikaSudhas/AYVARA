import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Siren,
  ArrowRightLeft,
  BarChart3,
  Settings,
  LogOut,
  HeartPulse,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Resources",
    path: "/hospital-admin",
    icon: Building2,
  },
  {
    name: "Emergency",
    path: "/emergency",
    icon: Siren,
  },
  {
    name: "Transfers",
    path: "/transfers",
    icon: ArrowRightLeft,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-[#DDE5DF] bg-white">
      <div className="border-b border-[#DDE5DF] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white">
            <HeartPulse size={21} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#172019]">
              AYVARA
            </h1>

            <p className="text-xs text-[#647067]">
              Hospital Coordination
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-[#DDE5DF] px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[#89938C]">
          Coordinator
        </p>

        <p className="mt-1 text-sm font-semibold text-[#172019]">
          City General Hospital
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-green-50 text-green-800"
                    : "text-[#647067] hover:bg-green-50 hover:text-green-800"
                }`
              }
            >
              <Icon size={19} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#DDE5DF] p-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

          <span className="text-sm font-medium text-[#172019]">
            System Online
          </span>
        </div>

        <NavLink
          to="/login"
          className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#647067] transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Sign Out
        </NavLink>
      </div>
    </aside>
  );
}