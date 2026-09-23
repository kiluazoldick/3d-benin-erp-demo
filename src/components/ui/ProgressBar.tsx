// src/components/ui/ProgressBar.tsx
import { C } from "@/lib/theme";

export default function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  const color = v >= 80 ? C.success : v >= 40 ? C.deep : C.warning;

  return (
    <div
      className={`h-2 w-full rounded-full overflow-hidden ${className}`}
      style={{ backgroundColor: C.slateBg }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${v}%`, backgroundColor: color }}
      />
    </div>
  );
}
