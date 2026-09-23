// src/app/dashboard/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  HardHat,
  Users,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Clock,
  Package,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate, joursRestants } from "@/lib/format";
import { STATUTS_CHANTIER, STATUTS_FACTURE } from "@/lib/constants";
import { C, SHADOW } from "@/lib/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const {
    ready,
    chantiers,
    clients,
    factures,
    employes,
    materiaux,
    engagements,
  } = useData();

  const [hoverRow, setHoverRow] = useState<string | null>(null);

  // ---------- STATS ----------
  const stats = useMemo(() => {
    const chantiersActifs = chantiers.filter(
      (c) => c.statut === "en_cours",
    ).length;
    const caEncaissé = factures.reduce((s, f) => s + f.montantPaye, 0);
    const caFacturé = factures.reduce((s, f) => s + f.montantTTC, 0);
    const creances = engagements
      .filter((e) => e.type === "client" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    const dettes = engagements
      .filter((e) => e.type === "fournisseur" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    const facturesImpayees = factures.filter(
      (f) => f.statut === "impayee",
    ).length;

    return {
      chantiersActifs,
      caEncaissé,
      caFacturé,
      creances,
      dettes,
      facturesImpayees,
      totalClients: clients.length,
      totalEmployes: employes.filter((e) => e.actif).length,
    };
  }, [chantiers, clients, factures, employes, engagements]);

  // ---------- ALERTES ----------
  const alerts = useMemo(() => {
    const list: {
      type: "danger" | "warning";
      message: string;
      href: string;
    }[] = [];
    factures
      .filter((f) => f.statut !== "payee" && joursRestants(f.dateEcheance) < 0)
      .forEach((f) => {
        list.push({
          type: "danger",
          message: `Facture ${f.numero} en retard de ${Math.abs(
            joursRestants(f.dateEcheance),
          )} jour(s)`,
          href: `/factures/${f.id}`,
        });
      });
    materiaux
      .filter((m) => m.stock <= m.seuilAlerte)
      .forEach((m) => {
        list.push({
          type: "warning",
          message: `Stock bas : ${m.nom} (${m.stock} ${m.unite})`,
          href: `/materiaux`,
        });
      });
    return list.slice(0, 5);
  }, [factures, materiaux]);

  // ---------- GRAPHIQUE ----------
  const chartData = useMemo(() => {
    const months = ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"];
    const base = Math.max(1, stats.caEncaissé / 6);
    return months.map((m, i) => ({
      mois: m,
      ca: Math.round(base * (0.6 + Math.sin(i) * 0.3 + i * 0.12)),
    }));
  }, [stats.caEncaissé]);

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
            title="Tableau de bord"
            subtitle="Vue d'ensemble de votre activité — 3N BENIN"
            action={
              <Link href="/chantiers/nouveau">
                <Button icon={<HardHat size={16} />}>Nouveau chantier</Button>
              </Link>
            }
          />

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Chantiers actifs"
              value={String(stats.chantiersActifs)}
              icon={<HardHat size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
              hint={`sur ${chantiers.length} au total`}
            />
            <StatCard
              label="CA encaissé"
              value={formatFCFA(stats.caEncaissé)}
              icon={<Wallet size={20} />}
              iconBg="#DCFCE7"
              iconColor={C.success}
              trend={{ value: "+12,4%", positive: true }}
              hint="vs mois dernier"
            />
            <StatCard
              label="Créances clients"
              value={formatFCFA(stats.creances)}
              icon={<TrendingUp size={20} />}
              iconBg="#FEF3C7"
              iconColor={C.warning}
              hint={`${stats.facturesImpayees} facture(s) impayée(s)`}
            />
            <StatCard
              label="Dettes fournisseurs"
              value={formatFCFA(stats.dettes)}
              icon={<AlertTriangle size={20} />}
              iconBg="#FEE2E2"
              iconColor={C.danger}
              hint="à honorer"
            />
          </div>

          {/* Graphique + Alertes */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader
                  title="Chiffre d'affaires"
                  subtitle="Encaissements sur les 6 derniers mois"
                />
                <CardBody>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={C.border}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="mois"
                        tick={{ fontSize: 12, fill: C.slate }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: C.slate }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                      />
                      <Tooltip
                        formatter={(v: number) => formatFCFA(v)}
                        contentStyle={{
                          borderRadius: 12,
                          border: `1px solid ${C.border}`,
                          fontSize: 12,
                        }}
                      />
                      <Bar
                        dataKey="ca"
                        fill={C.deep}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader
                title="Alertes"
                subtitle={`${alerts.length} élément(s) à traiter`}
              />
              <CardBody className="p-0">
                {alerts.length === 0 ? (
                  <div
                    className="p-6 text-center text-[13px]"
                    style={{ color: C.slate }}
                  >
                    Aucune alerte. Tout est sous contrôle ✓
                  </div>
                ) : (
                  <ul>
                    {alerts.map((a, i) => (
                      <li
                        key={i}
                        style={{
                          borderBottom:
                            i < alerts.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                        }}
                      >
                        <Link
                          href={a.href}
                          className="flex items-start gap-3 px-6 py-4 transition-colors"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = C.smoke)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <span
                            className="grid place-items-center h-7 w-7 shrink-0 rounded-lg mt-0.5"
                            style={{
                              backgroundColor:
                                a.type === "danger" ? "#FEE2E2" : "#FEF3C7",
                              color: a.type === "danger" ? C.danger : C.warning,
                            }}
                          >
                            <AlertTriangle size={13} />
                          </span>
                          <span
                            className="text-[13px] leading-snug flex-1"
                            style={{ color: C.ink }}
                          >
                            {a.message}
                          </span>
                          <ArrowRight
                            size={14}
                            style={{ color: C.light, marginTop: 4 }}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Chantiers en cours */}
          <div className="mt-6">
            <Card>
              <CardHeader
                title="Chantiers en cours"
                subtitle={`${stats.chantiersActifs} chantier(s) actif(s)`}
                action={
                  <Link
                    href="/chantiers"
                    className="text-[13px] font-semibold inline-flex items-center gap-1"
                    style={{ color: C.deep }}
                  >
                    Voir tout <ArrowRight size={14} />
                  </Link>
                }
              />
              <CardBody className="p-0">
                <div>
                  {chantiers
                    .filter((c) => c.statut === "en_cours")
                    .slice(0, 4)
                    .map((c, idx, arr) => {
                      const client = clients.find((x) => x.id === c.clientId);
                      const chef = employes.find(
                        (e) => e.id === c.chefChantierId,
                      );
                      const statut = STATUTS_CHANTIER[c.statut];
                      return (
                        <Link
                          key={c.id}
                          href={`/chantiers/${c.id}`}
                          className="block px-6 py-5 transition-colors"
                          style={{
                            borderBottom:
                              idx < arr.length - 1
                                ? `1px solid ${C.border}`
                                : "none",
                            backgroundColor:
                              hoverRow === c.id ? C.smoke : "transparent",
                          }}
                          onMouseEnter={() => setHoverRow(c.id)}
                          onMouseLeave={() => setHoverRow(null)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className="font-semibold text-[14.5px]"
                                  style={{ color: C.ink }}
                                >
                                  {c.nom}
                                </h4>
                                <Badge bg={statut.bg} color={statut.color}>
                                  {statut.label}
                                </Badge>
                              </div>
                              <div
                                className="mt-1 text-[12.5px] flex flex-wrap gap-x-4 gap-y-1"
                                style={{ color: C.slate }}
                              >
                                <span>👤 {client?.nom ?? "—"}</span>
                                <span>📍 {c.lieu}</span>
                                {chef && (
                                  <span>
                                    👷 {chef.prenom} {chef.nom}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="sm:w-64 shrink-0">
                              <div className="flex items-center justify-between text-[12px] mb-1.5">
                                <span style={{ color: C.slate }}>
                                  Avancement
                                </span>
                                <span
                                  className="font-semibold"
                                  style={{ color: C.ink }}
                                >
                                  {c.avancement}%
                                </span>
                              </div>
                              <ProgressBar value={c.avancement} />
                              <div
                                className="mt-2 flex items-center justify-between text-[11.5px]"
                                style={{ color: C.slate }}
                              >
                                <span>{formatFCFA(c.depense)}</span>
                                <span>sur {formatFCFA(c.budget)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Dernières factures + Stocks bas */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader
                title="Dernières factures"
                action={
                  <Link
                    href="/factures"
                    className="text-[13px] font-semibold inline-flex items-center gap-1"
                    style={{ color: C.deep }}
                  >
                    Voir tout <ArrowRight size={14} />
                  </Link>
                }
              />
              <CardBody className="p-0">
                <ul>
                  {[...factures]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .slice(0, 5)
                    .map((f, i, arr) => {
                      const client = clients.find((c) => c.id === f.clientId);
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
                              className="text-[12px] truncate"
                              style={{ color: C.slate }}
                            >
                              {client?.nom ?? "—"} · {formatDate(f.date)}
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
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Stocks à surveiller"
                subtitle="Matériaux sous le seuil d'alerte"
                action={
                  <Link
                    href="/materiaux"
                    className="text-[13px] font-semibold inline-flex items-center gap-1"
                    style={{ color: C.deep }}
                  >
                    Voir tout <ArrowRight size={14} />
                  </Link>
                }
              />
              <CardBody className="p-0">
                {materiaux.filter((m) => m.stock <= m.seuilAlerte).length ===
                0 ? (
                  <div
                    className="p-6 text-center text-[13px]"
                    style={{ color: C.slate }}
                  >
                    Tous les stocks sont au-dessus du seuil ✓
                  </div>
                ) : (
                  <ul>
                    {materiaux
                      .filter((m) => m.stock <= m.seuilAlerte)
                      .slice(0, 5)
                      .map((m, i, arr) => (
                        <li
                          key={m.id}
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
                                backgroundColor: "#FEF3C7",
                                color: C.warning,
                              }}
                            >
                              <Package size={15} />
                            </span>
                            <div className="min-w-0">
                              <div
                                className="font-semibold text-[13.5px] truncate"
                                style={{ color: C.ink }}
                              >
                                {m.nom}
                              </div>
                              <div
                                className="text-[12px]"
                                style={{ color: C.slate }}
                              >
                                Seuil : {m.seuilAlerte} {m.unite}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div
                              className="font-bold text-[15px]"
                              style={{ color: C.warning }}
                            >
                              {m.stock}
                            </div>
                            <div
                              className="text-[11px]"
                              style={{ color: C.slate }}
                            >
                              {m.unite}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Bas de page */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Clients"
              value={String(stats.totalClients)}
              icon={<Users size={18} />}
              iconBg={C.smoke}
              iconColor={C.deep}
            />
            <StatCard
              label="Employés actifs"
              value={String(stats.totalEmployes)}
              icon={<Clock size={18} />}
              iconBg={C.smoke}
              iconColor={C.deep}
            />
            <StatCard
              label="CA facturé"
              value={formatFCFA(stats.caFacturé)}
              icon={<Wallet size={18} />}
              iconBg={C.smoke}
              iconColor={C.deep}
            />
            <StatCard
              label="Fournisseurs"
              value={String(engagements.length)}
              icon={<Package size={18} />}
              iconBg={C.smoke}
              iconColor={C.deep}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
