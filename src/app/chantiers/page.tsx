// src/app/chantiers/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  HardHat,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { deleteItem } from "@/lib/storage";
import { formatFCFA, formatDate } from "@/lib/format";
import { STATUTS_CHANTIER } from "@/lib/constants";
import { C } from "@/lib/theme";
import type { StatutChantier } from "@/lib/types";

const FILTRES: { value: "tous" | StatutChantier; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "en_cours", label: "En cours" },
  { value: "planifie", label: "Planifiés" },
  { value: "suspendu", label: "Suspendus" },
  { value: "termine", label: "Terminés" },
];

export default function ChantiersPage() {
  const { ready, chantiers, clients, employes, refresh } = useData();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | StatutChantier>("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = chantiers.length;
    const actifs = chantiers.filter((c) => c.statut === "en_cours").length;
    const budgetTotal = chantiers.reduce((s, c) => s + c.budget, 0);
    const depenseTotal = chantiers.reduce((s, c) => s + c.depense, 0);
    const termines = chantiers.filter((c) => c.statut === "termine").length;
    return { total, actifs, budgetTotal, depenseTotal, termines };
  }, [chantiers]);

  const filtered = useMemo(() => {
    let list = chantiers;
    if (filtre !== "tous") list = list.filter((c) => c.statut === filtre);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) || c.lieu.toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [chantiers, filtre, search]);

  const handleDelete = (id: string, nom: string) => {
    if (!window.confirm(`Supprimer le chantier "${nom}" ?`)) return;
    deleteItem("chantiers", id);
    refresh();
  };

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
            title="Chantiers"
            subtitle={`${stats.total} chantier(s) enregistré(s)`}
            action={
              <Link href="/chantiers/nouveau">
                <Button icon={<Plus size={16} />}>Nouveau chantier</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Chantiers actifs"
              value={String(stats.actifs)}
              icon={<HardHat size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
              hint={`sur ${stats.total} au total`}
            />
            <StatCard
              label="Budget total"
              value={formatFCFA(stats.budgetTotal)}
              icon={<Wallet size={20} />}
              iconBg="#F1F5F9"
              iconColor={C.deep}
            />
            <StatCard
              label="Dépensé"
              value={formatFCFA(stats.depenseTotal)}
              icon={<TrendingUp size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
              hint={`${Math.round(
                (stats.depenseTotal / Math.max(1, stats.budgetTotal)) * 100,
              )}% du budget`}
            />
            <StatCard
              label="Terminés"
              value={String(stats.termines)}
              icon={<CheckCircle2 size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
            />
          </div>

          {/* Barre de filtres */}
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
                placeholder="Rechercher par nom ou lieu…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13.5px]"
                style={{ color: C.ink }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTRES.map((f) => {
                const active = filtre === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFiltre(f.value)}
                    className="h-9 px-4 rounded-xl text-[13px] font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? C.deep : C.smoke,
                      color: active ? C.white : C.ink,
                      border: `1px solid ${active ? C.deep : C.border}`,
                    }}
                  >
                    {f.label}
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
                  icon={<HardHat size={26} />}
                  title="Aucun chantier trouvé"
                  description="Ajoutez votre premier chantier ou modifiez vos filtres de recherche."
                  action={
                    <Link href="/chantiers/nouveau">
                      <Button icon={<Plus size={16} />}>
                        Créer un chantier
                      </Button>
                    </Link>
                  }
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
                {/* En-tête (desktop) */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 text-[11.5px] font-semibold uppercase"
                  style={{
                    backgroundColor: C.smoke,
                    color: C.slate,
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div className="col-span-4">Chantier</div>
                  <div className="col-span-3">Client</div>
                  <div className="col-span-2">Budget / Dépensé</div>
                  <div className="col-span-2">Avancement</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((c, idx) => {
                  const client = clients.find((x) => x.id === c.clientId);
                  const statut = STATUTS_CHANTIER[c.statut];
                  const isHover = hoverId === c.id;
                  const pctDepense = Math.round(
                    (c.depense / Math.max(1, c.budget)) * 100,
                  );

                  return (
                    <div
                      key={c.id}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 transition-colors"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: isHover ? C.smoke : "transparent",
                      }}
                      onMouseEnter={() => setHoverId(c.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      {/* Chantier */}
                      <div className="lg:col-span-4 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/chantiers/${c.id}`}
                            className="font-semibold text-[14.5px] hover:underline"
                            style={{ color: C.ink }}
                          >
                            {c.nom}
                          </Link>
                          <Badge bg={statut.bg} color={statut.color}>
                            {statut.label}
                          </Badge>
                        </div>
                        <div
                          className="mt-1 text-[12.5px] flex flex-wrap gap-x-3 gap-y-0.5"
                          style={{ color: C.slate }}
                        >
                          <span>📍 {c.lieu}</span>
                          <span>📅 {formatDate(c.dateDebut)}</span>
                        </div>
                      </div>

                      {/* Client */}
                      <div
                        className="lg:col-span-3 text-[13px] truncate"
                        style={{ color: C.ink }}
                      >
                        {client?.nom ?? "—"}
                      </div>

                      {/* Budget */}
                      <div className="lg:col-span-2">
                        <div
                          className="text-[13px] font-semibold"
                          style={{ color: C.ink }}
                        >
                          {formatFCFA(c.depense)}
                        </div>
                        <div
                          className="text-[11.5px]"
                          style={{ color: C.slate }}
                        >
                          sur {formatFCFA(c.budget)} ({pctDepense}%)
                        </div>
                      </div>

                      {/* Avancement */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-between text-[11.5px] mb-1">
                          <span style={{ color: C.slate }}>Avancement</span>
                          <span
                            className="font-semibold"
                            style={{ color: C.ink }}
                          >
                            {c.avancement}%
                          </span>
                        </div>
                        <ProgressBar value={c.avancement} />
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/chantiers/${c.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg transition-colors"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/chantiers/${c.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg transition-colors"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.nom)}
                          className="grid place-items-center h-8 w-8 rounded-lg transition-colors"
                          style={{ color: C.danger }}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
