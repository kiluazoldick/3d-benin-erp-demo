// src/app/rapports/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  HardHat,
  Clock,
  Printer,
  Calendar,
  ArrowRight,
  Target,
  Scale,
  Award,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { formatFCFA, formatDate } from "@/lib/format";
import { STATUTS_CHANTIER, STATUTS_FACTURE } from "@/lib/constants";
import { C } from "@/lib/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Onglet = "vue" | "chantiers" | "equipes" | "finance";

const TABS: { value: Onglet; label: string }[] = [
  { value: "vue", label: "Vue d'ensemble" },
  { value: "chantiers", label: "Chantiers" },
  { value: "equipes", label: "Équipes & Rendement" },
  { value: "finance", label: "Finance & Trésorerie" },
];

export default function RapportsPage() {
  const {
    ready,
    chantiers,
    clients,
    factures,
    employes,
    pointages,
    materiaux,
    fournisseurs,
    engagements,
  } = useData();

  const [onglet, setOnglet] = useState<Onglet>("vue");

  // ---------- CALCULS GLOBAUX ----------
  const calculs = useMemo(() => {
    // CA
    const caFacture = factures.reduce((s, f) => s + f.montantTTC, 0);
    const caEncaisse = factures.reduce((s, f) => s + f.montantPaye, 0);
    const resteAEncaisser = caFacture - caEncaisse;

    // Dépenses
    const coutMO = pointages.reduce((s, p) => {
      const emp = employes.find((e) => e.id === p.employeId);
      return s + (emp ? (emp.tauxJournalier / 8) * p.heures : 0);
    }, 0);
    const coutMateriaux = materiaux.reduce(
      (s, m) => s + m.stock * m.prixUnitaire,
      0,
    );
    const totalDepenses = chantiers.reduce((s, c) => s + c.depense, 0);

    // Marge brute estimée
    const marge = caEncaisse - totalDepenses;
    const tauxMarge = caEncaisse > 0 ? (marge / caEncaisse) * 100 : 0;

    // Trésorerie
    const creances = engagements
      .filter((e) => e.type === "client" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);
    const dettes = engagements
      .filter((e) => e.type === "fournisseur" && e.statut !== "regle")
      .reduce((s, e) => s + (e.montant - e.montantRegle), 0);

    return {
      caFacture,
      caEncaisse,
      resteAEncaisser,
      coutMO,
      coutMateriaux,
      totalDepenses,
      marge,
      tauxMarge,
      creances,
      dettes,
      balance: creances - dettes,
    };
  }, [factures, pointages, employes, materiaux, chantiers, engagements]);

  // ---------- GRAPHIQUE CA MENSUEL ----------
  const chartCA = useMemo(() => {
    const months = ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"];
    const base = Math.max(1, calculs.caFacture / 6);
    return months.map((m, i) => ({
      mois: m,
      facture: Math.round(base * (0.7 + Math.sin(i) * 0.3 + i * 0.1)),
      encaisse: Math.round(base * (0.5 + Math.cos(i) * 0.3 + i * 0.08)),
    }));
  }, [calculs.caFacture]);

  // ---------- GRAPHIQUE DÉPENSES PAR POSTE ----------
  const chartDepenses = useMemo(() => {
    return [
      {
        name: "Main-d'œuvre",
        value: Math.round(calculs.coutMO),
        color: C.deep,
      },
      {
        name: "Matériaux consommés",
        value: Math.round(calculs.totalDepenses - calculs.coutMO),
        color: C.azure,
      },
    ].filter((d) => d.value > 0);
  }, [calculs.coutMO, calculs.totalDepenses]);

  // ---------- PERFORMANCE CHANTIERS ----------
  const perfChantiers = useMemo(() => {
    return chantiers
      .map((c) => {
        const client = clients.find((x) => x.id === c.clientId);
        const pctBudget = Math.round((c.depense / Math.max(1, c.budget)) * 100);
        const ecart = c.avancement - pctBudget;
        return {
          ...c,
          clientNom: client?.nom ?? "—",
          pctBudget,
          ecart,
        };
      })
      .sort((a, b) => b.budget - a.budget);
  }, [chantiers, clients]);

  // ---------- RENDEMENT ÉQUIPES ----------
  const perfEquipes = useMemo(() => {
    const map = new Map<
      string,
      {
        employeId: string;
        nom: string;
        role: string;
        heures: number;
        jours: number;
        coutTotal: number;
        chantierPrincipal: string;
      }
    >();

    pointages.forEach((p) => {
      const emp = employes.find((e) => e.id === p.employeId);
      if (!emp) return;
      const existing = map.get(emp.id) ?? {
        employeId: emp.id,
        nom: `${emp.prenom} ${emp.nom}`,
        role: emp.role,
        heures: 0,
        jours: 0,
        coutTotal: 0,
        chantierPrincipal: "",
      };
      existing.heures += p.heures;
      existing.jours += 1;
      existing.coutTotal += (emp.tauxJournalier / 8) * p.heures;
      if (!existing.chantierPrincipal && p.chantierId) {
        const ch = chantiers.find((c) => c.id === p.chantierId);
        existing.chantierPrincipal = ch?.nom ?? "";
      }
      map.set(emp.id, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.coutTotal - a.coutTotal);
  }, [pointages, employes, chantiers]);

  // ---------- TOP CLIENTS ----------
  const topClients = useMemo(() => {
    const map = new Map<
      string,
      { nom: string; ca: number; nbFactures: number }
    >();
    factures.forEach((f) => {
      const client = clients.find((c) => c.id === f.clientId);
      if (!client) return;
      const existing = map.get(client.id) ?? {
        nom: client.nom,
        ca: 0,
        nbFactures: 0,
      };
      existing.ca += f.montantTTC;
      existing.nbFactures += 1;
      map.set(client.id, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.ca - a.ca);
  }, [factures, clients]);

  // ---------- TOP FOURNISSEURS ----------
  const topFournisseurs = useMemo(() => {
    const map = new Map<string, { nom: string; total: number; nb: number }>();
    engagements
      .filter((e) => e.type === "fournisseur")
      .forEach((e) => {
        const f = fournisseurs.find((x) => x.id === e.tiersId);
        if (!f) return;
        const existing = map.get(f.id) ?? {
          nom: f.nom,
          total: 0,
          nb: 0,
        };
        existing.total += e.montant;
        existing.nb += 1;
        map.set(f.id, existing);
      });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [engagements, fournisseurs]);

  // ---------- TRÉSORERIE MENSUELLE ----------
  const chartTresorerie = useMemo(() => {
    const months = ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"];
    const base = Math.max(1, calculs.caEncaisse / 6);
    return months.map((m, i) => ({
      mois: m,
      entrees: Math.round(base * (0.7 + Math.sin(i) * 0.25 + i * 0.08)),
      sorties: Math.round(base * (0.5 + Math.cos(i) * 0.2 + i * 0.06)),
    }));
  }, [calculs.caEncaisse]);

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
            title="Rapports & Analyses"
            subtitle="Vue consolidée de la performance de 3N BENIN"
            action={
              <Button
                variant="outline"
                icon={<Printer size={15} />}
                onClick={() => window.print()}
              >
                Imprimer
              </Button>
            }
          />

          {/* KPIs globaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="CA facturé"
              value={formatFCFA(calculs.caFacture)}
              icon={<Wallet size={20} />}
              iconBg="#DBEAFE"
              iconColor={C.deep}
              hint={`Encaissé : ${formatFCFA(calculs.caEncaisse)}`}
            />
            <StatCard
              label="Marge estimée"
              value={formatFCFA(calculs.marge)}
              icon={<TrendingUp size={20} />}
              iconBg={calculs.marge >= 0 ? "#DCFCE7" : "#FEE2E2"}
              iconColor={calculs.marge >= 0 ? C.success : C.danger}
              hint={`Taux : ${calculs.tauxMarge.toFixed(1)}%`}
            />
            <StatCard
              label="Heures MO"
              value={`${pointages.reduce((s, p) => s + p.heures, 0)} h`}
              icon={<Clock size={20} />}
              iconBg="#F1F5F9"
              iconColor={C.deep}
              hint={`Coût : ${formatFCFA(calculs.coutMO)}`}
            />
            <StatCard
              label="Balance nette"
              value={formatFCFA(calculs.balance)}
              icon={<Scale size={20} />}
              iconBg={calculs.balance >= 0 ? "#DBEAFE" : "#FEE2E2"}
              iconColor={calculs.balance >= 0 ? C.deep : C.danger}
              hint={
                calculs.balance >= 0 ? "position positive" : "position négative"
              }
            />
          </div>

          {/* Onglets */}
          <div
            className="mt-6 rounded-2xl p-2 inline-flex flex-wrap gap-1"
            style={{
              backgroundColor: C.white,
              border: `1px solid ${C.border}`,
            }}
          >
            {TABS.map((t) => {
              const active = onglet === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setOnglet(t.value)}
                  className="h-10 px-5 rounded-xl text-[13px] font-semibold transition-colors"
                  style={{
                    backgroundColor: active ? C.deep : "transparent",
                    color: active ? C.white : C.ink,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Contenu selon onglet */}
          <div className="mt-6">
            {onglet === "vue" && (
              <VueEnsemble
                chartCA={chartCA}
                chartDepenses={chartDepenses}
                calculs={calculs}
                topClients={topClients}
                topFournisseurs={topFournisseurs}
              />
            )}
            {onglet === "chantiers" && (
              <VueChantiers perfChantiers={perfChantiers} />
            )}
            {onglet === "equipes" && (
              <VueEquipes perfEquipes={perfEquipes} employes={employes} />
            )}
            {onglet === "finance" && (
              <VueFinance
                chartTresorerie={chartTresorerie}
                calculs={calculs}
                factures={factures}
                clients={clients}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 1 : VUE D'ENSEMBLE
// ============================================================
function VueEnsemble({
  chartCA,
  chartDepenses,
  calculs,
  topClients,
  topFournisseurs,
}: any) {
  return (
    <div className="flex flex-col gap-6">
      {/* Graphique CA */}
      <Card>
        <CardHeader
          title="Chiffre d'affaires vs Encaissements"
          subtitle="Évolution sur les 6 derniers mois (FCFA)"
        />
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartCA}>
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
                formatter={(v) => formatFCFA(typeof v === "number" ? v : 0)}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="facture"
                name="Facturé"
                fill={C.deep}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="encaisse"
                name="Encaissé"
                fill={C.azure}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Top clients + Top fournisseurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Top clients"
            subtitle="Par chiffre d'affaires facturé"
            action={<Award size={16} style={{ color: C.warning }} />}
          />
          <CardBody className="p-0">
            {topClients.length === 0 ? (
              <div className="p-6 text-[13px]" style={{ color: C.slate }}>
                Aucune donnée.
              </div>
            ) : (
              <ul>
                {topClients.slice(0, 5).map((c: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 px-6 py-4"
                    style={{
                      borderBottom:
                        i < Math.min(topClients.length, 5) - 1
                          ? `1px solid ${C.border}`
                          : "none",
                    }}
                  >
                    <div
                      className="grid place-items-center h-9 w-9 rounded-full text-[12px] font-bold shrink-0"
                      style={{
                        backgroundColor: i === 0 ? C.warning : C.smoke,
                        color: i === 0 ? C.white : C.deep,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-[13.5px] truncate"
                        style={{ color: C.ink }}
                      >
                        {c.nom}
                      </div>
                      <div className="text-[11.5px]" style={{ color: C.slate }}>
                        {c.nbFactures} facture(s)
                      </div>
                    </div>
                    <div
                      className="font-bold text-[14px] shrink-0"
                      style={{ color: C.deep }}
                    >
                      {formatFCFA(c.ca)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Top fournisseurs"
            subtitle="Par volume d'achats engagés"
            action={<Target size={16} style={{ color: C.deep }} />}
          />
          <CardBody className="p-0">
            {topFournisseurs.length === 0 ? (
              <div className="p-6 text-[13px]" style={{ color: C.slate }}>
                Aucune donnée.
              </div>
            ) : (
              <ul>
                {topFournisseurs.slice(0, 5).map((f: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 px-6 py-4"
                    style={{
                      borderBottom:
                        i < Math.min(topFournisseurs.length, 5) - 1
                          ? `1px solid ${C.border}`
                          : "none",
                    }}
                  >
                    <div
                      className="grid place-items-center h-9 w-9 rounded-full text-[12px] font-bold shrink-0"
                      style={{
                        backgroundColor: C.smoke,
                        color: C.deep,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-[13.5px] truncate"
                        style={{ color: C.ink }}
                      >
                        {f.nom}
                      </div>
                      <div className="text-[11.5px]" style={{ color: C.slate }}>
                        {f.nb} engagement(s)
                      </div>
                    </div>
                    <div
                      className="font-bold text-[14px] shrink-0"
                      style={{ color: C.warning }}
                    >
                      {formatFCFA(f.total)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 2 : CHANTIERS
// ============================================================
function VueChantiers({ perfChantiers }: any) {
  return (
    <div className="flex flex-col gap-6">
      {/* Résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SmallStat
          label="Chantiers en cours"
          value={String(
            perfChantiers.filter((c: any) => c.statut === "en_cours").length,
          )}
          color={C.deep}
        />
        <SmallStat
          label="Budget total"
          value={formatFCFA(
            perfChantiers.reduce((s: number, c: any) => s + c.budget, 0),
          )}
          color={C.deep}
        />
        <SmallStat
          label="Dépensé total"
          value={formatFCFA(
            perfChantiers.reduce((s: number, c: any) => s + c.depense, 0),
          )}
          color={C.warning}
        />
      </div>

      {/* Tableau performance */}
      <Card>
        <CardHeader
          title="Performance par chantier"
          subtitle="Budget, dépenses, avancement et écart"
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
                  <Th>Chantier</Th>
                  <Th>Client</Th>
                  <Th align="right">Budget</Th>
                  <Th align="right">Dépensé</Th>
                  <Th>Consommation</Th>
                  <Th align="right">Avancement</Th>
                  <Th align="right">Écart</Th>
                </tr>
              </thead>
              <tbody>
                {perfChantiers.map((c: any, i: number) => {
                  const statut =
                    STATUTS_CHANTIER[c.statut as keyof typeof STATUTS_CHANTIER];
                  const ecartPos = c.ecart >= 0;
                  return (
                    <tr
                      key={c.id}
                      style={{
                        borderBottom:
                          i < perfChantiers.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <Td>
                        <div className="font-semibold" style={{ color: C.ink }}>
                          {c.nom}
                        </div>
                        <div className="mt-1">
                          <Badge bg={statut.bg} color={statut.color}>
                            {statut.label}
                          </Badge>
                        </div>
                      </Td>
                      <Td>
                        <span style={{ color: C.slate }}>{c.clientNom}</span>
                      </Td>
                      <Td align="right">
                        <span
                          className="font-semibold"
                          style={{ color: C.ink }}
                        >
                          {formatFCFA(c.budget)}
                        </span>
                      </Td>
                      <Td align="right">
                        <span style={{ color: C.ink }}>
                          {formatFCFA(c.depense)}
                        </span>
                      </Td>
                      <Td>
                        <div className="w-32">
                          <ProgressBar value={c.pctBudget} />
                          <div
                            className="mt-1 text-[11.5px]"
                            style={{ color: C.slate }}
                          >
                            {c.pctBudget}%
                          </div>
                        </div>
                      </Td>
                      <Td align="right">
                        <span
                          className="font-semibold"
                          style={{ color: C.deep }}
                        >
                          {c.avancement}%
                        </span>
                      </Td>
                      <Td align="right">
                        <span
                          className="font-bold"
                          style={{
                            color: ecartPos ? C.success : C.danger,
                          }}
                        >
                          {ecartPos ? "+" : ""}
                          {c.ecart}%
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div
        className="rounded-2xl p-5 text-[12.5px]"
        style={{
          backgroundColor: "#EFF6FF",
          border: `1px solid #BFDBFE`,
          color: C.deep,
        }}
      >
        <strong>Lecture de l'écart :</strong> un écart positif (vert) signifie
        que l'avancement est en avance sur la consommation du budget. Un écart
        négatif (rouge) signifie que le chantier consomme plus vite que son
        avancement — attention au dépassement.
      </div>
    </div>
  );
}

// ============================================================
// ONGLET 3 : ÉQUIPES
// ============================================================
function VueEquipes({ perfEquipes, employes }: any) {
  const totalHeures = perfEquipes.reduce(
    (s: number, e: any) => s + e.heures,
    0,
  );
  const totalCout = perfEquipes.reduce(
    (s: number, e: any) => s + e.coutTotal,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SmallStat
          label="Employés actifs"
          value={String(employes.filter((e: any) => e.actif).length)}
          color={C.deep}
        />
        <SmallStat
          label="Heures cumulées"
          value={`${totalHeures} h`}
          color={C.deep}
        />
        <SmallStat
          label="Coût MO total"
          value={formatFCFA(totalCout)}
          color={C.warning}
        />
      </div>

      <Card>
        <CardHeader
          title="Rendement par employé"
          subtitle="Classé par coût main-d'œuvre généré"
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
                  <Th>Employé</Th>
                  <Th>Rôle</Th>
                  <Th>Chantier</Th>
                  <Th align="right">Jours</Th>
                  <Th align="right">Heures</Th>
                  <Th align="right">Coût</Th>
                </tr>
              </thead>
              <tbody>
                {perfEquipes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-[13px]"
                      style={{ color: C.slate }}
                    >
                      Aucun pointage enregistré.
                    </td>
                  </tr>
                ) : (
                  perfEquipes.map((e: any, i: number) => (
                    <tr
                      key={e.employeId}
                      style={{
                        borderBottom:
                          i < perfEquipes.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <Td>
                        <Link
                          href={`/personnel/${e.employeId}`}
                          className="font-semibold hover:underline"
                          style={{ color: C.ink }}
                        >
                          {e.nom}
                        </Link>
                      </Td>
                      <Td>
                        <Badge bg="#DBEAFE" color={C.deep}>
                          {e.role.replace("_", " ")}
                        </Badge>
                      </Td>
                      <Td>
                        <span
                          className="text-[12.5px]"
                          style={{ color: C.slate }}
                        >
                          {e.chantierPrincipal || "—"}
                        </span>
                      </Td>
                      <Td align="right">{e.jours}</Td>
                      <Td align="right">
                        <span
                          className="font-semibold"
                          style={{ color: C.deep }}
                        >
                          {e.heures} h
                        </span>
                      </Td>
                      <Td align="right">
                        <span
                          className="font-semibold"
                          style={{ color: C.warning }}
                        >
                          {formatFCFA(e.coutTotal)}
                        </span>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ============================================================
// ONGLET 4 : FINANCE
// ============================================================
function VueFinance({ chartTresorerie, calculs, factures, clients }: any) {
  return (
    <div className="flex flex-col gap-6">
      {/* Trésorerie */}
      <Card>
        <CardHeader
          title="Trésorerie prévisionnelle"
          subtitle="Entrées vs sorties estimées (FCFA)"
        />
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartTresorerie}>
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
                formatter={(v) =>
                  formatFCFA(typeof v === "number" ? v : 0)
                }
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="entrees"
                name="Entrées"
                stroke={C.success}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sorties"
                name="Sorties"
                stroke={C.danger}
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Détail trésorerie */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <SmallStat
          label="Créances clients"
          value={formatFCFA(calculs.creances)}
          color={C.success}
          hint="à encaisser"
        />
        <SmallStat
          label="Dettes fournisseurs"
          value={formatFCFA(calculs.dettes)}
          color={C.danger}
          hint="à payer"
        />
        <SmallStat
          label="Balance nette"
          value={formatFCFA(calculs.balance)}
          color={calculs.balance >= 0 ? C.deep : C.danger}
          hint={calculs.balance >= 0 ? "positive" : "négative"}
        />
      </div>

      {/* Factures en attente */}
      <Card>
        <CardHeader
          title="Factures en attente de règlement"
          subtitle={`${factures.filter((f: any) => f.statut !== "payee").length} facture(s)`}
        />
        <CardBody className="p-0">
          {factures.filter((f: any) => f.statut !== "payee").length === 0 ? (
            <div
              className="p-6 text-center text-[13px]"
              style={{ color: C.slate }}
            >
              Toutes les factures sont soldées ✓
            </div>
          ) : (
            <ul>
              {factures
                .filter((f: any) => f.statut !== "payee")
                .sort(
                  (a: any, b: any) =>
                    new Date(a.dateEcheance).getTime() -
                    new Date(b.dateEcheance).getTime(),
                )
                .map((f: any, i: number, arr: any[]) => {
                  const client = clients.find((c: any) => c.id === f.clientId);
                  const s =
                    STATUTS_FACTURE[f.statut as keyof typeof STATUTS_FACTURE];
                  const reste = f.montantTTC - f.montantPaye;
                  const enRetard =
                    new Date(f.dateEcheance).getTime() < Date.now();
                  return (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                      style={{
                        borderBottom:
                          i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                        backgroundColor: enRetard ? "#FEF2F2" : "transparent",
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/factures/${f.id}`}
                            className="font-semibold text-[13.5px] hover:underline"
                            style={{ color: C.ink }}
                          >
                            {f.numero}
                          </Link>
                          <Badge bg={s.bg} color={s.color}>
                            {s.label}
                          </Badge>
                          {enRetard && (
                            <span
                              className="px-2 py-0.5 rounded text-[10.5px] font-bold"
                              style={{
                                backgroundColor: "#FEE2E2",
                                color: C.danger,
                              }}
                            >
                              EN RETARD
                            </span>
                          )}
                        </div>
                        <div
                          className="mt-0.5 text-[12px]"
                          style={{ color: C.slate }}
                        >
                          {client?.nom ?? "—"} · Échéance{" "}
                          {formatDate(f.dateEcheance)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className="font-bold text-[14px]"
                          style={{ color: C.danger }}
                        >
                          {formatFCFA(reste)}
                        </div>
                        <div
                          className="text-[11.5px]"
                          style={{ color: C.slate }}
                        >
                          sur {formatFCFA(f.montantTTC)}
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
  );
}

// ============================================================
// COMPOSANTS UTILITAIRES
// ============================================================
function SmallStat({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: string;
  color: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        className="text-[12px] font-medium uppercase"
        style={{ color: C.slate, letterSpacing: "0.02em" }}
      >
        {label}
      </div>
      <div className="mt-2 text-[20px] font-bold truncate" style={{ color }}>
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11.5px]" style={{ color: C.slate }}>
          {hint}
        </div>
      )}
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
      className="px-6 py-3.5 text-[11px] font-semibold uppercase"
      style={{
        color: C.slate,
        letterSpacing: "0.05em",
        textAlign: align,
        whiteSpace: "nowrap",
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
    <td className="px-6 py-4" style={{ textAlign: align }}>
      {children}
    </td>
  );
}
