// src/components/layout/MobileMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  HardHat,
  Users,
  FileText,
  Receipt,
  UserCog,
  Clock,
  Package,
  Truck,
  Wallet,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { C } from "@/lib/theme";

const ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/chantiers", label: "Chantiers", icon: HardHat },
  { href: "/rapports", label: "Rapports", icon: BarChart3 },
  { href: "/guide", label: "Guide d'utilisation", icon: BookOpen },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/devis", label: "Devis", icon: FileText },
  { href: "/factures", label: "Factures", icon: Receipt },
  { href: "/personnel", label: "Personnel", icon: UserCog },
  { href: "/pointage", label: "Pointage", icon: Clock },
  { href: "/materiaux", label: "Matériaux", icon: Package },
  { href: "/fournisseurs", label: "Fournisseurs", icon: Truck },
  { href: "/engagements", label: "Engagements", icon: Wallet },
];

export default function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden transition-opacity duration-200"
      style={{
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(4,18,43,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        className="absolute top-0 left-0 h-full w-72 transition-transform duration-300"
        style={{
          backgroundColor: C.night,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="h-20 flex items-center justify-between px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid place-items-center h-10 w-10 rounded-xl font-bold text-sm"
              style={{ backgroundColor: C.deep, color: C.white }}
            >
              3N
            </span>
            <div>
              <div
                className="font-semibold text-[15px]"
                style={{ color: C.white }}
              >
                BTP-ERP
              </div>
              <div
                className="text-[10px] uppercase mt-1"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.2em",
                }}
              >
                3N BENIN
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-lg"
            style={{ color: C.white }}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-0.5 overflow-y-auto h-[calc(100%-5rem)]">
          {ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium"
                style={{
                  backgroundColor: active ? C.deep : "transparent",
                  color: active ? C.white : "rgba(255,255,255,0.65)",
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
