// src/app/clients/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users,
  Building2,
  TrendingUp,
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
import EmptyState from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { deleteItem } from "@/lib/storage";
import { formatFCFA } from "@/lib/format";
import { C } from "@/lib/theme";

export default function ClientsPage() {
  const { ready, clients, chantiers, factures, engagements, refresh } =
    useData();
  const [search, setSearch] = useState("");
  const [hoverId, setHoverId] = useState<string | null>(null);

  // ---------- KPIs ----------
  const stats = useMemo(() => {
    const total = clients.length;
    const clientsAvecChantier = new Set(chantiers.map((c) => c.clientId)).size;

    const creances = engagements
      .filter((e) => e.type === "client" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);

    const caTotal = factures.reduce((s, f) => s + f.montantPaye, 0);

    return { total, clientsAvecChantier, creances, caTotal };
  }, [clients, chantiers, factures, engagements]);

  // ---------- Filtrage ----------
  const filtered = useMemo(() => {
    let list = clients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          c.contact.toLowerCase().includes(q) ||
          c.telephone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [clients, search]);

  const getClientStats = (clientId: string) => {
    const nbChantiers = chantiers.filter((c) => c.clientId === clientId).length;
    const nbFactures = factures.filter((f) => f.clientId === clientId).length;
    const soldeDu = engagements
      .filter(
        (e) =>
          e.type === "client" && e.tiersId === clientId && e.statut !== "regle",
      )
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    return { nbChantiers, nbFactures, soldeDu };
  };

  const handleDelete = (id: string, nom: string) => {
    const hasChantiers = chantiers.some((c) => c.clientId === id);
    if (hasChantiers) {
      alert(
        `Impossible de supprimer "${nom}" : des chantiers y sont rattachés.`,
      );
      return;
    }
    if (!window.confirm(`Supprimer le client "${nom}" ?`)) return;
    deleteItem("clients", id);
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
            title="Clients"
            subtitle={`${stats.total} client(s) enregistré(s)`}
            action={
              <Link href="/clients/nouveau">
                <Button icon={<Plus size={16} />}>Nouveau client</Button>
              </Link>
            }
          />

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total clients"
              value={String(stats.total)}
              icon={<Users size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
            />
            <StatCard
              label="Avec chantier actif"
              value={String(stats.clientsAvecChantier)}
              icon={<Building2 size={20} />}
              iconBg="#F1F5F9"
              iconColor={C.deep}
            />
            <StatCard
              label="CA encaissé"
              value={formatFCFA(stats.caTotal)}
              icon={<TrendingUp size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
            />
            <StatCard
              label="Créances clients"
              value={formatFCFA(stats.creances)}
              icon={<TrendingUp size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
              hint="à recouvrer"
            />
          </div>

          {/* Barre recherche */}
          <div
            className="mt-6 rounded-2xl p-4"
            style={{
              backgroundColor: C.white,
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              className="flex items-center gap-2 h-10 px-4 rounded-xl max-w-md"
              style={{
                backgroundColor: C.smoke,
                border: `1px solid ${C.border}`,
              }}
            >
              <Search size={16} style={{ color: C.light }} />
              <input
                type="text"
                placeholder="Rechercher par nom, contact, téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13.5px]"
                style={{ color: C.ink }}
              />
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
                  icon={<Users size={26} />}
                  title="Aucun client trouvé"
                  description="Ajoutez votre premier client ou modifiez votre recherche."
                  action={
                    <Link href="/clients/nouveau">
                      <Button icon={<Plus size={16} />}>Créer un client</Button>
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
                {/* En-tête desktop */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 text-[11.5px] font-semibold uppercase"
                  style={{
                    backgroundColor: C.smoke,
                    color: C.slate,
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div className="col-span-4">Client</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">Activité</div>
                  <div className="col-span-2">Solde dû</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {filtered.map((c, idx) => {
                  const s = getClientStats(c.id);
                  const isHover = hoverId === c.id;
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
                      {/* Client */}
                      <div className="lg:col-span-4 min-w-0">
                        <Link
                          href={`/clients/${c.id}`}
                          className="font-semibold text-[14.5px] hover:underline"
                          style={{ color: C.ink }}
                        >
                          {c.nom}
                        </Link>
                        <div
                          className="mt-1 text-[12.5px] truncate"
                          style={{ color: C.slate }}
                        >
                          {c.adresse || "Adresse non renseignée"}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="lg:col-span-3 min-w-0">
                        {c.contact && (
                          <div
                            className="text-[13px] font-medium"
                            style={{ color: C.ink }}
                          >
                            {c.contact}
                          </div>
                        )}
                        <div
                          className="mt-0.5 flex flex-col gap-0.5 text-[12px]"
                          style={{ color: C.slate }}
                        >
                          {c.telephone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone size={11} /> {c.telephone}
                            </span>
                          )}
                          {c.email && (
                            <span className="inline-flex items-center gap-1.5 truncate">
                              <Mail size={11} /> {c.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Activité */}
                      <div
                        className="lg:col-span-2 text-[13px]"
                        style={{ color: C.ink }}
                      >
                        <div>
                          <span className="font-semibold">{s.nbChantiers}</span>{" "}
                          <span style={{ color: C.slate }}>chantier(s)</span>
                        </div>
                        <div className="text-[12px]" style={{ color: C.slate }}>
                          {s.nbFactures} facture(s)
                        </div>
                      </div>

                      {/* Solde dû */}
                      <div className="lg:col-span-2">
                        {s.soldeDu > 0 ? (
                          <div
                            className="text-[13.5px] font-bold"
                            style={{ color: C.danger }}
                          >
                            {formatFCFA(s.soldeDu)}
                          </div>
                        ) : (
                          <div
                            className="text-[13.5px] font-semibold"
                            style={{ color: C.success }}
                          >
                            À jour
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex lg:justify-end items-center gap-1.5">
                        <Link href={`/clients/${c.id}`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.deep }}
                            title="Voir"
                          >
                            <Eye size={15} />
                          </button>
                        </Link>
                        <Link href={`/clients/${c.id}?edit=1`}>
                          <button
                            className="grid place-items-center h-8 w-8 rounded-lg"
                            style={{ color: C.slate }}
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.nom)}
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
