// src/app/engagements/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  Check,
  ArrowRight,
  Scale,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import ReglementModal from "@/components/engagements/ReglementModal";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate, joursRestants } from "@/lib/format";
import { C } from "@/lib/theme";
import type { Engagement } from "@/lib/types";

type TypeFiltre = "tous" | "client" | "fournisseur" | "retard";

const FILTRES: { value: TypeFiltre; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "client", label: "Créances clients" },
  { value: "fournisseur", label: "Dettes fournisseurs" },
  { value: "retard", label: "En retard" },
];

export default function EngagementsPage() {
  const { ready, engagements, clients, fournisseurs } = useData();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<TypeFiltre>("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Engagement | null>(null);

  const tiersNom = (e: Engagement) => {
    if (e.type === "client")
      return clients.find((c) => c.id === e.tiersId)?.nom ?? "Client";
    return fournisseurs.find((f) => f.id === e.tiersId)?.nom ?? "Fournisseur";
  };

  // ---------- KPIs ----------
  const stats = useMemo(() => {
    const creances = engagements
      .filter((e) => e.type === "client" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    const dettes = engagements
      .filter((e) => e.type === "fournisseur" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    const balance = creances - dettes;

    const creancesRetard = engagements.filter(
      (e) =>
        e.type === "client" &&
        e.statut !== "regle" &&
        joursRestants(e.dateEcheance) < 0,
    );
    const creancesRetardMontant = creancesRetard.reduce(
      (s, e) => s + (e.montant - e.montantRegle),
      0,
    );

    const dettesRetard = engagements.filter(
      (e) =>
        e.type === "fournisseur" &&
        e.statut !== "regle" &&
        joursRestants(e.dateEcheance) < 0,
    ).length;

    return {
      creances,
      dettes,
      balance,
      creancesRetard: creancesRetard.length,
      creancesRetardMontant,
      dettesRetard,
    };
  }, [engagements]);

  // ---------- Filtrage ----------
  const filtered = useMemo(() => {
    let list = engagements;

    if (filtre === "client") list = list.filter((e) => e.type === "client");
    if (filtre === "fournisseur")
      list = list.filter((e) => e.type === "fournisseur");
    if (filtre === "retard")
      list = list.filter(
        (e) => e.statut !== "regle" && joursRestants(e.dateEcheance) < 0,
      );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => {
        const nom = tiersNom(e).toLowerCase();
        const desc = e.description.toLowerCase();
        return nom.includes(q) || desc.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      // Les retards en premier, puis par échéance croissante
      const aRetard = a.statut !== "regle" && joursRestants(a.dateEcheance) < 0;
      const bRetard = b.statut !== "regle" && joursRestants(b.dateEcheance) < 0;
      if (aRetard && !bRetard) return -1;
      if (!aRetard && bRetard) return 1;
      return (
        new Date(a.dateEcheance).getTime() - new Date(b.dateEcheance).getTime()
      );
    });
  }, [engagements, filtre, search, clients, fournisseurs]);

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
            title="Engagements"
            subtitle="Suivi des créances clients et dettes fournisseurs"
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Créances clients"
              value={formatFCFA(stats.creances)}
              icon={<TrendingUp size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
              hint="à encaisser"
            />
            <StatCard
              label="Dettes fournisseurs"
              value={formatFCFA(stats.dettes)}
              icon={<TrendingDown size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
              hint="à payer"
            />
            <StatCard
              label="Balance nette"
              value={formatFCFA(stats.balance)}
              icon={<Scale size={20} />}
              iconBg={stats.balance >= 0 ? "#DBEAFE" : "#FEE2E2"}
              iconColor={stats.balance >= 0 ? C.deep : C.danger}
              hint={
                stats.balance >= 0 ? "position positive" : "position négative"
              }
            />
            <StatCard
              label="Créances en retard"
              value={String(stats.creancesRetard)}
              icon={<AlertTriangle size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
              hint={formatFCFA(stats.creancesRetardMontant)}
            />
          </div>

          {/* Bandeau d'alerte global */}
          {(stats.creancesRetard > 0 || stats.dettesRetard > 0) && (
            <div
              className="mt-6 rounded-2xl p-5 flex items-start gap-4"
              style={{
                backgroundColor: "#FEF3C7",
                border: "1px solid #FCD34D",
              }}
            >
              <span
                className="grid place-items-center h-10 w-10 rounded-xl shrink-0"
                style={{ backgroundColor: C.warning, color: C.white }}
              >
                <AlertTriangle size={18} />
              </span>
              <div>
                <div
                  className="font-semibold text-[14px]"
                  style={{ color: "#78350F" }}
                >
                  Attention requise
                </div>
                <p className="text-[13px] mt-0.5" style={{ color: "#78350F" }}>
                  {stats.creancesRetard > 0 && (
                    <>
                      <strong>{stats.creancesRetard}</strong> créance(s) client
                      en retard pour un total de{" "}
                      <strong>{formatFCFA(stats.creancesRetardMontant)}</strong>
                      .
                    </>
                  )}
                  {stats.creancesRetard > 0 && stats.dettesRetard > 0 && " "}
                  {stats.dettesRetard > 0 && (
                    <>
                      <strong>{stats.dettesRetard}</strong> dette(s) fournisseur
                      à régler en urgence.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div
            className="mt-6 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4"
            style={{
              backgroundColor: C.white,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              className="flex-1 flex items-center gap-2 h-10 px-4 rounded-xl"
              style={{
                backgroundColor: C.smoke,
                border: `1px solid ${C.border}`,
              }}
            >
              <Search size={16} style={{ color: C.light }} />
              <input
                type="text"
                placeholder="Rechercher par tiers ou description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13.5px]"
                style={{ color: C.ink }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTRES.map((f) => {
                const active = filtre === f.value;
                const count =
                  f.value === "tous"
                    ? engagements.length
                    : f.value === "retard"
                      ? engagements.filter(
                          (e) =>
                            e.statut !== "regle" &&
                            joursRestants(e.dateEcheance) < 0,
                        ).length
                      : engagements.filter((e) => e.type === f.value).length;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFiltre(f.value)}
                    className="h-9 px-4 rounded-xl text-[13px] font-semibold transition-colors inline-flex items-center gap-2"
                    style={{
                      backgroundColor: active ? C.deep : C.smoke,
                      color: active ? C.white : C.ink,
                      border: `1px solid ${active ? C.deep : C.border}`,
                    }}
                  >
                    {f.label}
                    <span
                      className="text-[11px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: active
                          ? "rgba(255,255,255,0.15)"
                          : C.border,
                        color: active ? C.white : C.slate,
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Liste */}
          <div className="mt-6">
            {filtered.length === 0 ? (
              <div
                className="rounded-2xl"
                style={{
                  backgroundColor: C.white,
                  border: `1px solid ${C.border}`,
                }}
              >
                <EmptyState
                  icon={<Wallet size={26} />}
                  title="Aucun engagement trouvé"
                  description="Ajustez vos filtres ou votre recherche."
                />
              </div>
            ) : (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: C.white,
                  border: `1px solid ${C.border}`,
                }}
              >
                {/* En-tête */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 text-[11.5px] font-semibold uppercase"
                  style={{
                    backgroundColor: C.smoke,
                    color: C.slate,
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div className="col-span-1">Type</div>
                  <div className="col-span-3">Tiers</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Échéance</div>
                  <div className="col-span-2">Progression</div>
                  <div className="col-span-1 text-right">Action</div>
                </div>

                {filtered.map((e, idx) => {
                  const tiers = tiersNom(e);
                  const reste = e.montant - e.montantRegle;
                  const pct = Math.round(
                    (e.montantRegle / Math.max(1, e.montant)) * 100,
                  );
                  const jours = joursRestants(e.dateEcheance);
                  const enRetard = e.statut !== "regle" && jours < 0;
                  const isClient = e.type === "client";
                  const isHover = hoverId === e.id;
                  const regle = e.statut === "regle";

                  const bgColor = regle
                    ? "#F0FDF4"
                    : enRetard
                      ? "#FEF2F2"
                      : isHover
                        ? C.smoke
                        : "transparent";

                  return (
                    <div
                      key={e.id}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 transition-colors"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: bgColor,
                        opacity: regle ? 0.7 : 1,
                      }}
                      onMouseEnter={() => setHoverId(e.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      {/* Type */}
                      <div className="lg:col-span-1">
                        {isClient ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold uppercase"
                            style={{
                              backgroundColor: "#DCFCE7",
                              color: "#166534",
                            }}
                          >
                            <TrendingUp size={10} /> Dû
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold uppercase"
                            style={{
                              backgroundColor: "#FEE2E2",
                              color: "#991B1B",
                            }}
                          >
                            <TrendingDown size={10} /> À payer
                          </span>
                        )}
                      </div>

                      {/* Tiers */}
                      <div className="lg:col-span-3 min-w-0">
                        <div
                          className="font-semibold text-[13.5px] truncate"
                          style={{ color: C.ink }}
                        >
                          {tiers}
                        </div>
                        {!regle && reste > 0 && (
                          <div
                            className="mt-0.5 text-[12px]"
                            style={{ color: C.slate }}
                          >
                            Reste :{" "}
                            <strong
                              style={{
                                color: enRetard ? C.danger : C.ink,
                              }}
                            >
                              {formatFCFA(reste)}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div
                        className="lg:col-span-3 text-[12.5px] truncate"
                        style={{ color: C.slate }}
                        title={e.description}
                      >
                        {e.description.split("\n")[0]}
                      </div>

                      {/* Échéance */}
                      <div className="lg:col-span-2">
                        {regle ? (
                          <span
                            className="inline-flex items-center gap-1 text-[12.5px] font-semibold"
                            style={{ color: C.success }}
                          >
                            <Check size={12} /> Réglé
                          </span>
                        ) : (
                          <>
                            <div
                              className="text-[12.5px] font-semibold"
                              style={{ color: C.ink }}
                            >
                              {formatDate(e.dateEcheance)}
                            </div>
                            <div
                              className="text-[11.5px]"
                              style={{
                                color: enRetard ? C.danger : C.slate,
                              }}
                            >
                              {enRetard
                                ? `Retard de ${Math.abs(jours)} j`
                                : jours === 0
                                  ? "Aujourd'hui"
                                  : `Dans ${jours} j`}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Progression */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between text-[11.5px] mb-1">
                          <span style={{ color: C.slate }}>
                            {formatFCFA(e.montantRegle)}
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: C.ink }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <ProgressBar value={pct} />
                        <div
                          className="mt-1 text-[11px]"
                          style={{ color: C.slate }}
                        >
                          sur {formatFCFA(e.montant)}
                        </div>
                      </div>

                      {/* Action */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        {!regle && (
                          <button
                            onClick={() => setSelected(e)}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors"
                            style={{
                              backgroundColor: isClient ? C.deep : C.danger,
                              color: C.white,
                            }}
                            title={isClient ? "Encaisser" : "Payer"}
                          >
                            {isClient ? "Encaisser" : "Payer"}
                          </button>
                        )}
                        {regle && (
                          <span
                            className="text-[11.5px] font-semibold"
                            style={{ color: C.success }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal */}
          {selected && (
            <ReglementModal
              open={!!selected}
              onClose={() => setSelected(null)}
              engagement={selected}
              tiersNom={tiersNom(selected)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
