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
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const userDashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "coordinator"
        ? "/coordinator"
        : user?.role === "dispatcher"
          ? "/dispatcher"
          : "/";

  const navigation = [
    { name: "Dashboard", path: userDashboardPath, icon: LayoutDashboard },
    { name: "Hospitals", path: "/hospitals", icon: Building2 },
    { name: "Emergency", path: "/emergency", icon: Siren },
    { name: "Transfers", path: "/transfers", icon: ArrowRightLeft },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
  ];

  function handleLogoClick() {
    if (location.pathname !== userDashboardPath) {
      navigate(userDashboardPath);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = () => {
    if (!user) return "Guest";
    if (user.role === "admin") return "Admin";
    if (user.role === "coordinator") return `Coordinator (${user.hospital_id || "Facility"})`;
    if (user.role === "dispatcher") return "Dispatcher";
    return user.role;
  };

  return (
    <header className="sticky top-4 z-50 px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/70 bg-white/65 px-5 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">

        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer"
          aria-label="Go to role dashboard"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-white shadow-sm">
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
              item.name === "Dashboard"
                ? ["/admin", "/coordinator", "/dispatcher", "/dashboard", "/"].includes(location.pathname)
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium"
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
                      ? "text-white font-semibold"
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

        {/* User Role Badge + Sign Out */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-2 rounded-full border border-green-200/80 bg-green-50/80 px-3.5 py-1.5 text-xs font-semibold text-green-900 sm:flex">
              <User size={13} className="text-green-700" />
              <span>{getRoleLabel()}</span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#647067] transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={17} />
          </button>
        </div>

      </nav>
    </header>
  );
}