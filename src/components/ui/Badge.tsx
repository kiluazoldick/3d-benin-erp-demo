// src/components/ui/Badge.tsx
import { ReactNode } from "react";

export default function Badge({
  children,
  bg,
  color,
}: {
  children: ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}
