// src/app/guide/page.tsx
"use client";

import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Users,
  FileText,
  HardHat,
  Receipt,
  UserCog,
  Clock,
  Package,
  Truck,
  Wallet,
  LayoutDashboard,
  BarChart3,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Workflow,
  Target,
  TrendingUp,
  Layers,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { C } from "@/lib/theme";

// ============================================================
// ÉTAPES DU WORKFLOW MÉTIER
// ============================================================
const WORKFLOW = [
  {
    etape: 1,
    titre: "Créer un client",
    module: "Clients",
    href: "/clients",
    icon: Users,
    description:
      "Enregistrez le client (particulier, entreprise, mairie…) avec ses coordonnées. C'est la base de tout : sans client, pas de devis ni de chantier.",
    couleur: C.deep,
  },
  {
    etape: 2,
    titre: "Établir un devis",
    module: "Devis",
    href: "/devis",
    icon: FileText,
    description:
      "Créez un devis détaillé ligne par ligne (désignation, quantité, prix). Le numéro est généré automatiquement. Le client valide ou refuse.",
    couleur: C.deep,
  },
  {
    etape: 3,
    titre: "Créer le chantier",
    module: "Chantiers",
    href: "/chantiers",
    icon: HardHat,
    description:
      "Une fois le devis accepté, créez le chantier : lieu, budget, dates, chef affecté. Vous pourrez ensuite suivre son avancement et ses dépenses.",
    couleur: C.azure,
  },
  {
    etape: 4,
    titre: "Affecter l'équipe",
    module: "Personnel",
    href: "/personnel",
    icon: UserCog,
    description:
      "Assignez chaque employé à son chantier, définissez son rôle (maçon, chef, etc.) et son taux journalier.",
    couleur: C.azure,
  },
  {
    etape: 5,
    titre: "Pointer les heures",
    module: "Pointage",
    href: "/pointage",
    icon: Clock,
    description:
      "Chaque jour, saisissez les heures travaillées par employé et par chantier. C'est ce qui alimente le coût main-d'œuvre réel.",
    couleur: C.azure,
  },
  {
    etape: 6,
    titre: "Gérer les matériaux",
    module: "Matériaux",
    href: "/materiaux",
    icon: Package,
    description:
      "Suivez le stock en temps réel : entrées (livraisons) et sorties (consommation sur chantier). Le système alerte quand le stock passe sous le seuil.",
    couleur: C.warning,
  },
  {
    etape: 7,
    titre: "Émettre les factures",
    module: "Factures",
    href: "/factures",
    icon: Receipt,
    description:
      "Convertissez un devis accepté en facture en 1 clic, ou créez une facture manuellement. Enregistrez ensuite les paiements reçus (acomptes, solde).",
    couleur: C.success,
  },
  {
    etape: 8,
    titre: "Suivre les engagements",
    module: "Engagements",
    href: "/engagements",
    icon: Wallet,
    description:
      "Vue consolidée : ce que les clients vous doivent (créances) et ce que vous devez aux fournisseurs (dettes). Enregistrez les règlements en 1 clic.",
    couleur: C.danger,
  },
  {
    etape: 9,
    titre: "Piloter avec les rapports",
    module: "Rapports",
    href: "/rapports",
    icon: BarChart3,
    description:
      "Analysez votre activité : CA, marge, performance par chantier, rendement des équipes, trésorerie prévisionnelle. C'est votre cockpit de DG.",
    couleur: C.deep,
  },
];

// ============================================================
// MODULES EXPLIQUÉS
// ============================================================
const MODULES_DETAIL = [
  {
    titre: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    description:
      "Vue d'ensemble : chiffres clés, alertes, chantiers en cours, dernières factures, stocks à surveiller.",
    tags: ["Lecture seule"],
  },
  {
    titre: "Chantiers",
    href: "/chantiers",
    icon: HardHat,
    description:
      "Suivi complet de chaque projet : avancement, budget vs dépensé, chef affecté, équipe, description.",
    tags: ["Créer", "Modifier", "Suivre"],
  },
  {
    titre: "Clients",
    href: "/clients",
    icon: Users,
    description:
      "Base de données clients avec historique de leurs chantiers, factures et solde dû.",
    tags: ["Créer", "Modifier", "Fiche 360°"],
  },
  {
    titre: "Devis",
    href: "/devis",
    icon: FileText,
    description:
      "Création avec lignes dynamiques, calcul auto HT/TVA/TTC, workflow de statut, conversion en facture.",
    tags: ["Créer", "Accepter", "Convertir"],
  },
  {
    titre: "Factures",
    href: "/factures",
    icon: Receipt,
    description:
      "Émission, suivi d'échéance, enregistrement des paiements partiels, détection des retards.",
    tags: ["Émettre", "Encaisser"],
  },
  {
    titre: "Personnel",
    href: "/personnel",
    icon: UserCog,
    description:
      "Fiches employés : rôles, taux journalier, chantier affecté, historique des pointages.",
    tags: ["Recruter", "Affecter"],
  },
  {
    titre: "Pointage",
    href: "/pointage",
    icon: Clock,
    description:
      "Saisie journalière rapide : sélectionnez le chantier, cochez les employés, ajustez les heures. Totaux live.",
    tags: ["Saisir", "Historique"],
  },
  {
    titre: "Matériaux",
    href: "/materiaux",
    icon: Package,
    description:
      "Stock temps réel avec seuils d'alerte, entrées/sorties tracées par chantier, valeur du stock.",
    tags: ["Stock", "Alertes", "Mouvements"],
  },
  {
    titre: "Fournisseurs",
    href: "/fournisseurs",
    icon: Truck,
    description:
      "Fiches fournisseurs avec matériaux liés et engagements en cours.",
    tags: ["Créer", "Fiche 360°"],
  },
  {
    titre: "Engagements",
    href: "/engagements",
    icon: Wallet,
    description:
      "Créances clients + dettes fournisseurs. Balance nette, alertes de retard, encaissements/paiements.",
    tags: ["Suivre", "Régler"],
  },
  {
    titre: "Rapports",
    href: "/rapports",
    icon: BarChart3,
    description:
      "4 onglets d'analyse : Vue d'ensemble, Chantiers, Équipes, Finance. Impression possible.",
    tags: ["Analyser", "Imprimer"],
  },
];

// ============================================================
// RÔLES DANS L'ENTREPRISE
// ============================================================
const ROLES = [
  {
    nom: "DG / Direction",
    description:
      "Vue globale, pilotage à distance, validation des devis importants, suivi de la trésorerie.",
    modules: ["Tableau de bord", "Rapports", "Engagements", "Factures"],
  },
  {
    nom: "Chef de chantier",
    description:
      "Saisie quotidienne des pointages, mises à jour de l'avancement, demande de matériaux.",
    modules: ["Pointage", "Chantiers", "Matériaux"],
  },
  {
    nom: "Administratif / Comptable",
    description:
      "Émission des devis et factures, suivi des règlements, gestion des fournisseurs.",
    modules: ["Devis", "Factures", "Fournisseurs", "Engagements"],
  },
];

// ============================================================
// RACCOURCIS
// ============================================================
const RACCOURCIS = [
  { titre: "Créer un client", href: "/clients/nouveau", icon: Users },
  { titre: "Faire un devis", href: "/devis/nouveau", icon: FileText },
  { titre: "Nouveau chantier", href: "/chantiers/nouveau", icon: HardHat },
  { titre: "Saisir un pointage", href: "/pointage", icon: Clock },
  { titre: "Créer une facture", href: "/factures/nouveau", icon: Receipt },
  { titre: "Ajouter un employé", href: "/personnel/nouveau", icon: UserCog },
];

export default function GuidePage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: C.smoke }}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="p-4 sm:p-6 lg:p-8" style={{ maxWidth: 1200 }}>
          <PageHeader
            title="Guide d'utilisation"
            subtitle="Comprendre le fonctionnement du BTP-ERP en 5 minutes"
            action={
              <Link href="/dashboard">
                <Button variant="outline" icon={<ArrowRight size={15} />}>
                  Aller au tableau de bord
                </Button>
              </Link>
            }
          />

          {/* Bloc d'intro */}
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: `linear-gradient(135deg, ${C.deep} 0%, ${C.azure} 100%)`,
              color: C.white,
            }}
          >
            <div className="flex items-start gap-4">
              <span
                className="grid place-items-center h-12 w-12 rounded-xl shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <BookOpen size={22} />
              </span>
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold">
                  Bienvenue sur votre BTP-ERP
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-white/85 max-w-3xl">
                  Cet outil vous permet de{" "}
                  <strong>piloter votre entreprise de BTP à distance</strong> :
                  suivi des chantiers, gestion des clients et factures, contrôle
                  des équipes et du rendement, gestion des stocks, et vision
                  consolidée de votre trésorerie.
                  <br />
                  <br />
                  Ce guide vous montre{" "}
                  <strong>l&apos;ordre logique d&apos;utilisation</strong> des
                  modules pour que chaque information alimente automatiquement
                  les suivantes.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow métier */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-5">
              <Workflow size={20} style={{ color: C.deep }} />
              <h2
                className="text-[18px] sm:text-[20px] font-bold"
                style={{ color: C.ink }}
              >
                Le workflow métier en 9 étapes
              </h2>
            </div>

            <p
              className="text-[13.5px] mb-6 max-w-3xl"
              style={{ color: C.slate }}
            >
              Le BTP suit toujours ce cycle : un client passe commande, vous
              chiffrez un devis, il l&apos;accepte, vous créez le chantier, vous
              affectez votre équipe, vous consommez des matériaux, vous
              facturez, puis vous encaissez. Chaque étape alimente la suivante
              automatiquement.
            </p>

            {/* Timeline */}
            <div className="flex flex-col gap-3">
              {WORKFLOW.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={step.etape}
                    href={step.href}
                    className="rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 group"
                    style={{
                      backgroundColor: C.white,
                      border: `1px solid ${C.border}`,
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = step.couleur;
                      e.currentTarget.style.transform = "translateX(4px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 30px -12px rgba(10,42,107,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Numéro + Ligne verticale */}
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="grid place-items-center h-11 w-11 rounded-full font-bold text-[15px]"
                        style={{
                          backgroundColor: step.couleur,
                          color: C.white,
                        }}
                      >
                        {step.etape}
                      </div>
                      {i < WORKFLOW.length - 1 && (
                        <div
                          className="w-0.5 mt-2"
                          style={{
                            height: 24,
                            backgroundColor: C.border,
                          }}
                        />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="grid place-items-center h-8 w-8 rounded-lg shrink-0"
                          style={{
                            backgroundColor: C.smoke,
                            color: step.couleur,
                          }}
                        >
                          <Icon size={15} />
                        </span>
                        <h3
                          className="font-bold text-[15px]"
                          style={{ color: C.ink }}
                        >
                          {step.titre}
                        </h3>
                        <Badge bg={C.smoke} color={C.slate}>
                          {step.module}
                        </Badge>
                      </div>
                      <p
                        className="mt-2 text-[13px] leading-relaxed"
                        style={{ color: C.slate }}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Flèche */}
                    <ArrowRight
                      size={16}
                      className="shrink-0 self-center"
                      style={{ color: C.light }}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Raccourcis rapides */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <Lightbulb size={20} style={{ color: C.warning }} />
              <h2
                className="text-[18px] sm:text-[20px] font-bold"
                style={{ color: C.ink }}
              >
                Actions rapides
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {RACCOURCIS.map((r) => {
                const Icon = r.icon;
                return (
                  <Link
                    key={r.titre}
                    href={r.href}
                    className="rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all duration-200"
                    style={{
                      backgroundColor: C.white,
                      border: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.deep;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span
                      className="grid place-items-center h-10 w-10 rounded-xl"
                      style={{ backgroundColor: C.smoke, color: C.deep }}
                    >
                      <Icon size={18} />
                    </span>
                    <span
                      className="text-[12.5px] font-semibold leading-tight"
                      style={{ color: C.ink }}
                    >
                      {r.titre}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Détail des modules */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <Layers size={20} style={{ color: C.deep }} />
              <h2
                className="text-[18px] sm:text-[20px] font-bold"
                style={{ color: C.ink }}
              >
                Les 11 modules en détail
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES_DETAIL.map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.titre}
                    href={m.href}
                    className="rounded-2xl p-5 flex flex-col transition-all duration-200"
                    style={{
                      backgroundColor: C.white,
                      border: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.deep;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 30px -12px rgba(10,42,107,0.20)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid place-items-center h-10 w-10 rounded-xl shrink-0"
                        style={{ backgroundColor: C.smoke, color: C.deep }}
                      >
                        <Icon size={18} />
                      </span>
                      <h3
                        className="font-bold text-[14px]"
                        style={{ color: C.ink }}
                      >
                        {m.titre}
                      </h3>
                    </div>
                    <p
                      className="mt-3 text-[12.5px] leading-relaxed flex-1"
                      style={{ color: C.slate }}
                    >
                      {m.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold uppercase"
                          style={{
                            backgroundColor: C.smoke,
                            color: C.slate,
                            letterSpacing: "0.03em",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Rôles */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-5">
              <Users size={20} style={{ color: C.deep }} />
              <h2
                className="text-[18px] sm:text-[20px] font-bold"
                style={{ color: C.ink }}
              >
                Qui utilise quoi ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROLES.map((r) => (
                <div
                  key={r.nom}
                  className="rounded-2xl p-5"
                  style={{
                    backgroundColor: C.white,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} style={{ color: C.success }} />
                    <h3
                      className="font-bold text-[14px]"
                      style={{ color: C.ink }}
                    >
                      {r.nom}
                    </h3>
                  </div>
                  <p
                    className="mt-3 text-[12.5px] leading-relaxed"
                    style={{ color: C.slate }}
                  >
                    {r.description}
                  </p>
                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: `1px solid ${C.border}` }}
                  >
                    <div
                      className="text-[10.5px] uppercase font-semibold mb-2"
                      style={{ color: C.light, letterSpacing: "0.08em" }}
                    >
                      Modules principaux
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.modules.map((mod) => (
                        <Badge key={mod} bg="#DBEAFE" color={C.deep}>
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div className="mt-10">
            <Card>
              <CardHeader
                title="5 conseils pour bien démarrer"
                subtitle="Bonnes pratiques issues du terrain BTP"
              />
              <CardBody>
                <ul className="flex flex-col gap-4">
                  {[
                    {
                      titre: "Toujours partir du client",
                      texte:
                        "Avant de créer un devis ou un chantier, assurez-vous que le client est bien enregistré dans le module Clients. Cela évite les doublons.",
                    },
                    {
                      titre: "Saisir le pointage quotidiennement",
                      texte:
                        "Mieux vaut 5 minutes chaque soir que 2 heures à la fin du mois. Les rapports de rendement en dépendent directement.",
                    },
                    {
                      titre:
                        "Mettre à jour l'avancement des chantiers chaque semaine",
                      texte:
                        "L'écart entre l'avancement et la consommation du budget est LE signal d'alerte numéro 1 en BTP.",
                    },
                    {
                      titre: "Enregistrer les paiements au fur et à mesure",
                      texte:
                        "À chaque encaissement (acompte, solde), enregistrez-le dans Factures pour que la trésorerie reste juste.",
                    },
                    {
                      titre: "Consulter le tableau de bord chaque matin",
                      texte:
                        "En 30 secondes, vous savez ce qui va mal : retards, stocks bas, factures impayées. C'est votre radar.",
                    },
                  ].map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl"
                      style={{ backgroundColor: C.smoke }}
                    >
                      <span
                        className="grid place-items-center h-8 w-8 rounded-full shrink-0 font-bold text-[13px]"
                        style={{ backgroundColor: C.deep, color: C.white }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div
                          className="font-semibold text-[13.5px]"
                          style={{ color: C.ink }}
                        >
                          {c.titre}
                        </div>
                        <p
                          className="mt-1 text-[12.5px] leading-relaxed"
                          style={{ color: C.slate }}
                        >
                          {c.texte}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Avertissement démo */}
          <div
            className="mt-8 rounded-2xl p-5 flex items-start gap-4"
            style={{
              backgroundColor: "#FEF3C7",
              border: "1px solid #FCD34D",
            }}
          >
            <span
              className="grid place-items-center h-10 w-10 rounded-xl shrink-0"
              style={{ backgroundColor: C.warning, color: C.white }}
            >
              <AlertTriangle size={18} />
            </span>
            <div>
              <div
                className="font-semibold text-[14px]"
                style={{ color: "#78350F" }}
              >
                Version de démonstration
              </div>
              <p
                className="mt-1 text-[13px] leading-relaxed"
                style={{ color: "#78350F" }}
              >
                Les données affichées sont <strong>fictives</strong> et servent
                à illustrer le fonctionnement de l&apos;application. Elles sont
                stockées localement dans votre navigateur (localStorage) et
                seront remplacées par une base de données sécurisée dans la
                version de production.
                <br />
                <br />
                Pour tester depuis zéro, utilisez le bouton{" "}
                <strong>&quot;Réinitialiser&quot;</strong> en haut à droite,
                puis recréez vos propres données.
              </p>
            </div>
          </div>

          {/* CTA final */}
          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl"
            style={{
              backgroundColor: C.white,
              border: `1px solid ${C.border}`,
            }}
          >
            <div>
              <div className="font-bold text-[15px]" style={{ color: C.ink }}>
                Prêt à explorer l&apos;application ?
              </div>
              <div className="text-[13px] mt-1" style={{ color: C.slate }}>
                Commencez par le tableau de bord pour avoir la vue
                d&apos;ensemble.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="outline">Tableau de bord</Button>
              </Link>
              <Link href="/clients">
                <Button icon={<ArrowRight size={15} />}>Créer un client</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
