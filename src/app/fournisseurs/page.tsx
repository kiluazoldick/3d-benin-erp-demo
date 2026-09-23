// src/app/fournisseurs/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Truck,
  Building2,
  Wallet,
  AlertTriangle,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
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
import { CATEGORIES_FOURNISSEUR } from "@/lib/constants";
import { C } from "@/lib/theme";

export default function FournisseursPage() {
  const { ready, fournisseurs, engagements, materiaux, refresh } = useData();
  const [search, setSearch] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("toutes");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = fournisseurs.length;
    const dettes = engagements
      .filter((e) => e.type === "fournisseur" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    const categories = new Set(fournisseurs.map((f) => f.categorie)).size;
    const enRetard = engagements.filter(
      (e) =>
        e.type === "fournisseur" &&
        e.statut !== "regle" &&
        new Date(e.dateEcheance).getTime() < Date.now(),
    ).length;
    return { total, dettes, categories, enRetard };
  }, [fournisseurs, engagements]);

  const filtered = useMemo(() => {
    let list = fournisseurs;
    if (categorieFilter !== "toutes")
      list = list.filter((f) => f.categorie === categorieFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.nom.toLowerCase().includes(q) ||
          f.contact.toLowerCase().includes(q) ||
          f.telephone.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [fournisseurs, categorieFilter, search]);

  const getFournisseurStats = (fournisseurId: string) => {
    const nbMateriaux = materiaux.filter(
      (m) => m.fournisseurId === fournisseurId,
    ).length;
    const mesEngagements = engagements.filter(
      (e) => e.type === "fournisseur" && e.tiersId === fournisseurId,
    );
    const dette = mesEngagements
      .filter((e) => e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    return { nbMateriaux, dette, nbEngagements: mesEngagements.length };
  };

  const handleDelete = (id: string, nom: string) => {
    const hasEngagements = engagements.some(
      (e) =>
        e.type === "fournisseur" && e.tiersId === id && e.statut !== "regle",
    );
    if (hasEngagements) {
      alert(
        `Impossible de supprimer "${nom}" : des engagements en cours y sont rattachés.`,
      );
      return;
    }
    if (!window.confirm(`Supprimer le fournisseur "${nom}" ?`)) return;
    deleteItem("fournisseurs", id);
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
            title="Fournisseurs"
            subtitle={`${stats.total} fournisseur(s) enregistré(s)`}
            action={
              <Link href="/fournisseurs/nouveau">
                <Button icon={<Plus size={16} />}>Nouveau fournisseur</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total fournisseurs"
              value={String(stats.total)}
              icon={<Truck size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
            />
            <StatCard
              label="Catégories"
              value={String(stats.categories)}
              icon={<Building2 size={20} />}
              iconBg="#F1F5F9"
              iconColor={C.deep}
            />
            <StatCard
              label="Dettes en cours"
              value={formatFCFA(stats.dettes)}
              icon={<Wallet size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
              hint="à honorer"
            />
            <StatCard
              label="En retard"
              value={String(stats.enRetard)}
              icon={<AlertTriangle size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
              hint="échéances dépassées"
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
                placeholder="Rechercher un fournisseur…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13.5px]"
                style={{ color: C.ink }}
              />
            </div>

            <select
              value={categorieFilter}
              onChange={(e) => setCategorieFilter(e.target.value)}
              className="h-10 px-3 rounded-xl text-[13px] font-medium outline-none cursor-pointer"
              style={{
                backgroundColor: C.smoke,
                color: C.ink,
                border: `1px solid ${C.border}`,
              }}
            >
              <option value="toutes">Toutes les catégories</option>
              {CATEGORIES_FOURNISSEUR.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
                  icon={<Truck size={26} />}
                  title="Aucun fournisseur trouvé"
                  description="Ajoutez votre premier fournisseur ou ajustez vos filtres."
                  action={
                    <Link href="/fournisseurs/nouveau">
                      <Button icon={<Plus size={16} />}>
                        Créer un fournisseur
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
                  <div className="col-span-3">Fournisseur</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">Catégorie</div>
                  <div className="col-span-2">Dette</div>
                  <div className="col-span-1">Matériaux</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((f, idx) => {
                  const s = getFournisseurStats(f.id);
                  const isHover = hoverId === f.id;
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
                      {/* Nom */}
                      <div className="lg:col-span-3 min-w-0">
                        <Link
                          href={`/fournisseurs/${f.id}`}
                          className="font-semibold text-[14.5px] hover:underline"
                          style={{ color: C.ink }}
                        >
                          {f.nom}
                        </Link>
                        <div
                          className="mt-0.5 text-[12.5px] truncate"
                          style={{ color: C.slate }}
                        >
                          {f.adresse || "Adresse non renseignée"}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="lg:col-span-3 min-w-0">
                        {f.contact && (
                          <div
                            className="text-[13px] font-medium"
                            style={{ color: C.ink }}
                          >
                            {f.contact}
                          </div>
                        )}
                        <div
                          className="mt-0.5 flex flex-col gap-0.5 text-[12px]"
                          style={{ color: C.slate }}
                        >
                          {f.telephone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone size={11} /> {f.telephone}
                            </span>
                          )}
                          {f.email && (
                            <span className="inline-flex items-center gap-1.5 truncate">
                              <Mail size={11} /> {f.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Catégorie */}
                      <div className="lg:col-span-2">
                        <Badge bg="#DBEAFE" color={C.deep}>
                          {f.categorie}
                        </Badge>
                      </div>

                      {/* Dette */}
                      <div className="lg:col-span-2">
                        {s.dette > 0 ? (
                          <div
                            className="text-[13.5px] font-bold"
                            style={{ color: C.danger }}
                          >
                            {formatFCFA(s.dette)}
                          </div>
                        ) : (
                          <div
                            className="text-[13px] font-semibold"
                            style={{ color: C.success }}
                          >
                            À jour
                          </div>
                        )}
                      </div>

                      {/* Matériaux */}
                      <div
                        className="lg:col-span-1 text-[13px] font-semibold"
                        style={{ color: C.ink }}
                      >
                        {s.nbMateriaux}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/fournisseurs/${f.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/fournisseurs/${f.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(f.id, f.nom)}
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
