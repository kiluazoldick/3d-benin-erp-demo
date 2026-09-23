// src/app/devis/[id]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  CheckCircle2,
  XCircle,
  Send,
  Receipt,
  FileText,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import DevisForm from "@/components/devis/DevisForm";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate, todayISO } from "@/lib/format";
import { STATUTS_DEVIS, TVA_TAUX } from "@/lib/constants";
import { updateItem, createItem, readCollection } from "@/lib/storage";
import { C } from "@/lib/theme";
import type { Devis, Facture, StatutDevis } from "@/lib/types";

function generateFactureNumero(): string {
  const all = readCollection<Facture>("factures");
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const nums = all
    .filter((f) => f.numero.startsWith(prefix))
    .map((f) => parseInt(f.numero.replace(prefix, ""), 10) || 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export default function DevisDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = String(params.id);
  const { ready, devis, clients, chantiers, factures, refresh } = useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");

  const devisItem = devis.find((d) => d.id === id);
  const client = clients.find((c) => c.id === devisItem?.clientId);
  const chantier = chantiers.find((c) => c.id === devisItem?.chantierId);
  const factureExistante = factures.find((f) => f.devisId === id);

  const setStatut = (statut: StatutDevis) => {
    if (!devisItem) return;
    updateItem<Devis>("devis", devisItem.id, { statut });
    refresh();
  };

  const convertirEnFacture = () => {
    if (!devisItem) return;
    if (factureExistante) {
      router.push(`/factures/${factureExistante.id}`);
      return;
    }

    const aujourdhui = new Date();
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 30);

    const nouvelleFacture = createItem<Facture>("factures", {
      numero: generateFactureNumero(),
      clientId: devisItem.clientId,
      chantierId: devisItem.chantierId,
      devisId: devisItem.id,
      date: aujourdhui.toISOString(),
      dateEcheance: echeance.toISOString(),
      montantHT: devisItem.totalHT,
      tva: devisItem.tva,
      montantTTC: devisItem.totalTTC,
      montantPaye: 0,
      statut: "brouillon",
      notes: `Facture générée depuis le devis ${devisItem.numero}`,
    });

    refresh();
    router.push(`/factures/${nouvelleFacture.id}`);
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

  if (!devisItem) {
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
                Devis introuvable
              </h2>
              <Link href="/devis" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour aux devis
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const s = STATUTS_DEVIS[devisItem.statut];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1100 }}>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux devis
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${devisItem.numero}`}
                subtitle="Mettez à jour le devis"
              />
              <DevisForm initial={devisItem} />
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
                      {devisItem.numero}
                    </h1>
                    <Badge bg={s.bg} color={s.color}>
                      {s.label}
                    </Badge>
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]"
                    style={{ color: C.slate }}
                  >
                    <span>👤 {client?.nom ?? "—"}</span>
                    {chantier && <span>🏗️ {chantier.nom}</span>}
                    <span>📅 {formatDate(devisItem.date)}</span>
                    {devisItem.dateValidite && (
                      <span>
                        ⏳ Valide jusqu'au {formatDate(devisItem.dateValidite)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {devisItem.statut === "brouillon" && (
                    <Button
                      variant="outline"
                      icon={<Send size={14} />}
                      onClick={() => setStatut("envoye")}
                    >
                      Marquer envoyé
                    </Button>
                  )}
                  {devisItem.statut === "envoye" && (
                    <>
                      <Button
                        variant="outline"
                        icon={<XCircle size={14} />}
                        onClick={() => setStatut("refuse")}
                      >
                        Refusé
                      </Button>
                      <Button
                        icon={<CheckCircle2 size={14} />}
                        onClick={() => setStatut("accepte")}
                      >
                        Accepté
                      </Button>
                    </>
                  )}
                  {devisItem.statut === "accepte" && (
                    <Button
                      icon={<Receipt size={14} />}
                      onClick={convertirEnFacture}
                    >
                      {factureExistante
                        ? "Voir la facture"
                        : "Convertir en facture"}
                    </Button>
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

              {/* Récap financier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <MiniStat
                  label="Total HT"
                  value={formatFCFA(devisItem.totalHT)}
                  color={C.deep}
                />
                <MiniStat
                  label={`TVA (${Math.round(TVA_TAUX * 100)}%)`}
                  value={formatFCFA(devisItem.tva)}
                  color={C.slate}
                />
                <MiniStat
                  label="Total TTC"
                  value={formatFCFA(devisItem.totalTTC)}
                  color={C.ink}
                  strong
                />
              </div>

              {/* Lignes */}
              <div className="mt-6">
                <Card>
                  <CardHeader
                    title="Détail des prestations"
                    subtitle={`${devisItem.lignes.length} ligne(s)`}
                  />
                  <CardBody className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13.5px]">
                        <thead>
                          <tr
                            style={{
                              backgroundColor: C.smoke,
                              borderBottom: `1px solid ${C.border}`,
                            }}
                          >
                            <Th>Désignation</Th>
                            <Th align="right">Quantité</Th>
                            <Th align="right">Prix unitaire</Th>
                            <Th align="right">Total</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {devisItem.lignes.map((l, i) => (
                            <tr
                              key={i}
                              style={{
                                borderBottom:
                                  i < devisItem.lignes.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                              }}
                            >
                              <Td>{l.designation}</Td>
                              <Td align="right">{l.quantite}</Td>
                              <Td align="right">
                                {formatFCFA(l.prixUnitaire)}
                              </Td>
                              <Td align="right">
                                <span
                                  className="font-semibold"
                                  style={{ color: C.ink }}
                                >
                                  {formatFCFA(l.quantite * l.prixUnitaire)}
                                </span>
                              </Td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Notes */}
              {devisItem.notes && (
                <div className="mt-6">
                  <Card>
                    <CardHeader title="Notes / Conditions" />
                    <CardBody>
                      <p
                        className="text-[13.5px] leading-relaxed whitespace-pre-wrap"
                        style={{ color: C.ink }}
                      >
                        {devisItem.notes}
                      </p>
                    </CardBody>
                  </Card>
                </div>
              )}
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
        backgroundColor: strong ? C.deep : C.white,
        border: `1px solid ${strong ? C.deep : C.border}`,
      }}
    >
      <div
        className="text-[12px] font-medium uppercase"
        style={{
          color: strong ? "rgba(255,255,255,0.7)" : C.slate,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </div>
      <div
        className="mt-2 font-bold truncate"
        style={{
          fontSize: strong ? 22 : 20,
          color: strong ? C.white : color,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className="px-6 py-3.5 text-[11.5px] font-semibold uppercase"
      style={{
        color: C.slate,
        letterSpacing: "0.05em",
        textAlign: align,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td className="px-6 py-4" style={{ color: C.ink, textAlign: align }}>
      {children}
    </td>
  );
}
