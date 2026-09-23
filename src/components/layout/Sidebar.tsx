// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  group: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    group: "Pilotage",
  },
  { href: "/chantiers", label: "Chantiers", icon: HardHat, group: "Pilotage" },
  { href: "/rapports", label: "Rapports", icon: BarChart3, group: "Pilotage" },
  {
    href: "/guide",
    label: "Guide d'utilisation",
    icon: BookOpen,
    group: "Pilotage",
  },

  { href: "/clients", label: "Clients", icon: Users, group: "Commercial" },
  { href: "/devis", label: "Devis", icon: FileText, group: "Commercial" },
  { href: "/factures", label: "Factures", icon: Receipt, group: "Commercial" },

  { href: "/personnel", label: "Personnel", icon: UserCog, group: "Équipes" },
  { href: "/pointage", label: "Pointage", icon: Clock, group: "Équipes" },

  {
    href: "/materiaux",
    label: "Matériaux",
    icon: Package,
    group: "Logistique",
  },
  {
    href: "/fournisseurs",
    label: "Fournisseurs",
    icon: Truck,
    group: "Logistique",
  },
  {
    href: "/engagements",
    label: "Engagements",
    icon: Wallet,
    group: "Finance",
  },
];

const GROUP_ORDER = [
  "Pilotage",
  "Commercial",
  "Équipes",
  "Logistique",
  "Finance",
];

export default function Sidebar() {
  const pathname = usePathname();

  const groups = GROUP_ORDER.map((g) => ({
    name: g,
    items: NAV_ITEMS.filter((i) => i.group === g),
  }));

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0"
      style={{
        backgroundColor: C.night,
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand */}
      <div
        className="h-20 flex items-center gap-3 px-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span
          className="grid place-items-center h-10 w-10 rounded-xl font-bold text-sm"
          style={{ backgroundColor: C.deep, color: C.white }}
        >
          3N
        </span>
        <div>
          <div className="font-semibold text-[15px]" style={{ color: C.white }}>
            BTP-ERP
          </div>
          <div
            className="text-[10px] uppercase mt-1"
            style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.22em" }}
          >
            3N BENIN
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.name}>
            <div
              className="px-3 mb-2 text-[10px] uppercase font-semibold"
              style={{
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.2em",
              }}
            >
              {group.name}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors"
                      style={{
                        backgroundColor: active ? C.deep : "transparent",
                        color: active ? C.white : "rgba(255,255,255,0.65)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255,255,255,0.06)";
                          e.currentTarget.style.color = C.white;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color =
                            "rgba(255,255,255,0.65)";
                        }
                      }}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
          style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="grid place-items-center h-8 w-8 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: C.deep, color: C.white }}
          >
            NP
          </div>
          <div className="min-w-0">
            <div
              className="text-[13px] font-semibold truncate"
              style={{ color: C.white }}
            >
              Nicolas P.
            </div>
            <div
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Directeur Général
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
