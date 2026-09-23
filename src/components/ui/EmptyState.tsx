// src/components/ui/EmptyState.tsx
import { ReactNode } from "react";
import { C } from "@/lib/theme";

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div
        className="grid place-items-center h-16 w-16 rounded-2xl mb-5"
        style={{ backgroundColor: C.smoke, color: C.light }}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[15px]" style={{ color: C.ink }}>
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-[13.5px] max-w-sm" style={{ color: C.slate }}>
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
