// src/app/fournisseurs/nouveau/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import FournisseurForm from "@/components/fournisseurs/FournisseurForm";
import { C } from "@/lib/theme";

export default function NouveauFournisseurPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 900 }}>
          <Link
            href="/fournisseurs"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux fournisseurs
          </Link>

          <PageHeader
            title="Nouveau fournisseur"
            subtitle="Ajoutez un partenaire à votre base"
          />

          <FournisseurForm />
        </main>
      </div>
    </div>
  );
}
