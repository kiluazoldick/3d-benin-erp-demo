// src/lib/constants.ts
import type {
  StatutChantier,
  StatutDevis,
  StatutFacture,
  RoleEmploye,
} from "./types";
import { C } from "./theme";

export const STATUTS_CHANTIER: Record<
  StatutChantier,
  { label: string; bg: string; color: string }
> = {
  planifie: { label: "Planifié", bg: C.slateBg, color: C.slate },
  en_cours: { label: "En cours", bg: C.blueBg, color: C.deep },
  suspendu: { label: "Suspendu", bg: C.amberBg, color: "#92400E" },
  termine: { label: "Terminé", bg: C.greenBg, color: "#166534" },
};

export const STATUTS_DEVIS: Record<
  StatutDevis,
  { label: string; bg: string; color: string }
> = {
  brouillon: { label: "Brouillon", bg: C.slateBg, color: C.slate },
  envoye: { label: "Envoyé", bg: C.blueBg, color: C.deep },
  accepte: { label: "Accepté", bg: C.greenBg, color: "#166534" },
  refuse: { label: "Refusé", bg: C.redBg, color: "#991B1B" },
};

export const STATUTS_FACTURE: Record<
  StatutFacture,
  { label: string; bg: string; color: string }
> = {
  brouillon: { label: "Brouillon", bg: C.slateBg, color: C.slate },
  envoyee: { label: "Envoyée", bg: C.blueBg, color: C.deep },
  payee: { label: "Payée", bg: C.greenBg, color: "#166534" },
  impayee: { label: "Impayée", bg: C.redBg, color: "#991B1B" },
};

export const ROLES_EMPLOYE: Record<RoleEmploye, string> = {
  chef_chantier: "Chef de chantier",
  conducteur: "Conducteur de travaux",
  ouvrier: "Ouvrier",
  macon: "Maçon",
  coffreur: "Coffreur",
  ferrailleur: "Ferrailleur",
  administratif: "Administratif",
};

export const CATEGORIES_FOURNISSEUR = [
  "Matériaux de construction",
  "Quincaillerie",
  "Location d'engins",
  "Transport",
  "Carburant",
  "Services",
  "Autre",
];

export const UNITES_MATERIAU = [
  "sac",
  "m3",
  "m2",
  "kg",
  "tonne",
  "litre",
  "unité",
  "barre",
];

export const TVA_TAUX = 0.19;
