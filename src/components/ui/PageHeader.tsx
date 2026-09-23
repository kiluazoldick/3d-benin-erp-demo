// src/components/ui/PageHeader.tsx
import { ReactNode } from "react";
import { C } from "@/lib/theme";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1
          className="text-[26px] sm:text-[28px] font-bold"
          style={{ color: C.ink, letterSpacing: "-0.01em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[14px]" style={{ color: C.slate }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
