import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Siren,
  ArrowRightLeft,
  BarChart3,
  LogOut,
  HeartPulse,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Resources", path: "/hospital-admin", icon: Building2 },
  { name: "Hospitals", path: "/hospitals", icon: Building2 },
  { name: "Emergency", path: "/emergency", icon: Siren },
  { name: "Transfers", path: "/transfers", icon: ArrowRightLeft },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogoClick() {
    if (location.pathname !== "/") {
      navigate("/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <header className="sticky top-4 z-50 px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/65 px-5 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">

        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3"
          aria-label="Go to dashboard"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-white">
            <HeartPulse size={18} />
          </div>

          <div className="hidden text-left sm:block">
            <h1 className="text-sm font-bold tracking-tight text-[#172019]">
              AYVARA
            </h1>

          </div>
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-full bg-green-800"
                    transition={{
                      layout: {
                        duration: 0.25,
                        ease: "easeInOut",
                      },
                    }}
                  />
                )}

                <span
                  className={`relative z-10 flex items-center gap-2 whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-[#647067] hover:text-[#172019]"
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Status + Sign Out */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-white/60 px-3 py-2 sm:flex">
          </div>

          <NavLink
            to="/login"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#647067] transition hover:bg-red-50 hover:text-red-600"
            title="Sign Out"
          >
            <LogOut size={17} />
          </NavLink>
        </div>

      </nav>
    </header>
  );
}
