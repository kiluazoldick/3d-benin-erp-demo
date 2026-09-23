// src/app/materiaux/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Plus,
  ArrowDown,
  ArrowUp,
  Wallet,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import MateriauForm from "@/components/materiaux/MateriauForm";
import MouvementModal from "@/components/materiaux/MouvementModal";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate } from "@/lib/format";
import { C } from "@/lib/theme";

export default function MateriauDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const { ready, materiaux, fournisseurs, chantiers, mouvements } = useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");
  const [showMouvement, setShowMouvement] = useState(false);

  const materiau = materiaux.find((m) => m.id === id);
  const fournisseur = fournisseurs.find(
    (f) => f.id === materiau?.fournisseurId,
  );

  const mesMouvements = [...mouvements]
    .filter((mv) => mv.materiauId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  if (!materiau) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="p-4 sm:p-6 lg:p-8">
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                backgroundColor: C.white,
                border: `1px solid ${C.border}`,
              }}
            >
              <h2 className="text-[18px] font-bold" style={{ color: C.ink }}>
                Matériau introuvable
              </h2>
              <Link href="/materiaux" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour aux matériaux
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const enAlerte = materiau.stock <= materiau.seuilAlerte;
  const rupture = materiau.stock === 0;
  const valeurStock = materiau.stock * materiau.prixUnitaire;

  // Stats entrées/sorties
  const totalEntrees = mesMouvements
    .filter((m) => m.type === "entree")
    .reduce((s, m) => s + m.quantite, 0);
  const totalSorties = mesMouvements
    .filter((m) => m.type === "sortie")
    .reduce((s, m) => s + m.quantite, 0);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1200 }}>
          <Link
            href="/materiaux"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux matériaux
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${materiau.nom}`}
                subtitle="Mettez à jour les informations"
              />
              <MateriauForm initial={materiau} />
            </>
          ) : (
            <>
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1
                      className="text-[24px] sm:text-[28px] font-bold"
                      style={{ color: C.ink, letterSpacing: "-0.01em" }}
                    >
                      {materiau.nom}
                    </h1>
                    {rupture ? (
                      <Badge bg="#FEE2E2" color={C.danger}>
                        Rupture
                      </Badge>
                    ) : enAlerte ? (
                      <Badge bg="#FEF3C7" color="#92400E">
                        Stock bas
                      </Badge>
                    ) : (
                      <Badge bg="#DCFCE7" color="#166534">
                        Stock OK
                      </Badge>
                    )}
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]"
                    style={{ color: C.slate }}
                  >
                    <span>
                      Unité :{" "}
                      <strong style={{ color: C.ink }}>{materiau.unite}</strong>
                    </span>
                    {fournisseur && (
                      <span>
                        Fournisseur :{" "}
                        <strong style={{ color: C.ink }}>
                          {fournisseur.nom}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    icon={<Plus size={15} />}
                    onClick={() => setShowMouvement(true)}
                  >
                    Nouveau mouvement
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Pencil size={15} />}
                    onClick={() => setEdit(true)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MiniStat
                  label="Stock actuel"
                  value={`${materiau.stock} ${materiau.unite}`}
                  icon={<Package size={18} />}
                  color={rupture ? C.danger : enAlerte ? C.warning : C.deep}
                />
                <MiniStat
                  label="Valeur du stock"
                  value={formatFCFA(valeurStock)}
                  icon={<Wallet size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="Total entrées"
                  value={`+${totalEntrees} ${materiau.unite}`}
                  icon={<ArrowDown size={18} />}
                  color={C.success}
                />
                <MiniStat
                  label="Total sorties"
                  value={`-${totalSorties} ${materiau.unite}`}
                  icon={<ArrowUp size={18} />}
                  color={C.danger}
                />
              </div>

              {/* Alerte */}
              {enAlerte && (
                <div
                  className="mt-6 rounded-2xl p-5 flex items-start gap-4"
                  style={{
                    backgroundColor: rupture ? "#FEE2E2" : "#FEF3C7",
                    border: `1px solid ${rupture ? "#FCA5A5" : "#FCD34D"}`,
                  }}
                >
                  <span
                    className="grid place-items-center h-10 w-10 rounded-xl shrink-0"
                    style={{
                      backgroundColor: rupture ? C.danger : C.warning,
                      color: C.white,
                    }}
                  >
                    <AlertTriangle size={18} />
                  </span>
                  <div>
                    <div
                      className="font-semibold text-[14px]"
                      style={{ color: rupture ? "#991B1B" : "#78350F" }}
                    >
                      {rupture
                        ? "Rupture de stock"
                        : "Stock sous le seuil d'alerte"}
                    </div>
                    <p
                      className="text-[13px] mt-0.5"
                      style={{ color: rupture ? "#991B1B" : "#78350F" }}
                    >
                      Stock actuel :{" "}
                      <strong>
                        {materiau.stock} {materiau.unite}
                      </strong>{" "}
                      · Seuil : {materiau.seuilAlerte} {materiau.unite}. Pensez
                      à réapprovisionner.
                    </p>
                  </div>
                </div>
              )}

              {/* Historique mouvements */}
              <div className="mt-6">
                <Card>
                  <CardHeader
                    title="Historique des mouvements"
                    subtitle={`${mesMouvements.length} mouvement(s)`}
                  />
                  <CardBody className="p-0">
                    {mesMouvements.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucun mouvement enregistré.
                      </div>
                    ) : (
                      <ul>
                        {mesMouvements.map((mv, i, arr) => {
                          const ch = chantiers.find(
                            (c) => c.id === mv.chantierId,
                          );
                          const isEntree = mv.type === "entree";
                          return (
                            <li
                              key={mv.id}
                              className="flex items-center justify-between gap-4 px-6 py-4"
                              style={{
                                borderBottom:
                                  i < arr.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className="grid place-items-center h-9 w-9 rounded-lg shrink-0"
                                  style={{
                                    backgroundColor: isEntree
                                      ? "#DCFCE7"
                                      : "#FEE2E2",
                                    color: isEntree ? C.success : C.danger,
                                  }}
                                >
                                  {isEntree ? (
                                    <ArrowDown size={15} />
                                  ) : (
                                    <ArrowUp size={15} />
                                  )}
                                </span>
                                <div className="min-w-0">
                                  <div
                                    className="font-semibold text-[13.5px]"
                                    style={{ color: C.ink }}
                                  >
                                    {isEntree ? "Entrée" : "Sortie"} de{" "}
                                    {mv.quantite} {materiau.unite}
                                  </div>
                                  <div
                                    className="text-[12px] truncate"
                                    style={{ color: C.slate }}
                                  >
                                    {formatDate(mv.date)}
                                    {ch && ` · ${ch.nom}`}
                                    {mv.notes && ` · ${mv.notes}`}
                                  </div>
                                </div>
                              </div>
                              <div
                                className="font-semibold text-[13px] shrink-0"
                                style={{
                                  color: isEntree ? C.success : C.danger,
                                }}
                              >
                                {isEntree ? "+" : "-"}
                                {mv.quantite}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardBody>
                </Card>
              </div>

              <MouvementModal
                open={showMouvement}
                onClose={() => setShowMouvement(false)}
                materiau={materiau}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className="text-[12px] font-medium uppercase"
            style={{ color: C.slate, letterSpacing: "0.02em" }}
          >
            {label}
          </div>
          <div
            className="mt-2 text-[19px] font-bold truncate"
            style={{ color: C.ink }}
          >
            {value}
          </div>
        </div>
        <div
          className="grid place-items-center h-10 w-10 shrink-0 rounded-xl"
          style={{ backgroundColor: C.smoke, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
