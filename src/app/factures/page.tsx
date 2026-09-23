// src/app/factures/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Receipt,
  Wallet,
  AlertTriangle,
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
import { formatFCFA, formatDate, joursRestants } from "@/lib/format";
import { STATUTS_FACTURE } from "@/lib/constants";
import { C } from "@/lib/theme";
import type { StatutFacture } from "@/lib/types";

const FILTRES: { value: "tous" | StatutFacture; label: string }[] = [
  { value: "tous", label: "Toutes" },
  { value: "brouillon", label: "Brouillons" },
  { value: "envoyee", label: "Envoyées" },
  { value: "payee", label: "Payées" },
  { value: "impayee", label: "Impayées" },
];

export default function FacturesPage() {
  const { ready, factures, clients, refresh } = useData();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | StatutFacture>("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = factures.length;
    const caFacture = factures.reduce((s, f) => s + f.montantTTC, 0);
    const caEncaisse = factures.reduce((s, f) => s + f.montantPaye, 0);
    const resteAEncaisser = caFacture - caEncaisse;
    const enRetard = factures.filter(
      (f) => f.statut !== "payee" && joursRestants(f.dateEcheance) < 0,
    ).length;
    return { total, caFacture, caEncaisse, resteAEncaisser, enRetard };
  }, [factures]);

  const filtered = useMemo(() => {
    let list = factures;
    if (filtre !== "tous") list = list.filter((f) => f.statut === filtre);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((f) => {
        const client = clients.find((c) => c.id === f.clientId);
        return (
          f.numero.toLowerCase().includes(q) ||
          (client?.nom.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [factures, filtre, search, clients]);

  const handleDelete = (id: string, numero: string) => {
    if (!window.confirm(`Supprimer la facture "${numero}" ?`)) return;
    deleteItem("factures", id);
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
            title="Factures"
            subtitle={`${stats.total} facture(s) enregistrée(s)`}
            action={
              <Link href="/factures/nouveau">
                <Button icon={<Plus size={16} />}>Nouvelle facture</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total facturé"
              value={formatFCFA(stats.caFacture)}
              icon={<Receipt size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
              hint={`${stats.total} facture(s)`}
            />
            <StatCard
              label="Encaissé"
              value={formatFCFA(stats.caEncaisse)}
              icon={<Wallet size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
              hint={`${Math.round(
                (stats.caEncaisse / Math.max(1, stats.caFacture)) * 100,
              )}% du facturé`}
            />
            <StatCard
              label="Reste à encaisser"
              value={formatFCFA(stats.resteAEncaisser)}
              icon={<Wallet size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
            />
            <StatCard
              label="En retard"
              value={String(stats.enRetard)}
              icon={<AlertTriangle size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
              hint="échéance dépassée"
            />
          </div>

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
                placeholder="Rechercher par numéro ou client…"
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
                  icon={<Receipt size={26} />}
                  title="Aucune facture trouvée"
                  description="Créez votre première facture ou ajustez vos filtres."
                  action={
                    <Link href="/factures/nouveau">
                      <Button icon={<Plus size={16} />}>
                        Créer une facture
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
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 text-[11.5px] font-semibold uppercase"
                  style={{
                    backgroundColor: C.smoke,
                    color: C.slate,
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div className="col-span-3">Numéro</div>
                  <div className="col-span-3">Client</div>
                  <div className="col-span-2">Montant TTC</div>
                  <div className="col-span-2">Encaissé</div>
                  <div className="col-span-1">Statut</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((f, idx) => {
                  const client = clients.find((c) => c.id === f.clientId);
                  const s = STATUTS_FACTURE[f.statut];
                  const isHover = hoverId === f.id;
                  const reste = f.montantTTC - f.montantPaye;
                  const pct = Math.round(
                    (f.montantPaye / Math.max(1, f.montantTTC)) * 100,
                  );
                  const enRetard =
                    f.statut !== "payee" && joursRestants(f.dateEcheance) < 0;

                  return (
                    <div
                      key={f.id}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 transition-colors"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: isHover ? C.smoke : "transparent",
                      }}
                      onMouseEnter={() => setHoverId(f.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      {/* Numéro */}
                      <div className="lg:col-span-3 min-w-0">
                        <Link
                          href={`/factures/${f.id}`}
                          className="font-semibold text-[14px] hover:underline"
                          style={{ color: C.ink }}
                        >
                          {f.numero}
                        </Link>
                        <div
                          className="mt-0.5 text-[12px] flex items-center gap-2"
                          style={{ color: enRetard ? C.danger : C.slate }}
                        >
                          <span>Émise {formatDate(f.date)}</span>
                          {enRetard && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10.5px] font-bold"
                              style={{
                                backgroundColor: "#FEE2E2",
                                color: C.danger,
                              }}
                            >
                              RETARD
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Client */}
                      <div
                        className="lg:col-span-3 text-[13px] truncate"
                        style={{ color: C.ink }}
                      >
                        {client?.nom ?? "—"}
                      </div>

                      {/* Montant */}
                      <div
                        className="lg:col-span-2 font-semibold text-[13.5px]"
                        style={{ color: C.ink }}
                      >
                        {formatFCFA(f.montantTTC)}
                      </div>

                      {/* Encaissé */}
                      <div className="lg:col-span-2">
                        <div
                          className="flex items-center justify-between text-[11.5px] mb-1"
                          style={{ color: C.slate }}
                        >
                          <span>{formatFCFA(f.montantPaye)}</span>
                          <span className="font-semibold">{pct}%</span>
                        </div>
                        <ProgressBar value={pct} />
                        {reste > 0 && (
                          <div
                            className="mt-1 text-[11px]"
                            style={{ color: C.warning }}
                          >
                            Reste {formatFCFA(reste)}
                          </div>
                        )}
                      </div>

                      {/* Statut */}
                      <div className="lg:col-span-1">
                        <Badge bg={s.bg} color={s.color}>
                          {s.label}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/factures/${f.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/factures/${f.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(f.id, f.numero)}
                          className="grid place-items-center h-8 w-8 rounded-lg"
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
