// src/lib/types.ts

export type Statut = "actif" | "inactif";

export type StatutChantier = "planifie" | "en_cours" | "suspendu" | "termine";

export type StatutDevis = "brouillon" | "envoye" | "accepte" | "refuse";

export type StatutFacture = "brouillon" | "envoyee" | "payee" | "impayee";

export type RoleEmploye =
  | "chef_chantier"
  | "conducteur"
  | "ouvrier"
  | "macon"
  | "coffreur"
  | "ferrailleur"
  | "administratif";

// ---------- CLIENT ----------
export interface Client {
  id: string;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  createdAt: string;
}

// ---------- CHANTIER ----------
export interface Chantier {
  id: string;
  nom: string;
  clientId: string;
  lieu: string;
  dateDebut: string;
  dateFinPrevue: string;
  budget: number;
  depense: number;
  avancement: number; // 0 à 100
  statut: StatutChantier;
  chefChantierId?: string;
  description: string;
  createdAt: string;
}

// ---------- DEVIS ----------
export interface LigneDevis {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Devis {
  id: string;
  numero: string;
  clientId: string;
  chantierId?: string;
  date: string;
  dateValidite: string;
  lignes: LigneDevis[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  statut: StatutDevis;
  notes: string;
  createdAt: string;
}

// ---------- FACTURE ----------
export interface Facture {
  id: string;
  numero: string;
  clientId: string;
  chantierId?: string;
  devisId?: string;
  date: string;
  dateEcheance: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  montantPaye: number;
  statut: StatutFacture;
  notes: string;
  createdAt: string;
}

// ---------- EMPLOYE ----------
export interface Employe {
  id: string;
  nom: string;
  prenom: string;
  role: RoleEmploye;
  telephone: string;
  tauxJournalier: number;
  chantierId?: string;
  actif: boolean;
  createdAt: string;
}

// ---------- POINTAGE ----------
export interface Pointage {
  id: string;
  employeId: string;
  chantierId: string;
  date: string; // YYYY-MM-DD
  heures: number;
  description: string;
  createdAt: string;
}

// ---------- MATERIAU ----------
export interface Materiau {
  id: string;
  nom: string;
  unite: string; // sac, m3, kg, unité...
  stock: number;
  seuilAlerte: number;
  prixUnitaire: number;
  fournisseurId?: string;
  createdAt: string;
}

// ---------- FOURNISSEUR ----------
export interface Fournisseur {
  id: string;
  nom: string;
  categorie: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  createdAt: string;
}

// ---------- ENGAGEMENT (dette) ----------
export interface Engagement {
  id: string;
  type: "client" | "fournisseur"; // client = on nous doit / fournisseur = on doit
  tiersId: string; // clientId ou fournisseurId
  montant: number;
  montantRegle: number;
  dateEcheance: string;
  description: string;
  statut: "ouvert" | "partiel" | "regle";
  createdAt: string;
}

// ---------- MOUVEMENT MATERIAU ----------
export interface MouvementMateriau {
  id: string;
  materiauId: string;
  chantierId: string;
  type: "entree" | "sortie";
  quantite: number;
  date: string;
  notes: string;
}
