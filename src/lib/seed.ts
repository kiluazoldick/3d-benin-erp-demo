// src/lib/seed.ts
"use client";

import type {
  Client,
  Chantier,
  Devis,
  Facture,
  Employe,
  Pointage,
  Materiau,
  Fournisseur,
  Engagement,
  MouvementMateriau,
} from "./types";
import { writeCollection, isSeeded, markSeeded } from "./storage";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return iso(d);
};
const daysAhead = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const dateOnly = (d: Date) => d.toISOString().split("T")[0];

// ---------- CLIENTS ----------
const clients: Client[] = [
  {
    id: "cli-1",
    nom: "Mairie d'Abomey-Calavi",
    contact: "M. DOSSOU",
    telephone: "+229 97 12 34 56",
    email: "contact@abomey-calavi.bj",
    adresse: "Hôtel de ville, Abomey-Calavi",
    createdAt: daysAgo(120),
  },
  {
    id: "cli-2",
    nom: "SOBEBRA SA",
    contact: "Mme ADJOVI",
    telephone: "+229 96 45 67 89",
    email: "achats@sobebra.bj",
    adresse: "Zone industrielle, Cotonou",
    createdAt: daysAgo(95),
  },
  {
    id: "cli-3",
    nom: "Groupe BENIN INVEST",
    contact: "M. HOUNKPE",
    telephone: "+229 95 22 33 44",
    email: "projets@benin-invest.bj",
    adresse: "Cadjèhoun, Cotonou",
    createdAt: daysAgo(60),
  },
  {
    id: "cli-4",
    nom: "ONG Espoir Bénin",
    contact: "Mme LOKOSSOU",
    telephone: "+229 94 55 66 77",
    email: "logistique@espoir-benin.org",
    adresse: "Akpakpa, Cotonou",
    createdAt: daysAgo(30),
  },
];

// ---------- CHANTIERS ----------
const chantiers: Chantier[] = [
  {
    id: "ch-1",
    nom: "Réhabilitation voirie Akassato",
    clientId: "cli-1",
    lieu: "Akassato, Abomey-Calavi",
    dateDebut: daysAgo(60),
    dateFinPrevue: daysAhead(30),
    budget: 45_000_000,
    depense: 28_500_000,
    avancement: 65,
    statut: "en_cours",
    chefChantierId: "emp-1",
    description: "Réfection de 3,2 km de voirie urbaine avec assainissement.",
    createdAt: daysAgo(60),
  },
  {
    id: "ch-2",
    nom: "Extension entrepôt SOBEBRA",
    clientId: "cli-2",
    lieu: "Zone industrielle, Cotonou",
    dateDebut: daysAgo(40),
    dateFinPrevue: daysAhead(50),
    budget: 120_000_000,
    depense: 42_000_000,
    avancement: 35,
    statut: "en_cours",
    chefChantierId: "emp-2",
    description:
      "Construction d'un entrepôt logistique de 2 400 m² avec dalles industrielles.",
    createdAt: daysAgo(40),
  },
  {
    id: "ch-3",
    nom: "Villa duplex Calavi",
    clientId: "cli-3",
    lieu: "Calavi Centre",
    dateDebut: daysAgo(15),
    dateFinPrevue: daysAhead(120),
    budget: 38_000_000,
    depense: 6_500_000,
    avancement: 12,
    statut: "en_cours",
    chefChantierId: "emp-1",
    description: "Construction d'une villa duplex 5 pièces + piscine.",
    createdAt: daysAgo(15),
  },
  {
    id: "ch-4",
    nom: "Bloc sanitaire ONG Espoir",
    clientId: "cli-4",
    lieu: "Akpakpa, Cotonou",
    dateDebut: daysAgo(90),
    dateFinPrevue: daysAgo(5),
    budget: 8_500_000,
    depense: 8_100_000,
    avancement: 100,
    statut: "termine",
    chefChantierId: "emp-2",
    description: "Construction d'un bloc sanitaire 6 cabines + forage.",
    createdAt: daysAgo(90),
  },
];

// ---------- EMPLOYES ----------
const employes: Employe[] = [
  {
    id: "emp-1",
    nom: "AGOSSOU",
    prenom: "Pierre",
    role: "chef_chantier",
    telephone: "+229 97 11 22 33",
    tauxJournalier: 15_000,
    chantierId: "ch-1",
    actif: true,
    createdAt: daysAgo(120),
  },
  {
    id: "emp-2",
    nom: "TOSSOU",
    prenom: "Marcel",
    role: "chef_chantier",
    telephone: "+229 96 33 44 55",
    tauxJournalier: 15_000,
    chantierId: "ch-2",
    actif: true,
    createdAt: daysAgo(120),
  },
  {
    id: "emp-3",
    nom: "HOUNKPATIN",
    prenom: "Jean",
    role: "macon",
    telephone: "+229 95 55 66 77",
    tauxJournalier: 7_500,
    chantierId: "ch-1",
    actif: true,
    createdAt: daysAgo(90),
  },
  {
    id: "emp-4",
    nom: "DOSSOU",
    prenom: "Koffi",
    role: "coffreur",
    telephone: "+229 94 77 88 99",
    tauxJournalier: 8_000,
    chantierId: "ch-2",
    actif: true,
    createdAt: daysAgo(90),
  },
  {
    id: "emp-5",
    nom: "AGBODJAN",
    prenom: "Luc",
    role: "ferrailleur",
    telephone: "+229 97 99 11 22",
    tauxJournalier: 8_000,
    chantierId: "ch-2",
    actif: true,
    createdAt: daysAgo(80),
  },
  {
    id: "emp-6",
    nom: "SOSSOU",
    prenom: "Benoît",
    role: "ouvrier",
    telephone: "+229 96 22 33 44",
    tauxJournalier: 5_000,
    chantierId: "ch-1",
    actif: true,
    createdAt: daysAgo(60),
  },
  {
    id: "emp-7",
    nom: "ADJOVI",
    prenom: "Céline",
    role: "administratif",
    telephone: "+229 95 44 55 66",
    tauxJournalier: 10_000,
    actif: true,
    createdAt: daysAgo(120),
  },
  {
    id: "emp-8",
    nom: "KPADONOU",
    prenom: "Yves",
    role: "ouvrier",
    telephone: "+229 94 66 77 88",
    tauxJournalier: 5_000,
    chantierId: "ch-3",
    actif: true,
    createdAt: daysAgo(15),
  },
];

// ---------- POINTAGES ----------
function genPointages(): Pointage[] {
  const out: Pointage[] = [];
  const ids = ["emp-3", "emp-4", "emp-5", "emp-6", "emp-8"];
  for (let d = 1; d <= 10; d++) {
    ids.forEach((empId, idx) => {
      const emp = employes.find((e) => e.id === empId)!;
      out.push({
        id: `pt-${d}-${idx}`,
        employeId: empId,
        chantierId: emp.chantierId ?? "ch-1",
        date: dateOnly(new Date(Date.now() - d * 86_400_000)),
        heures: 8,
        description: "Journée normale",
        createdAt: daysAgo(d),
      });
    });
  }
  return out;
}
const pointages = genPointages();

// ---------- MATERIAUX ----------
const materiaux: Materiau[] = [
  {
    id: "mat-1",
    nom: "Ciment CIMBENIN 50kg",
    unite: "sac",
    stock: 320,
    seuilAlerte: 100,
    prixUnitaire: 4_500,
    fournisseurId: "frn-1",
    createdAt: daysAgo(60),
  },
  {
    id: "mat-2",
    nom: "Fer à béton 12mm",
    unite: "barre",
    stock: 45,
    seuilAlerte: 80,
    prixUnitaire: 6_200,
    fournisseurId: "frn-2",
    createdAt: daysAgo(60),
  },
  {
    id: "mat-3",
    nom: "Sable lagunaire",
    unite: "m3",
    stock: 28,
    seuilAlerte: 15,
    prixUnitaire: 8_000,
    fournisseurId: "frn-3",
    createdAt: daysAgo(45),
  },
  {
    id: "mat-4",
    nom: "Gravier 15/25",
    unite: "m3",
    stock: 12,
    seuilAlerte: 20,
    prixUnitaire: 12_000,
    fournisseurId: "frn-3",
    createdAt: daysAgo(45),
  },
  {
    id: "mat-5",
    nom: "Tôle bac alu 0.5mm",
    unite: "m2",
    stock: 180,
    seuilAlerte: 50,
    prixUnitaire: 5_500,
    fournisseurId: "frn-2",
    createdAt: daysAgo(30),
  },
];

// ---------- FOURNISSEURS ----------
const fournisseurs: Fournisseur[] = [
  {
    id: "frn-1",
    nom: "CIMBENIN",
    categorie: "Matériaux de construction",
    contact: "Service commercial",
    telephone: "+229 21 35 00 00",
    email: "ventes@cimbenin.bj",
    adresse: "Zone portuaire, Cotonou",
    createdAt: daysAgo(120),
  },
  {
    id: "frn-2",
    nom: "Quincaillerie LE BATISSEUR",
    categorie: "Quincaillerie",
    contact: "M. BADOU",
    telephone: "+229 97 88 99 00",
    email: "contact@lebatisseur.bj",
    adresse: "Dantokpa, Cotonou",
    createdAt: daysAgo(120),
  },
  {
    id: "frn-3",
    nom: "SBG Carrières",
    categorie: "Matériaux de construction",
    contact: "M. AHOUANSOU",
    telephone: "+229 96 12 34 56",
    email: "commandes@sbg.bj",
    adresse: "Carrière de Dassa",
    createdAt: daysAgo(90),
  },
];

// ---------- DEVIS ----------
const devis: Devis[] = [
  {
    id: "dev-1",
    numero: "DEV-2026-001",
    clientId: "cli-1",
    chantierId: "ch-1",
    date: daysAgo(70),
    dateValidite: daysAgo(40),
    lignes: [
      {
        designation: "Terrassement voirie",
        quantite: 1,
        prixUnitaire: 12_000_000,
      },
      { designation: "Béton bitumineux", quantite: 3200, prixUnitaire: 8_500 },
      { designation: "Assainissement", quantite: 1, prixUnitaire: 6_500_000 },
    ],
    totalHT: 45_700_000,
    tva: 8_683_000,
    totalTTC: 54_383_000,
    statut: "accepte",
    notes: "Validé par la mairie.",
    createdAt: daysAgo(70),
  },
  {
    id: "dev-2",
    numero: "DEV-2026-002",
    clientId: "cli-2",
    chantierId: "ch-2",
    date: daysAgo(50),
    dateValidite: daysAhead(10),
    lignes: [
      {
        designation: "Dalle industrielle",
        quantite: 2400,
        prixUnitaire: 35_000,
      },
      {
        designation: "Charpente métallique",
        quantite: 1,
        prixUnitaire: 30_000_000,
      },
    ],
    totalHT: 114_000_000,
    tva: 21_660_000,
    totalTTC: 135_660_000,
    statut: "accepte",
    notes: "",
    createdAt: daysAgo(50),
  },
  {
    id: "dev-3",
    numero: "DEV-2026-003",
    clientId: "cli-3",
    chantierId: "ch-3",
    date: daysAgo(20),
    dateValidite: daysAhead(20),
    lignes: [
      {
        designation: "Villa duplex clé en main",
        quantite: 1,
        prixUnitaire: 38_000_000,
      },
    ],
    totalHT: 38_000_000,
    tva: 7_220_000,
    totalTTC: 45_220_000,
    statut: "accepte",
    notes: "",
    createdAt: daysAgo(20),
  },
  {
    id: "dev-4",
    numero: "DEV-2026-004",
    clientId: "cli-4",
    date: daysAgo(5),
    dateValidite: daysAhead(25),
    lignes: [
      {
        designation: "Extension bloc sanitaire",
        quantite: 1,
        prixUnitaire: 4_500_000,
      },
    ],
    totalHT: 4_500_000,
    tva: 855_000,
    totalTTC: 5_355_000,
    statut: "envoye",
    notes: "En attente de validation.",
    createdAt: daysAgo(5),
  },
];

// ---------- FACTURES ----------
const factures: Facture[] = [
  {
    id: "fac-1",
    numero: "FAC-2026-001",
    clientId: "cli-1",
    chantierId: "ch-1",
    devisId: "dev-1",
    date: daysAgo(50),
    dateEcheance: daysAgo(20),
    montantHT: 20_000_000,
    tva: 3_800_000,
    montantTTC: 23_800_000,
    montantPaye: 15_000_000,
    statut: "impayee",
    notes: "Acompte 1",
    createdAt: daysAgo(50),
  },
  {
    id: "fac-2",
    numero: "FAC-2026-002",
    clientId: "cli-2",
    chantierId: "ch-2",
    devisId: "dev-2",
    date: daysAgo(30),
    dateEcheance: daysAhead(15),
    montantHT: 40_000_000,
    tva: 7_600_000,
    montantTTC: 47_600_000,
    montantPaye: 47_600_000,
    statut: "payee",
    notes: "Acompte démarrage",
    createdAt: daysAgo(30),
  },
  {
    id: "fac-3",
    numero: "FAC-2026-003",
    clientId: "cli-4",
    chantierId: "ch-4",
    date: daysAgo(10),
    dateEcheance: daysAhead(20),
    montantHT: 8_100_000,
    tva: 1_539_000,
    montantTTC: 9_639_000,
    montantPaye: 0,
    statut: "envoyee",
    notes: "Solde final",
    createdAt: daysAgo(10),
  },
  {
    id: "fac-4",
    numero: "FAC-2026-004",
    clientId: "cli-3",
    chantierId: "ch-3",
    date: daysAgo(3),
    dateEcheance: daysAhead(27),
    montantHT: 6_500_000,
    tva: 1_235_000,
    montantTTC: 7_735_000,
    montantPaye: 0,
    statut: "envoyee",
    notes: "Acompte 1",
    createdAt: daysAgo(3),
  },
];

// ---------- ENGAGEMENTS ----------
const engagements: Engagement[] = [
  {
    id: "eng-1",
    type: "client",
    tiersId: "cli-1",
    montant: 23_800_000,
    montantRegle: 15_000_000,
    dateEcheance: daysAgo(20),
    description: "Facture FAC-2026-001",
    statut: "partiel",
    createdAt: daysAgo(50),
  },
  {
    id: "eng-2",
    type: "client",
    tiersId: "cli-4",
    montant: 9_639_000,
    montantRegle: 0,
    dateEcheance: daysAhead(20),
    description: "Facture FAC-2026-003",
    statut: "ouvert",
    createdAt: daysAgo(10),
  },
  {
    id: "eng-3",
    type: "client",
    tiersId: "cli-3",
    montant: 7_735_000,
    montantRegle: 0,
    dateEcheance: daysAhead(27),
    description: "Facture FAC-2026-004",
    statut: "ouvert",
    createdAt: daysAgo(3),
  },
  {
    id: "eng-4",
    type: "fournisseur",
    tiersId: "frn-1",
    montant: 2_250_000,
    montantRegle: 0,
    dateEcheance: daysAhead(10),
    description: "Livraison ciment - commande CMD-014",
    statut: "ouvert",
    createdAt: daysAgo(5),
  },
  {
    id: "eng-5",
    type: "fournisseur",
    tiersId: "frn-3",
    montant: 4_800_000,
    montantRegle: 2_000_000,
    dateEcheance: daysAhead(5),
    description: "Sable + gravier - commande CMD-012",
    statut: "partiel",
    createdAt: daysAgo(12),
  },
];

// ---------- MOUVEMENTS MATERIAUX ----------
function genMouvements(): MouvementMateriau[] {
  const out: MouvementMateriau[] = [];
  const data: {
    materiauId: string;
    chantierId: string;
    type: "entree" | "sortie";
    quantite: number;
    date: string;
    notes: string;
  }[] = [
    {
      materiauId: "mat-1",
      chantierId: "ch-1",
      type: "entree",
      quantite: 200,
      date: daysAgo(20),
      notes: "Livraison CIMBENIN",
    },
    {
      materiauId: "mat-1",
      chantierId: "ch-1",
      type: "sortie",
      quantite: 80,
      date: daysAgo(15),
      notes: "Coulage dalle",
    },
    {
      materiauId: "mat-1",
      chantierId: "ch-2",
      type: "sortie",
      quantite: 120,
      date: daysAgo(10),
      notes: "Fondations entrepôt",
    },
    {
      materiauId: "mat-2",
      chantierId: "ch-2",
      type: "entree",
      quantite: 100,
      date: daysAgo(18),
      notes: "Fournisseur LE BATISSEUR",
    },
    {
      materiauId: "mat-2",
      chantierId: "ch-2",
      type: "sortie",
      quantite: 55,
      date: daysAgo(8),
      notes: "Ferraillage poteaux",
    },
    {
      materiauId: "mat-3",
      chantierId: "ch-1",
      type: "entree",
      quantite: 50,
      date: daysAgo(22),
      notes: "Carrière SBG",
    },
    {
      materiauId: "mat-3",
      chantierId: "ch-1",
      type: "sortie",
      quantite: 22,
      date: daysAgo(12),
      notes: "Maçonnerie",
    },
    {
      materiauId: "mat-4",
      chantierId: "ch-2",
      type: "entree",
      quantite: 30,
      date: daysAgo(20),
      notes: "Carrière SBG",
    },
    {
      materiauId: "mat-4",
      chantierId: "ch-2",
      type: "sortie",
      quantite: 18,
      date: daysAgo(5),
      notes: "Dalle industrielle",
    },
    {
      materiauId: "mat-5",
      chantierId: "ch-3",
      type: "entree",
      quantite: 200,
      date: daysAgo(10),
      notes: "Tôle bac",
    },
    {
      materiauId: "mat-5",
      chantierId: "ch-3",
      type: "sortie",
      quantite: 20,
      date: daysAgo(3),
      notes: "Toiture villa",
    },
  ];
  data.forEach((m, i) => {
    out.push({
      id: `mv-${i + 1}`,
      ...m,
    });
  });
  return out;
}

const mouvements = genMouvements();

// ---------- FONCTION DE SEED ----------
export function seedDemoData(force = false): void {
  if (typeof window === "undefined") return;
  if (!force && isSeeded()) return;

  writeCollection<Client>("clients", clients);
  writeCollection<Chantier>("chantiers", chantiers);
  writeCollection<Employe>("employes", employes);
  writeCollection<Pointage>("pointages", pointages);
  writeCollection<Materiau>("materiaux", materiaux);
  writeCollection<Fournisseur>("fournisseurs", fournisseurs);
  writeCollection<Devis>("devis", devis);
  writeCollection<Facture>("factures", factures);
  writeCollection<Engagement>("engagements", engagements);
  writeCollection<MouvementMateriau>("mouvements", mouvements);

  markSeeded();
}
