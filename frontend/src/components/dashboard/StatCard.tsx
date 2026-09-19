import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}