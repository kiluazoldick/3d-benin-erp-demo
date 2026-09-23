// src/app/devis/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  ArrowRight,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { deleteItem } from "@/lib/storage";
import { formatFCFA, formatDate } from "@/lib/format";
import { STATUTS_DEVIS } from "@/lib/constants";
import { C } from "@/lib/theme";
import type { StatutDevis } from "@/lib/types";

const FILTRES: { value: "tous" | StatutDevis; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "brouillon", label: "Brouillons" },
  { value: "envoye", label: "Envoyés" },
  { value: "accepte", label: "Acceptés" },
  { value: "refuse", label: "Refusés" },
];

export default function DevisPage() {
  const { ready, devis, clients, refresh } = useData();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | StatutDevis>("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = devis.length;
    const acceptes = devis.filter((d) => d.statut === "accepte").length;
    const enAttente = devis.filter((d) => d.statut === "envoye").length;
    const refuses = devis.filter((d) => d.statut === "refuse").length;
    const montantAccepte = devis
      .filter((d) => d.statut === "accepte")
      .reduce((s, d) => s + d.totalTTC, 0);
    return { total, acceptes, enAttente, refuses, montantAccepte };
  }, [devis]);

  const filtered = useMemo(() => {
    let list = devis;
    if (filtre !== "tous") list = list.filter((d) => d.statut === filtre);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) => {
        const client = clients.find((c) => c.id === d.clientId);
        return (
          d.numero.toLowerCase().includes(q) ||
          (client?.nom.toLowerCase().includes(q) ?? false)
        );
      });
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [devis, filtre, search, clients]);

  const handleDelete = (id: string, numero: string) => {
    if (!window.confirm(`Supprimer le devis "${numero}" ?`)) return;
    deleteItem("devis", id);
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
            title="Devis"
            subtitle={`${stats.total} devis enregistré(s)`}
            action={
              <Link href="/devis/nouveau">
                <Button icon={<Plus size={16} />}>Nouveau devis</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total devis"
              value={String(stats.total)}
              icon={<FileText size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
            />
            <StatCard
              label="Acceptés"
              value={String(stats.acceptes)}
              icon={<CheckCircle2 size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
              hint={formatFCFA(stats.montantAccepte)}
            />
            <StatCard
              label="En attente"
              value={String(stats.enAttente)}
              icon={<Clock size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
              hint="envoyés au client"
            />
            <StatCard
              label="Refusés"
              value={String(stats.refuses)}
              icon={<XCircle size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
            />
          </div>

          {/* Barre filtres */}
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
                  icon={<FileText size={26} />}
                  title="Aucun devis trouvé"
                  description="Créez votre premier devis ou ajustez vos filtres."
                  action={
                    <Link href="/devis/nouveau">
                      <Button icon={<Plus size={16} />}>Créer un devis</Button>
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
                {/* Header desktop */}
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
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Montant TTC</div>
                  <div className="col-span-1">Statut</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((d, idx) => {
                  const client = clients.find((c) => c.id === d.clientId);
                  const s = STATUTS_DEVIS[d.statut];
                  const isHover = hoverId === d.id;
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 transition-colors"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: isHover ? C.smoke : "transparent",
                      }}
                      onMouseEnter={() => setHoverId(d.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      {/* Numéro */}
                      <div className="lg:col-span-3 min-w-0">
                        <Link
                          href={`/devis/${d.id}`}
                          className="font-semibold text-[14px] hover:underline"
                          style={{ color: C.ink }}
                        >
                          {d.numero}
                        </Link>
                        <div
                          className="mt-0.5 text-[12px]"
                          style={{ color: C.slate }}
                        >
                          {d.lignes.length} ligne(s)
                        </div>
                      </div>

                      {/* Client */}
                      <div
                        className="lg:col-span-3 text-[13px] truncate"
                        style={{ color: C.ink }}
                      >
                        {client?.nom ?? "—"}
                      </div>

                      {/* Date */}
                      <div
                        className="lg:col-span-2 text-[12.5px]"
                        style={{ color: C.slate }}
                      >
                        {formatDate(d.date)}
                        {d.dateValidite && (
                          <div className="text-[11.5px]">
                            Exp. {formatDate(d.dateValidite)}
                          </div>
                        )}
                      </div>

                      {/* Montant */}
                      <div
                        className="lg:col-span-2 font-semibold text-[14px]"
                        style={{ color: C.ink }}
                      >
                        {formatFCFA(d.totalTTC)}
                      </div>

                      {/* Statut */}
                      <div className="lg:col-span-1">
                        <Badge bg={s.bg} color={s.color}>
                          {s.label}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/devis/${d.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/devis/${d.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(d.id, d.numero)}
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
