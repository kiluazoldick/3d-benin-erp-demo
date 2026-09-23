// src/components/ui/Card.tsx
import { ReactNode } from "react";
import { C, SHADOW } from "@/lib/theme";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: SHADOW.soft,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 px-6 py-5"
      style={{ borderBottom: `1px solid ${C.slateBg}` }}
    >
      <div>
        <h3 className="font-semibold text-[15px]" style={{ color: C.ink }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-[13px] mt-0.5" style={{ color: C.slate }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`p-6 ${className}`} style={style}>
      {children}
    </div>
  );
}

export default Card;
