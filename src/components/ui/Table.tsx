// src/components/ui/Table.tsx
import { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13.5px]">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-smoke border-b border-slate-200">
      <tr>{children}</tr>
    </thead>
  );
}

export function TH({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-left font-semibold text-slate-600 px-6 py-3.5 text-[12px] uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TR({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`${
        onClick ? "cursor-pointer hover:bg-smoke/60" : ""
      } transition-colors ${className}`}
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-6 py-4 text-ink align-middle ${className}`}>
      {children}
    </td>
  );
}
