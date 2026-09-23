// src/app/personnel/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  UserCog,
  Users,
  Wallet,
  Building2,
  Eye,
  Pencil,
  Trash2,
  Phone,
  HardHat,
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
import { ROLES_EMPLOYE } from "@/lib/constants";
import { C } from "@/lib/theme";
import type { RoleEmploye } from "@/lib/types";

const FILTRES: { value: "tous" | "actif" | "inactif"; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "actif", label: "Actifs" },
  { value: "inactif", label: "Inactifs" },
];

export default function PersonnelPage() {
  const { ready, employes, chantiers, pointages, refresh } = useData();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "actif" | "inactif">("tous");
  const [roleFilter, setRoleFilter] = useState<"tous" | RoleEmploye>("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = employes.length;
    const actifs = employes.filter((e) => e.actif).length;
    const affectes = employes.filter((e) => e.chantierId).length;
    const masseSalariale = employes
      .filter((e) => e.actif)
      .reduce((s, e) => s + e.tauxJournalier, 0);
    return { total, actifs, affectes, masseSalariale };
  }, [employes]);

  const filtered = useMemo(() => {
    let list = employes;
    if (filtre === "actif") list = list.filter((e) => e.actif);
    if (filtre === "inactif") list = list.filter((e) => !e.actif);
    if (roleFilter !== "tous") list = list.filter((e) => e.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.nom.toLowerCase().includes(q) ||
          e.prenom.toLowerCase().includes(q) ||
          e.telephone.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [employes, filtre, roleFilter, search]);

  const handleDelete = (id: string, nomComplet: string) => {
    const hasPointages = pointages.some((p) => p.employeId === id);
    if (hasPointages) {
      alert(
        `Impossible de supprimer "${nomComplet}" : des pointages lui sont associés.`,
      );
      return;
    }
    if (!window.confirm(`Supprimer "${nomComplet}" ?`)) return;
    deleteItem("employes", id);
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

  const rolesDisponibles: { value: "tous" | RoleEmploye; label: string }[] = [
    { value: "tous", label: "Tous les rôles" },
    ...(Object.keys(ROLES_EMPLOYE) as RoleEmploye[]).map((r) => ({
      value: r,
      label: ROLES_EMPLOYE[r],
    })),
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1400 }}>
          <PageHeader
            title="Personnel"
            subtitle={`${stats.total} employé(s) enregistré(s)`}
            action={
              <Link href="/personnel/nouveau">
                <Button icon={<Plus size={16} />}>Nouvel employé</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total employés"
              value={String(stats.total)}
              icon={<Users size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
            />
            <StatCard
              label="Actifs"
              value={String(stats.actifs)}
              icon={<UserCog size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
            />
            <StatCard
              label="Affectés à un chantier"
              value={String(stats.affectes)}
              icon={<Building2 size={20} />}
              iconBg="#F1F5F9"
              iconColor={C.deep}
            />
            <StatCard
              label="Masse salariale / jour"
              value={formatFCFA(stats.masseSalariale)}
              icon={<Wallet size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
              hint="employés actifs"
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
                placeholder="Rechercher par nom, prénom, téléphone…"
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

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "tous" | RoleEmploye)
                }
                className="h-9 px-3 rounded-xl text-[13px] font-semibold outline-none cursor-pointer"
                style={{
                  backgroundColor: C.smoke,
                  color: C.ink,
                  border: `1px solid ${C.border}`,
                }}
              >
                {rolesDisponibles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
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
                  icon={<UserCog size={26} />}
                  title="Aucun employé trouvé"
                  description="Ajoutez votre premier employé ou ajustez vos filtres."
                  action={
                    <Link href="/personnel/nouveau">
                      <Button icon={<Plus size={16} />}>
                        Ajouter un employé
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
                  <div className="col-span-4">Employé</div>
                  <div className="col-span-3">Rôle & contact</div>
                  <div className="col-span-2">Chantier</div>
                  <div className="col-span-2">Taux / jour</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((e, idx) => {
                  const chantier = chantiers.find((c) => c.id === e.chantierId);
                  const isHover = hoverId === e.id;
                  return (
                    <div
                      key={e.id}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-5 transition-colors"
                      style={{
                        borderBottom:
                          idx < filtered.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: isHover ? C.smoke : "transparent",
                        opacity: e.actif ? 1 : 0.55,
                      }}
                      onMouseEnter={() => setHoverId(e.id)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      {/* Employé */}
                      <div className="lg:col-span-4 min-w-0 flex items-center gap-3">
                        <div
                          className="grid place-items-center h-10 w-10 rounded-full text-[12px] font-bold shrink-0"
                          style={{
                            backgroundColor: e.actif ? C.deep : C.slate,
                            color: C.white,
                          }}
                        >
                          {e.prenom[0]}
                          {e.nom[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/personnel/${e.id}`}
                              className="font-semibold text-[14px] hover:underline"
                              style={{ color: C.ink }}
                            >
                              {e.prenom} {e.nom}
                            </Link>
                            {!e.actif && (
                              <Badge bg={C.slateBg} color={C.slate}>
                                Inactif
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rôle & contact */}
                      <div className="lg:col-span-3">
                        <Badge bg="#DBEAFE" color={C.deep}>
                          {ROLES_EMPLOYE[e.role]}
                        </Badge>
                        <div
                          className="mt-1.5 text-[12px] inline-flex items-center gap-1.5"
                          style={{ color: C.slate }}
                        >
                          <Phone size={11} /> {e.telephone}
                        </div>
                      </div>

                      {/* Chantier */}
                      <div className="lg:col-span-2">
                        {chantier ? (
                          <div
                            className="inline-flex items-center gap-1.5 text-[12.5px]"
                            style={{ color: C.ink }}
                          >
                            <HardHat size={12} style={{ color: C.deep }} />
                            <span className="truncate">{chantier.nom}</span>
                          </div>
                        ) : (
                          <span
                            className="text-[12.5px]"
                            style={{ color: C.light }}
                          >
                            Non affecté
                          </span>
                        )}
                      </div>

                      {/* Taux */}
                      <div
                        className="lg:col-span-2 font-semibold text-[13.5px]"
                        style={{ color: C.ink }}
                      >
                        {formatFCFA(e.tauxJournalier)}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/personnel/${e.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/personnel/${e.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(e.id, `${e.prenom} ${e.nom}`)
                          }
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
