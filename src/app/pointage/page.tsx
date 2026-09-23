// src/app/pointage/page.tsx
"use client";

import { useMemo } from "react";
import { Clock, Wallet, Users, TrendingUp } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import PointageForm from "@/components/pointage/PointageForm";
import PointageHistorique from "@/components/pointage/PointageHistorique";
import { useData } from "@/context/DataContext";
import { formatFCFA } from "@/lib/format";
import { C } from "@/lib/theme";

export default function PointagePage() {
  const { ready, pointages, employes } = useData();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    // Heures du jour
    const pointagesJour = pointages.filter((p) => p.date === today);
    const heuresJour = pointagesJour.reduce((s, p) => s + p.heures, 0);
    const coutJour = pointagesJour.reduce((s, p) => {
      const emp = employes.find((e) => e.id === p.employeId);
      return s + (emp ? (emp.tauxJournalier / 8) * p.heures : 0);
    }, 0);

    // Heures cette semaine
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const debut = startOfWeek.toISOString().split("T")[0];
    const pointagesSemaine = pointages.filter((p) => p.date >= debut);
    const heuresSemaine = pointagesSemaine.reduce((s, p) => s + p.heures, 0);

    // Employés ayant pointé aujourd'hui
    const employesJour = new Set(pointagesJour.map((p) => p.employeId)).size;

    return { heuresJour, coutJour, heuresSemaine, employesJour };
  }, [pointages, employes]);

  if (!ready) {
    return (
      <div
        className="min-h-screen grid place-items-center"
        style={{ backgroundColor: C.smoke }}
      >
        <div className="text-sm" style={{ color: C.slate }}>
          Chargement…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1400 }}>
          <PageHeader
            title="Pointage"
            subtitle="Saisie quotidienne des heures travaillées par chantier"
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Heures aujourd'hui"
              value={`${stats.heuresJour} h`}
              icon={<Clock size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
            />
            <StatCard
              label="Coût MO aujourd'hui"
              value={formatFCFA(stats.coutJour)}
              icon={<Wallet size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
            />
            <StatCard
              label="Heures cette semaine"
              value={`${stats.heuresSemaine} h`}
              icon={<TrendingUp size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
            />
            <StatCard
              label="Employés ayant pointé"
              value={String(stats.employesJour)}
              icon={<Users size={20} />}
              iconBg="#F1F5F9"
              iconColor={C.deep}
              hint="aujourd'hui"
            />
          </div>

          {/* Saisie */}
          <div className="mt-6">
            <PointageForm />
          </div>

          {/* Historique */}
          <div className="mt-6">
            <PointageHistorique />
          </div>
        </main>
      </div>
    </div>
  );
}
