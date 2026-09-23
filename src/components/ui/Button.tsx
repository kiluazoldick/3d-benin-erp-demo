// src/components/ui/Button.tsx
"use client";

import { ButtonHTMLAttributes, ReactNode, useState } from "react";
import { C, SHADOW } from "@/lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
}

const SIZES: Record<
  Size,
  { height: number; padding: string; fontSize: number; gap: number }
> = {
  sm: { height: 36, padding: "0 14px", fontSize: 12.5, gap: 6 },
  md: { height: 40, padding: "0 20px", fontSize: 13.5, gap: 8 },
  lg: { height: 48, padding: "0 24px", fontSize: 14.5, gap: 10 },
};

function getVariantStyle(
  variant: Variant,
  hovered: boolean,
): React.CSSProperties {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: hovered ? C.azure : C.deep,
        color: C.white,
        border: "none",
        boxShadow: "0 2px 8px -2px rgba(10,42,107,0.35)",
      };
    case "secondary":
      return {
        backgroundColor: hovered ? C.border : C.smoke,
        color: C.ink,
        border: "none",
      };
    case "ghost":
      return {
        backgroundColor: hovered ? C.smoke : "transparent",
        color: C.ink,
        border: "none",
      };
    case "danger":
      return {
        backgroundColor: hovered ? "#B91C1C" : C.danger,
        color: C.white,
        border: "none",
      };
    case "outline":
      return {
        backgroundColor: hovered ? C.deep : C.white,
        color: hovered ? C.white : C.ink,
        border: `1px solid ${hovered ? C.deep : C.border}`,
      };
  }
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  full = false,
  className = "",
  style,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const s = SIZES[size];
  const v = getVariantStyle(variant, hovered && !disabled);

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ${className}`}
      style={{
        height: s.height,
        padding: s.padding,
        fontSize: s.fontSize,
        gap: s.gap,
        width: full ? "100%" : undefined,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...v,
        ...style,
      }}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
