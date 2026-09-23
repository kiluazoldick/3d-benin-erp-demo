// src/app/materiaux/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Wallet,
  TrendingDown,
  Eye,
  Pencil,
  Trash2,
  ArrowDown,
  ArrowUp,
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
import { formatFCFA } from "@/lib/format";
import { C } from "@/lib/theme";

const FILTRES = [
  { value: "tous", label: "Tous" },
  { value: "alerte", label: "En alerte" },
  { value: "ok", label: "Stock OK" },
] as const;

export default function MateriauxPage() {
  const { ready, materiaux, fournisseurs, refresh } = useData();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "alerte" | "ok">("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = materiaux.length;
    const valeurStock = materiaux.reduce(
      (s, m) => s + m.stock * m.prixUnitaire,
      0,
    );
    const enAlerte = materiaux.filter((m) => m.stock <= m.seuilAlerte).length;
    const rupture = materiaux.filter((m) => m.stock === 0).length;
    return { total, valeurStock, enAlerte, rupture };
  }, [materiaux]);

  const filtered = useMemo(() => {
    let list = materiaux;
    if (filtre === "alerte")
      list = list.filter((m) => m.stock <= m.seuilAlerte);
    if (filtre === "ok") list = list.filter((m) => m.stock > m.seuilAlerte);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.nom.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [materiaux, filtre, search]);

  const handleDelete = (id: string, nom: string) => {
    if (!window.confirm(`Supprimer "${nom}" ?`)) return;
    deleteItem("materiaux", id);
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
            title="Matériaux"
            subtitle={`${stats.total} référence(s) en stock`}
            action={
              <Link href="/materiaux/nouveau">
                <Button icon={<Plus size={16} />}>Nouveau matériau</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Valeur du stock"
              value={formatFCFA(stats.valeurStock)}
              icon={<Wallet size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
              hint={`${stats.total} référence(s)`}
            />
            <StatCard
              label="Matériaux en alerte"
              value={String(stats.enAlerte)}
              icon={<AlertTriangle size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
              hint="sous le seuil"
            />
            <StatCard
              label="En rupture"
              value={String(stats.rupture)}
              icon={<TrendingDown size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
              hint="stock = 0"
            />
            <StatCard
              label="Références saines"
              value={String(stats.total - stats.enAlerte)}
              icon={<Package size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
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
                placeholder="Rechercher un matériau…"
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
                  icon={<Package size={26} />}
                  title="Aucun matériau trouvé"
                  description="Ajoutez votre premier matériau ou ajustez vos filtres."
                  action={
                    <Link href="/materiaux/nouveau">
                      <Button icon={<Plus size={16} />}>
                        Créer un matériau
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
                  <div className="col-span-4">Matériau</div>
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-2">Prix unitaire</div>
                  <div className="col-span-2">Valeur stock</div>
                  <div className="col-span-1">Alerte</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((m, idx) => {
                  const f = fournisseurs.find((x) => x.id === m.fournisseurId);
                  const isHover = hoverId === m.id;
                  const enAlerte = m.stock <= m.seuilAlerte;
                  const rupture = m.stock === 0;

                  const bgColor = rupture
                    ? "#FEF2F2"
                    : enAlerte
                      ? "#FFFBEB"
                      : isHover
                        ? C.smoke
                        : "transparent";

                  return (
                    <div
                      key={m.id}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 transition-colors"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: bgColor,
                      }}
                      onMouseEnter={() => setHoverId(m.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      {/* Matériau */}
                      <div className="lg:col-span-4 min-w-0">
                        <Link
                          href={`/materiaux/${m.id}`}
                          className="font-semibold text-[14px] hover:underline"
                          style={{ color: C.ink }}
                        >
                          {m.nom}
                        </Link>
                        <div
                          className="mt-0.5 text-[12px]"
                          style={{ color: C.slate }}
                        >
                          {f?.nom ?? "Aucun fournisseur"}
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="lg:col-span-2">
                        <div
                          className="font-bold text-[15px]"
                          style={{
                            color: rupture
                              ? C.danger
                              : enAlerte
                                ? C.warning
                                : C.ink,
                          }}
                        >
                          {m.stock} {m.unite}
                        </div>
                        <div
                          className="text-[11.5px]"
                          style={{ color: C.slate }}
                        >
                          Seuil : {m.seuilAlerte}
                        </div>
                      </div>

                      {/* Prix */}
                      <div
                        className="lg:col-span-2 text-[13px] font-semibold"
                        style={{ color: C.ink }}
                      >
                        {formatFCFA(m.prixUnitaire)}
                      </div>

                      {/* Valeur */}
                      <div
                        className="lg:col-span-2 text-[13px] font-semibold"
                        style={{ color: C.deep }}
                      >
                        {formatFCFA(m.stock * m.prixUnitaire)}
                      </div>

                      {/* Alerte */}
                      <div className="lg:col-span-1">
                        {rupture ? (
                          <Badge bg="#FEE2E2" color={C.danger}>
                            Rupture
                          </Badge>
                        ) : enAlerte ? (
                          <Badge bg="#FEF3C7" color="#92400E">
                            Alerte
                          </Badge>
                        ) : (
                          <Badge bg="#DCFCE7" color="#166534">
                            OK
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/materiaux/${m.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/materiaux/${m.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(m.id, m.nom)}
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
