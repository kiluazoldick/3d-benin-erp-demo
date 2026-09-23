// src/context/DataContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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
} from "@/lib/types";
import {
  readCollection,
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/storage";
import { seedDemoData } from "@/lib/seed";

interface DataContextValue {
  ready: boolean;
  clients: Client[];
  chantiers: Chantier[];
  devis: Devis[];
  factures: Facture[];
  employes: Employe[];
  pointages: Pointage[];
  materiaux: Materiau[];
  fournisseurs: Fournisseur[];
  engagements: Engagement[];
  mouvements: MouvementMateriau[];
  refresh: () => void;
  resetDemo: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [materiaux, setMateriaux] = useState<Materiau[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [mouvements, setMouvements] = useState<MouvementMateriau[]>([]);

  const loadAll = useCallback(() => {
    setClients(readCollection<Client>("clients"));
    setChantiers(readCollection<Chantier>("chantiers"));
    setDevis(readCollection<Devis>("devis"));
    setFactures(readCollection<Facture>("factures"));
    setEmployes(readCollection<Employe>("employes"));
    setPointages(readCollection<Pointage>("pointages"));
    setMateriaux(readCollection<Materiau>("materiaux"));
    setFournisseurs(readCollection<Fournisseur>("fournisseurs"));
    setEngagements(readCollection<Engagement>("engagements"));
    setMouvements(readCollection<MouvementMateriau>("mouvements"));
  }, []);

  useEffect(() => {
    seedDemoData();
    loadAll();
    setReady(true);
  }, [loadAll]);

  const refresh = useCallback(() => loadAll(), [loadAll]);

  const resetDemo = useCallback(() => {
    seedDemoData(true);
    loadAll();
  }, [loadAll]);

  return (
    <DataContext.Provider
      value={{
        ready,
        clients,
        chantiers,
        devis,
        factures,
        employes,
        pointages,
        materiaux,
        fournisseurs,
        engagements,
        mouvements,
        refresh,
        resetDemo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}

// Réexport des helpers CRUD
export { createItem, updateItem, deleteItem };
