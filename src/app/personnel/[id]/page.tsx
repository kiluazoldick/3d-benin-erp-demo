// src/app/personnel/[id]/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Phone,
  HardHat,
  Clock,
  Wallet,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import EmployeForm from "@/components/personnel/EmployeForm";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate } from "@/lib/format";
import { ROLES_EMPLOYE } from "@/lib/constants";
import { C } from "@/lib/theme";

export default function EmployeDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = String(params.id);
  const { ready, employes, chantiers, pointages } = useData();

  const [edit, setEdit] = useState(searchParams.get("edit") === "1");

  const employe = employes.find((e) => e.id === id);

  const data = useMemo(() => {
    if (!employe) return null;

    const chantierActuel = chantiers.find((c) => c.id === employe.chantierId);
    const mesPointages = [...pointages]
      .filter((p) => p.employeId === employe.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalHeures = mesPointages.reduce((s, p) => s + p.heures, 0);
    const totalJours = mesPointages.length;
    const coutTotal = totalHeures * (employe.tauxJournalier / 8);

    return { chantierActuel, mesPointages, totalHeures, totalJours, coutTotal };
  }, [employe, chantiers, pointages]);

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

  if (!employe || !data) {
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
                Employé introuvable
              </h2>
              <Link href="/personnel" className="inline-block mt-6">
                <Button variant="outline" icon={<ArrowLeft size={16} />}>
                  Retour au personnel
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const initiales = `${employe.prenom[0]}${employe.nom[0]}`;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1200 }}>
          <Link
            href="/personnel"
            className="inline-flex items-center gap-2 text-[13px] font-semibold mb-4"
            style={{ color: C.slate }}
          >
            <ArrowLeft size={14} /> Retour au personnel
          </Link>

          {edit ? (
            <>
              <PageHeader
                title={`Modifier — ${employe.prenom} ${employe.nom}`}
                subtitle="Mettez à jour les informations"
              />
              <EmployeForm initial={employe} />
            </>
          ) : (
            <>
              {/* En-tête */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="grid place-items-center h-16 w-16 rounded-2xl text-[20px] font-bold shrink-0"
                    style={{
                      backgroundColor: employe.actif ? C.deep : C.slate,
                      color: C.white,
                    }}
                  >
                    {initiales}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1
                        className="text-[24px] sm:text-[26px] font-bold"
                        style={{ color: C.ink, letterSpacing: "-0.01em" }}
                      >
                        {employe.prenom} {employe.nom}
                      </h1>
                      {!employe.actif && (
                        <Badge bg={C.slateBg} color={C.slate}>
                          Inactif
                        </Badge>
                      )}
                    </div>
                    <div
                      className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]"
                      style={{ color: C.slate }}
                    >
                      <Badge bg="#DBEAFE" color={C.deep}>
                        {ROLES_EMPLOYE[employe.role]}
                      </Badge>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={12} /> {employe.telephone}
                      </span>
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
                  label="Taux journalier"
                  value={formatFCFA(employe.tauxJournalier)}
                  icon={<Wallet size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="Jours travaillés"
                  value={String(data.totalJours)}
                  icon={<Calendar size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="Heures cumulées"
                  value={`${data.totalHeures} h`}
                  icon={<Clock size={18} />}
                  color={C.deep}
                />
                <MiniStat
                  label="Coût total généré"
                  value={formatFCFA(data.coutTotal)}
                  icon={<TrendingUp size={18} />}
                  color={C.warning}
                />
              </div>

              {/* Chantier actuel + fiche */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card>
                  <CardHeader title="Chantier actuel" />
                  <CardBody>
                    {data.chantierActuel ? (
                      <Link
                        href={`/chantiers/${data.chantierActuel.id}`}
                        className="flex items-start gap-3"
                      >
                        <span
                          className="grid place-items-center h-10 w-10 rounded-xl shrink-0"
                          style={{ backgroundColor: C.smoke, color: C.deep }}
                        >
                          <HardHat size={18} />
                        </span>
                        <div className="min-w-0">
                          <div
                            className="font-semibold text-[14px] hover:underline"
                            style={{ color: C.ink }}
                          >
                            {data.chantierActuel.nom}
                          </div>
                          <div
                            className="text-[12.5px] mt-0.5"
                            style={{ color: C.slate }}
                          >
                            📍 {data.chantierActuel.lieu}
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="text-[13px]" style={{ color: C.slate }}>
                        Aucun chantier affecté.
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader
                    title="Derniers pointages"
                    subtitle={`${data.mesPointages.length} au total`}
                  />
                  <CardBody className="p-0">
                    {data.mesPointages.length === 0 ? (
                      <div
                        className="p-6 text-[13px]"
                        style={{ color: C.slate }}
                      >
                        Aucun pointage enregistré.
                      </div>
                    ) : (
                      <ul>
                        {data.mesPointages.slice(0, 6).map((p, i, arr) => {
                          const ch = chantiers.find(
                            (c) => c.id === p.chantierId,
                          );
                          return (
                            <li
                              key={p.id}
                              className="flex items-center justify-between px-6 py-3.5"
                              style={{
                                borderBottom:
                                  i < arr.length - 1
                                    ? `1px solid ${C.border}`
                                    : "none",
                              }}
                            >
                              <div className="min-w-0">
                                <div
                                  className="text-[13px] font-semibold"
                                  style={{ color: C.ink }}
                                >
                                  {formatDate(p.date)}
                                </div>
                                <div
                                  className="text-[12px] truncate"
                                  style={{ color: C.slate }}
                                >
                                  {ch?.nom ?? "—"} · {p.description}
                                </div>
                              </div>
                              <div
                                className="text-[13px] font-bold shrink-0"
                                style={{ color: C.deep }}
                              >
                                {p.heures} h
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
