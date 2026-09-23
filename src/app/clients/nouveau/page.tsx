// src/app/clients/nouveau/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import ClientForm from "@/components/clients/ClientForm";
import { C } from "@/lib/theme";

export default function NouveauClientPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 900 }}>
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux clients
          </Link>

          <PageHeader
            title="Nouveau client"
            subtitle="Enregistrez un nouveau client dans votre base"
          />

          <ClientForm />
        </main>
      </div>
    </div>
  );
}
