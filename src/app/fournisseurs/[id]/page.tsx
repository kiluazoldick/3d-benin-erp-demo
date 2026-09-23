// src/app/fournisseurs/[id]/page.tsx
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
  Package,
  Wallet,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import FournisseurForm from "@/components/fournisseurs/FournisseurForm";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate, joursRestants } from "@/lib/format";
import { C } from "@/lib/theme";

export default function FournisseurDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const { ready, fournisseurs, materiaux, engagements } = useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");

  const fournisseur = fournisseurs.find((f) => f.id === id);

  const data = useMemo(() => {
    if (!fournisseur) return null;

    const mesMateriaux = materiaux.filter(
      (m) => m.fournisseurId === fournisseur.id,
    );

    const mesEngagements = [...engagements]
      .filter((e) => e.type === "fournisseur" && e.tiersId === fournisseur.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const totalDu = mesEngagements.reduce((s, e) => s + e.montant, 0);
    const totalRegle = mesEngagements.reduce((s, e) => s + e.montantRegle, 0);
    const soldeDu = totalDu - totalRegle;
    const enCours = mesEngagements.filter((e) => e.statut !== "regle").length;

    return {
      mesMateriaux,
      mesEngagements,
      totalDu,
      totalRegle,
      soldeDu,
      enCours,
    };
  }, [fournisseur, materiaux, engagements]);

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

  if (!fournisseur || !data) {
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
                Fournisseur introuvable
              </h2>
              <Link href="/fournisseurs" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour aux fournisseurs
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
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1300 }}>
          <Link
            href="/fournisseurs"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour aux fournisseurs
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${fournisseur.nom}`}
                subtitle="Mettez à jour les informations"
              />
              <FournisseurForm initial={fournisseur} />
            </>
          ) : (
            <>
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="grid place-items-center h-14 w-14 rounded-2xl text-[17px] font-bold shrink-0"
                    style={{ backgroundColor: C.deep, color: C.white }}
                  >
                    {fournisseur.nom.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1
                      className="text-[24px] sm:text-[26px] font-bold"
                      style={{ color: C.ink, letterSpacing: "-0.01em" }}
                    >
                      {fournisseur.nom}
                    </h1>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <Badge bg="#DBEAFE" color={C.deep}>
                        {fournisseur.categorie}
                      </Badge>
                      {fournisseur.contact && (
                        <span
                          className="text-[13px]"
                          style={{ color: C.slate }}
                        >
                          {fournisseur.contact}
                        </span>
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
                  label="Matériaux fournis"
                  value={String(data.mesMateriaux.length)}
                  icon={<Package size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="Total achats"
                  value={formatFCFA(data.totalDu)}
                  icon={<TrendingUp size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="Total payé"
                  value={formatFCFA(data.totalRegle)}
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

              {/* Coordonnées + Engagements */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card>
                  <CardHeader title="Coordonnées" />
                  <CardBody>
                    <ul className="flex flex-col gap-4">
                      {fournisseur.telephone && (
                        <InfoLine
                          icon={<Phone size={14} />}
                          label="Téléphone"
                          value={fournisseur.telephone}
                        />
                      )}
                      {fournisseur.email && (
                        <InfoLine
                          icon={<Mail size={14} />}
                          label="E-mail"
                          value={fournisseur.email}
                        />
                      )}
                      {fournisseur.adresse && (
                        <InfoLine
                          icon={<MapPin size={14} />}
                          label="Adresse"
                          value={fournisseur.adresse}
                        />
                      )}
                      {fournisseur.contact && (
                        <InfoLine
                          icon={<User size={14} />}
                          label="Contact"
                          value={fournisseur.contact}
                        />
                      )}
                      <InfoLine
                        icon={<Calendar size={14} />}
                        label="Partenaire depuis"
                        value={formatDate(fournisseur.createdAt)}
                      />
                    </ul>
                  </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader
                    title="Engagements en cours"
                    subtitle={`${data.enCours} engagement(s) actif(s)`}
                  />
                  <CardBody className="p-0">
                    {data.mesEngagements.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucun engagement enregistré avec ce fournisseur.
                      </div>
                    ) : (
                      <ul>
                        {data.mesEngagements.map((e, i, arr) => {
                          const reste = e.montant - e.montantRegle;
                          const jours = joursRestants(e.dateEcheance);
                          const enRetard = e.statut !== "regle" && jours < 0;

                          return (
                            <li
                              key={e.id}
                              className="px-6 py-4 flex items-center justify-between gap-4"
                              style={{
                                borderBottom:
                                  i < arr.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                                backgroundColor: enRetard
                                  ? "#FEF2F2"
                                  : "transparent",
                              }}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className="font-semibold text-[13.5px]"
                                    style={{ color: C.ink }}
                                  >
                                    {e.description}
                                  </span>
                                  {enRetard && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold"
                                      style={{
                                        backgroundColor: "#FEE2E2",
                                        color: C.danger,
                                      }}
                                    >
                                      <AlertTriangle size={9} /> RETARD
                                    </span>
                                  )}
                                </div>
                                <div
                                  className="mt-0.5 text-[12px]"
                                  style={{ color: C.slate }}
                                >
                                  Échéance {formatDate(e.dateEcheance)} ·{" "}
                                  {e.statut === "regle"
                                    ? "Réglé"
                                    : e.statut === "partiel"
                                      ? "Partiel"
                                      : "Ouvert"}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div
                                  className="font-semibold text-[13.5px]"
                                  style={{ color: C.ink }}
                                >
                                  {formatFCFA(e.montant)}
                                </div>
                                {reste > 0 && (
                                  <div
                                    className="text-[11.5px] font-semibold"
                                    style={{ color: C.danger }}
                                  >
                                    Reste {formatFCFA(reste)}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </CardBody>
                </Card>
              </div>

              {/* Matériaux fournis */}
              <div className="mt-6">
                <Card>
                  <CardHeader
                    title="Matériaux fournis"
                    subtitle={`${data.mesMateriaux.length} référence(s)`}
                  />
                  <CardBody className="p-0">
                    {data.mesMateriaux.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucun matériau n&apos;est lié à ce fournisseur.
                      </div>
                    ) : (
                      <ul>
                        {data.mesMateriaux.map((m, i, arr) => (
                          <li
                            key={m.id}
                            style={{
                              borderBottom:
                                i < arr.length - 1
                                  ? `1px solid ${C.border}`
                                  : "none",
                            }}
                          >
                            <Link
                              href={`/materiaux/${m.id}`}
                              className="flex items-center justify-between gap-4 px-6 py-4 transition-colors"
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  C.smoke)
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <div className="min-w-0">
                                <div
                                  className="font-semibold text-[13.5px]"
                                  style={{ color: C.ink }}
                                >
                                  {m.nom}
                                </div>
                                <div
                                  className="text-[12px]"
                                  style={{ color: C.slate }}
                                >
                                  Stock : {m.stock} {m.unite} · Prix :{" "}
                                  {formatFCFA(m.prixUnitaire)}
                                </div>
                              </div>
                              <div
                                className="font-semibold text-[13.5px]"
                                style={{ color: C.deep }}
                              >
                                {formatFCFA(m.stock * m.prixUnitaire)}
                              </div>
                            </Link>
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
