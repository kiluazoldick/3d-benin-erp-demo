// src/app/clients/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  User,
  HardHat,
  FileText,
  Receipt,
  Wallet,
  Calendar,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import ClientForm from "@/components/clients/ClientForm";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate } from "@/lib/format";
import { STATUTS_CHANTIER, STATUTS_FACTURE } from "@/lib/constants";
import { C } from "@/lib/theme";

export default function ClientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const { ready, clients, chantiers, factures, engagements } = useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");

  const client = clients.find((c) => c.id === id);

  const data = useMemo(() => {
    if (!client) return null;

    const mesChantiers = chantiers.filter((c) => c.clientId === client.id);
    const mesFactures = [...factures]
      .filter((f) => f.clientId === client.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const mesEngagements = engagements.filter(
      (e) => e.type === "client" && e.tiersId === client.id,
    );

    const caTotal = mesFactures.reduce((s, f) => s + f.montantPaye, 0);
    const caFacture = mesFactures.reduce((s, f) => s + f.montantTTC, 0);
    const soldeDu = mesEngagements
      .filter((e) => e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);

    return {
      mesChantiers,
      mesFactures,
      mesEngagements,
      caTotal,
      caFacture,
      soldeDu,
    };
  }, [client, chantiers, factures, engagements]);

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

  if (!client || !data) {
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
                Client introuvable
              </h2>
              <Link href="/clients" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour aux clients
                </Button>
              </Link>
            </div>
          </main>
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
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux clients
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${client.nom}`}
                subtitle="Mettez à jour les informations du client"
              />
              <ClientForm initial={client} />
            </>
          ) : (
            <>
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <div
                      className="grid place-items-center h-14 w-14 rounded-2xl text-[18px] font-bold shrink-0"
                      style={{ backgroundColor: C.deep, color: C.white }}
                    >
                      {client.nom.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h1
                        className="text-[24px] sm:text-[26px] font-bold"
                        style={{ color: C.ink, letterSpacing: "-0.01em" }}
                      >
                        {client.nom}
                      </h1>
                      {client.contact && (
                        <p
                          className="mt-0.5 text-[13.5px]"
                          style={{ color: C.slate }}
                        >
                          Contact : {client.contact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  icon={<Pencil size={15} />}
                  onClick={() => setEdit(true)}
                >
                  Modifier
                </Button>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <MiniStat
                  label="Chantiers"
                  value={String(data.mesChantiers.length)}
                  icon={<HardHat size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="CA facturé"
                  value={formatFCFA(data.caFacture)}
                  icon={<Receipt size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="CA encaissé"
                  value={formatFCFA(data.caTotal)}
                  icon={<Wallet size={18} />}
                  color={C.success}
                />
                <MiniStat
                  label="Solde dû"
                  value={formatFCFA(data.soldeDu)}
                  icon={<Wallet size={18} />}
                  color={data.soldeDu > 0 ? C.danger : C.success}
                />
              </div>

              {/* Coordonnées + chantiers */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card>
                  <CardHeader title="Coordonnées" />
                  <CardBody>
                    <ul className="flex flex-col gap-4">
                      {client.telephone && (
                        <InfoLine
                          icon={<Phone size={14} />}
                          label="Téléphone"
                          value={client.telephone}
                        />
                      )}
                      {client.email && (
                        <InfoLine
                          icon={<Mail size={14} />}
                          label="E-mail"
                          value={client.email}
                        />
                      )}
                      {client.adresse && (
                        <InfoLine
                          icon={<MapPin size={14} />}
                          label="Adresse"
                          value={client.adresse}
                        />
                      )}
                      {client.contact && (
                        <InfoLine
                          icon={<User size={14} />}
                          label="Contact"
                          value={client.contact}
                        />
                      )}
                      <InfoLine
                        icon={<Calendar size={14} />}
                        label="Client depuis"
                        value={formatDate(client.createdAt)}
                      />
                    </ul>
                  </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader
                    title="Chantiers"
                    subtitle={`${data.mesChantiers.length} chantier(s)`}
                  />
                  <CardBody className="p-0">
                    {data.mesChantiers.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucun chantier pour ce client.
                      </div>
                    ) : (
                      <ul>
                        {data.mesChantiers.map((c, i, arr) => {
                          const statut = STATUTS_CHANTIER[c.statut];
                          return (
                            <li
                              key={c.id}
                              style={{
                                borderBottom:
                                  i < arr.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                              }}
                            >
                              <Link
                                href={`/chantiers/${c.id}`}
                                className="block px-6 py-4 transition-colors"
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    C.smoke)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className="font-semibold text-[13.5px]"
                                        style={{ color: C.ink }}
                                      >
                                        {c.nom}
                                      </span>
                                      <Badge
                                        bg={statut.bg}
                                        color={statut.color}
                                      >
                                        {statut.label}
                                      </Badge>
                                    </div>
                                    <div
                                      className="mt-0.5 text-[12px]"
                                      style={{ color: C.slate }}
                                    >
                                      📍 {c.lieu} · {formatFCFA(c.budget)}
                                    </div>
                                  </div>
                                  <div className="w-32 shrink-0">
                                    <div className="flex justify-between text-[11.5px] mb-1">
                                      <span style={{ color: C.slate }}>
                                        Avanc.
                                      </span>
                                      <span
                                        className="font-semibold"
                                        style={{ color: C.ink }}
                                      >
                                        {c.avancement}%
                                      </span>
                                    </div>
                                    <ProgressBar value={c.avancement} />
                                  </div>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Factures */}
              <div className="mt-6">
                <Card>
                  <CardHeader
                    title="Factures"
                    subtitle={`${data.mesFactures.length} facture(s)`}
                  />
                  <CardBody className="p-0">
                    {data.mesFactures.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucune facture émise pour ce client.
                      </div>
                    ) : (
                      <ul>
                        {data.mesFactures.map((f, i, arr) => {
                          const s = STATUTS_FACTURE[f.statut];
                          return (
                            <li
                              key={f.id}
                              className="flex items-center justify-between gap-4 px-6 py-4"
                              style={{
                                borderBottom:
                                  i < arr.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                              }}
                            >
                              <div className="min-w-0">
                                <div
                                  className="font-semibold text-[13.5px]"
                                  style={{ color: C.ink }}
                                >
                                  {f.numero}
                                </div>
                                <div
                                  className="text-[12px]"
                                  style={{ color: C.slate }}
                                >
                                  Émise le {formatDate(f.date)} · Échéance{" "}
                                  {formatDate(f.dateEcheance)}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div
                                  className="font-semibold text-[13.5px]"
                                  style={{ color: C.ink }}
                                >
                                  {formatFCFA(f.montantTTC)}
                                </div>
                                <div className="mt-1">
                                  <Badge bg={s.bg} color={s.color}>
                                    {s.label}
                                  </Badge>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardBody>
                </Card>
              </div>
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
            className="mt-2 text-[20px] font-bold truncate"
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

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="grid place-items-center h-8 w-8 shrink-0 rounded-lg"
        style={{ backgroundColor: C.smoke, color: C.deep }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <div
          className="text-[11.5px] uppercase font-semibold"
          style={{ color: C.light, letterSpacing: "0.05em" }}
        >
          {label}
        </div>
        <div
          className="mt-0.5 text-[13.5px] break-words"
          style={{ color: C.ink }}
        >
          {value}
        </div>
      </div>
    </li>
  );
}
