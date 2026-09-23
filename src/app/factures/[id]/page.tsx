// src/app/factures/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Receipt as ReceiptIcon,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import FactureForm from "@/components/factures/FactureForm";
import PaiementModal from "@/components/factures/PaiementModal";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate, joursRestants } from "@/lib/format";
import { STATUTS_FACTURE } from "@/lib/constants";
import { updateItem } from "@/lib/storage";
import { C } from "@/lib/theme";
import type { Facture } from "@/lib/types";

export default function FactureDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const { ready, factures, clients, chantiers, devis, refresh } = useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");
  const [showPaiement, setShowPaiement] = useState(false);

  const facture = factures.find((f) => f.id === id);
  const client = clients.find((c) => c.id === facture?.clientId);
  const chantier = chantiers.find((c) => c.id === facture?.chantierId);
  const devisLie = devis.find((d) => d.id === facture?.devisId);

  const marquerEnvoyee = () => {
    if (!facture) return;
    updateItem<Facture>("factures", facture.id, { statut: "envoyee" });
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

  if (!facture) {
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
                Facture introuvable
              </h2>
              <Link href="/factures" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour aux factures
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const s = STATUTS_FACTURE[facture.statut];
  const reste = facture.montantTTC - facture.montantPaye;
  const pct = Math.round(
    (facture.montantPaye / Math.max(1, facture.montantTTC)) * 100,
  );
  const jours = joursRestants(facture.dateEcheance);
  const enRetard = facture.statut !== "payee" && jours < 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1100 }}>
          <Link
            href="/factures"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux factures
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${facture.numero}`}
                subtitle="Mettez à jour la facture"
              />
              <FactureForm initial={facture} />
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
                      {facture.numero}
                    </h1>
                    <Badge bg={s.bg} color={s.color}>
                      {s.label}
                    </Badge>
                    {enRetard && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11.5px] font-bold"
                        style={{
                          backgroundColor: "#FEE2E2",
                          color: C.danger,
                        }}
                      >
                        <AlertTriangle size={11} /> En retard de{" "}
                        {Math.abs(jours)} j
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]"
                    style={{ color: C.slate }}
                  >
                    <span>👤 {client?.nom ?? "—"}</span>
                    {chantier && <span>🏗️ {chantier.nom}</span>}
                    {devisLie && (
                      <span>
                        📄 Depuis{" "}
                        <Link
                          href={`/devis/${devisLie.id}`}
                          className="font-semibold hover:underline"
                          style={{ color: C.deep }}
                        >
                          {devisLie.numero}
                        </Link>
                      </span>
                    )}
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px]"
                    style={{ color: C.slate }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} /> Émise {formatDate(facture.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={12} /> Échéance{" "}
                      {formatDate(facture.dateEcheance)}
                      {!enRetard && facture.statut !== "payee" && (
                        <span style={{ color: C.deep }}>
                          ({jours} j restants)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {facture.statut === "brouillon" && (
                    <Button
                      variant="outline"
                      icon={<ReceiptIcon size={14} />}
                      onClick={marquerEnvoyee}
                    >
                      Marquer envoyée
                    </Button>
                  )}
                  {reste > 0 && facture.statut !== "brouillon" && (
                    <Button
                      icon={<Wallet size={14} />}
                      onClick={() => setShowPaiement(true)}
                    >
                      Enregistrer un paiement
                    </Button>
                  )}
                  {facture.statut === "payee" && (
                    <span
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold"
                      style={{
                        backgroundColor: "#DCFCE7",
                        color: "#166534",
                      }}
                    >
                      <CheckCircle2 size={15} /> Facture soldée
                    </span>
                  )}
                  <Button
                    variant="outline"
                    icon={<Pencil size={15} />}
                    onClick={() => setEdit(true)}
                  >
                    Modifier
                  </Button>
                </div>
              </div>

              {/* KPIs financiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <MiniStat
                  label="Montant TTC"
                  value={formatFCFA(facture.montantTTC)}
                  color={C.ink}
                />
                <MiniStat
                  label="Encaissé"
                  value={formatFCFA(facture.montantPaye)}
                  color={C.success}
                />
                <MiniStat
                  label="Reste à encaisser"
                  value={formatFCFA(reste)}
                  color={reste > 0 ? C.danger : C.success}
                  strong={reste > 0}
                />
              </div>

              {/* Progression */}
              <div className="mt-6">
                <Card>
                  <CardHeader title="Progression du paiement" />
                  <CardBody>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px]" style={{ color: C.slate }}>
                        {pct}% encaissé
                      </span>
                      <span
                        className="font-bold text-[18px]"
                        style={{ color: pct >= 100 ? C.success : C.deep }}
                      >
                        {formatFCFA(facture.montantPaye)} /{" "}
                        {formatFCFA(facture.montantTTC)}
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </CardBody>
                </Card>
              </div>

              {/* Notes */}
              {facture.notes && (
                <div className="mt-6">
                  <Card>
                    <CardHeader title="Notes / Historique" />
                    <CardBody>
                      <p
                        className="text-[13.5px] leading-relaxed whitespace-pre-wrap"
                        style={{ color: C.ink }}
                      >
                        {facture.notes}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              )}

              <PaiementModal
                open={showPaiement}
                onClose={() => setShowPaiement(false)}
                facture={facture}
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
  color,
  strong,
}: {
  label: string;
  value: string;
  color: string;
  strong?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: strong ? "#FEF2F2" : C.white,
        border: `1px solid ${strong ? "#FECACA" : C.border}`,
      }}
    >
      <div
        className="text-[12px] font-medium uppercase"
        style={{ color: C.slate, letterSpacing: "0.02em" }}
      >
        {label}
      </div>
      <div className="mt-2 font-bold truncate" style={{ fontSize: 22, color }}>
        {value}
      </div>
    </div>
  );
}
