// src/components/ui/StatCard.tsx
import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { C, SHADOW } from "@/lib/theme";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: { value: string; positive: boolean };
  hint?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconBg = C.smoke,
  iconColor = C.deep,
  trend,
  hint,
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 transition-shadow duration-300"
      style={{
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: SHADOW.soft,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="text-[12.5px] font-medium uppercase"
            style={{ color: C.slate, letterSpacing: "0.02em" }}
          >
            {label}
          </div>
          <div
            className="mt-2 text-[26px] font-bold leading-tight truncate"
            style={{ color: C.ink }}
          >
            {value}
          </div>
          {(trend || hint) && (
            <div className="mt-2 flex items-center gap-2 text-[12.5px]">
              {trend && (
                <span
                  className="inline-flex items-center gap-1 font-semibold"
                  style={{ color: trend.positive ? C.success : C.danger }}
                >
                  {trend.positive ? (
                    <TrendingUp size={13} />
                  ) : (
                    <TrendingDown size={13} />
                  )}
                  {trend.value}
                </span>
              )}
              {hint && <span style={{ color: C.slate }}>{hint}</span>}
            </div>
          )}
        </div>
        <div
          className="grid place-items-center h-12 w-12 shrink-0 rounded-xl"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
