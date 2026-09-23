// src/components/layout/Topbar.tsx
"use client";

import { useState } from "react";
import { Bell, Search, Menu, RotateCcw } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { useData } from "@/context/DataContext";
import { C } from "@/lib/theme";

export default function Topbar() {
  const [openMobile, setOpenMobile] = useState(false);
  const { resetDemo } = useData();

  const handleReset = () => {
    if (
      window.confirm(
        "Réinitialiser les données de démonstration ? Toutes les modifications seront perdues.",
      )
    ) {
      resetDemo();
      window.location.reload();
    }
  };

  return (
    <>
      <header
        className="h-20 flex items-center px-4 sm:px-6 lg:px-8 gap-4 sticky top-0 z-40"
        style={{
          backgroundColor: C.white,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={() => setOpenMobile(true)}
          className="lg:hidden grid place-items-center h-10 w-10 rounded-lg transition-colors"
          style={{ color: C.ink }}
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        <div
          className="hidden sm:flex flex-1 max-w-md items-center gap-2 h-10 px-4 rounded-xl"
          style={{
            backgroundColor: C.smoke,
            border: `1px solid ${C.border}`,
          }}
        >
          <Search size={16} style={{ color: C.light }} />
          <input
            type="text"
            placeholder="Rechercher un chantier, un client…"
            className="flex-1 bg-transparent outline-none text-[13.5px]"
            style={{ color: C.ink }}
          />
        </div>

        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-medium transition-colors"
            style={{ color: C.slate }}
            title="Réinitialiser la démo"
          >
            <RotateCcw size={14} />
            Réinitialiser
          </button>

          <button
            className="relative grid place-items-center h-10 w-10 rounded-xl transition-colors"
            style={{ color: C.ink }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span
              className="absolute top-2 right-2 h-2 w-2 rounded-full"
              style={{
                backgroundColor: C.danger,
                boxShadow: `0 0 0 2px ${C.white}`,
              }}
            />
          </button>

          <div
            className="hidden sm:flex items-center gap-3 pl-3 ml-2"
            style={{ borderLeft: `1px solid ${C.border}` }}
          >
            <div
              className="grid place-items-center h-9 w-9 rounded-full text-[11px] font-bold"
              style={{ backgroundColor: C.deep, color: C.white }}
            >
              NP
            </div>
            <div className="hidden md:block">
              <div
                className="text-[13px] font-semibold"
                style={{ color: C.ink }}
              >
                Nicolas P.
              </div>
              <div className="text-[11px]" style={{ color: C.slate }}>
                DG
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={openMobile} onClose={() => setOpenMobile(false)} />
    </>
  );
}
