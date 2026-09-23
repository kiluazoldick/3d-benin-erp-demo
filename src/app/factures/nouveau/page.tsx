// src/app/factures/nouveau/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import FactureForm from "@/components/factures/FactureForm";
import { C } from "@/lib/theme";

export default function NouvelleFacturePage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1100 }}>
          <Link
            href="/factures"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux factures
          </Link>

          <PageHeader
            title="Nouvelle facture"
            subtitle="Émettez une facture à destination de votre client"
          />

          <FactureForm />
        </main>
      </div>
    </div>
  );
}
