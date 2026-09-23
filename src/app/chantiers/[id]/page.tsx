// src/app/chantiers/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Package,
  Clock,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import ChantierForm from "@/components/chantiers/ChantierForm";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate } from "@/lib/format";
import { STATUTS_CHANTIER } from "@/lib/constants";
import { C } from "@/lib/theme";

export default function ChantierDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const { ready, chantiers, clients, employes, pointages, materiaux } =
    useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");

  const chantier = chantiers.find((c) => c.id === id);

  const details = useMemo(() => {
    if (!chantier) return null;

    const client = clients.find((c) => c.id === chantier.clientId);
    const chef = employes.find((e) => e.id === chantier.chefChantierId);

    const equipe = employes.filter((e) => e.chantierId === chantier.id);

    const pts = pointages.filter((p) => p.chantierId === chantier.id);
    const heures = pts.reduce((s, p) => s + p.heures, 0);
    const coutMainOeuvre = pts.reduce((s, p) => {
      const emp = employes.find((e) => e.id === p.employeId);
      return s + (emp ? emp.tauxJournalier * (p.heures / 8) : 0);
    }, 0);

    return { client, chef, equipe, heures, coutMainOeuvre };
  }, [chantier, clients, employes, pointages]);

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

  if (!chantier || !details) {
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
                Chantier introuvable
              </h2>
              <p className="mt-2 text-[13.5px]" style={{ color: C.slate }}>
                Ce chantier a peut-être été supprimé.
              </p>
              <Link href="/chantiers" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour aux chantiers
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const statut = STATUTS_CHANTIER[chantier.statut];
  const pctDepense = Math.round(
    (chantier.depense / Math.max(1, chantier.budget)) * 100,
  );
  const reste = chantier.budget - chantier.depense;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1400 }}>
          <Link
            href="/chantiers"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux chantiers
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${chantier.nom}`}
                subtitle="Mettez à jour les informations du chantier"
              />
              <ChantierForm initial={chantier} />
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1
                      className="text-[26px] sm:text-[28px] font-bold"
                      style={{ color: C.ink, letterSpacing: "-0.01em" }}
                    >
                      {chantier.nom}
                    </h1>
                    <Badge bg={statut.bg} color={statut.color}>
                      {statut.label}
                    </Badge>
                  </div>
                  <div
                    className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px]"
                    style={{ color: C.slate }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} /> {chantier.lieu}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={13} /> {formatDate(chantier.dateDebut)} →{" "}
                      {chantier.dateFinPrevue
                        ? formatDate(chantier.dateFinPrevue)
                        : "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} /> {details.client?.nom ?? "—"}
                    </span>
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

              {/* KPIs du chantier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatMini
                  label="Budget"
                  value={formatFCFA(chantier.budget)}
                  icon={<Wallet size={18} />}
                  color={C.deep}
                />
                <StatMini
                  label="Dépensé"
                  value={formatFCFA(chantier.depense)}
                  hint={`${pctDepense}% du budget`}
                  icon={<TrendingUp size={18} />}
                  color={C.warning}
                />
                <StatMini
                  label="Reste à engager"
                  value={formatFCFA(reste)}
                  icon={<Wallet size={18} />}
                  color={reste >= 0 ? C.success : C.danger}
                />
                <StatMini
                  label="Heures travaillées"
                  value={`${details.heures} h`}
                  hint={`${details.coutMainOeuvre.toLocaleString("fr-FR")} FCFA MO`}
                  icon={<Clock size={18} />}
                  color={C.deep}
                />
              </div>

              {/* Avancement + description */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card className="lg:col-span-2">
                  <CardHeader title="Avancement global" />
                  <CardBody>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px]" style={{ color: C.slate }}>
                        Progression
                      </span>
                      <span
                        className="font-bold text-[20px]"
                        style={{ color: C.ink }}
                      >
                        {chantier.avancement}%
                      </span>
                    </div>
                    <ProgressBar value={chantier.avancement} />
                    <div
                      className="mt-6 pt-6 text-[13.5px] leading-relaxed"
                      style={{
                        color: C.ink,
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      {chantier.description || (
                        <span style={{ color: C.slate }}>
                          Aucune description renseignée.
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader title="Chef de chantier" />
                  <CardBody>
                    {details.chef ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div
                            className="grid place-items-center h-12 w-12 rounded-full text-[14px] font-bold"
                            style={{ backgroundColor: C.deep, color: C.white }}
                          >
                            {details.chef.prenom[0]}
                            {details.chef.nom[0]}
                          </div>
                          <div>
                            <div
                              className="font-semibold text-[14px]"
                              style={{ color: C.ink }}
                            >
                              {details.chef.prenom} {details.chef.nom}
                            </div>
                            <div
                              className="text-[12.5px]"
                              style={{ color: C.slate }}
                            >
                              {details.chef.telephone}
                            </div>
                          </div>
                        </div>
                        <div
                          className="mt-4 pt-4 text-[12.5px] flex items-center justify-between"
                          style={{ borderTop: `1px solid ${C.border}` }}
                        >
                          <span style={{ color: C.slate }}>
                            Taux journalier
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: C.ink }}
                          >
                            {formatFCFA(details.chef.tauxJournalier)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[13px]" style={{ color: C.slate }}>
                        Aucun chef assigné.
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Équipe */}
              <div className="mt-6">
                <Card>
                  <CardHeader
                    title="Équipe affectée"
                    subtitle={`${details.equipe.length} personne(s)`}
                  />
                  <CardBody className="p-0">
                    {details.equipe.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucun employé affecté à ce chantier.
                      </div>
                    ) : (
                      <ul>
                        {details.equipe.map((e, i, arr) => (
                          <li
                            key={e.id}
                            className="flex items-center justify-between px-6 py-4"
                            style={{
                              borderBottom:
                                i < arr.length - 1
                                  ? `1px solid ${C.border}`
                                  : "none",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="grid place-items-center h-9 w-9 rounded-full text-[11px] font-bold"
                                style={{
                                  backgroundColor: C.smoke,
                                  color: C.deep,
                                }}
                              >
                                {e.prenom[0]}
                                {e.nom[0]}
                              </div>
                              <div>
                                <div
                                  className="font-semibold text-[13.5px]"
                                  style={{ color: C.ink }}
                                >
                                  {e.prenom} {e.nom}
                                </div>
                                <div
                                  className="text-[12px]"
                                  style={{ color: C.slate }}
                                >
                                  {e.telephone}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-[13px] font-semibold"
                                style={{ color: C.ink }}
                              >
                                {formatFCFA(e.tauxJournalier)}/jour
                              </div>
                            </div>
                          </li>
                        ))}
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

function StatMini({
  label,
  value,
  hint,
  icon,
  color,
}: {
  label: string;
  value: string;
  hint?: string;
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
          {hint && (
            <div className="mt-1 text-[11.5px]" style={{ color: C.slate }}>
              {hint}
            </div>
          )}
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
