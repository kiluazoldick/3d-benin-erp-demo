// src/components/personnel/EmployeForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem, updateItem } from "@/lib/storage";
import { ROLES_EMPLOYE } from "@/lib/constants";
import type { Employe, RoleEmploye } from "@/lib/types";

const ROLES_OPTIONS = (Object.keys(ROLES_EMPLOYE) as RoleEmploye[]).map(
  (r) => ({ value: r, label: ROLES_EMPLOYE[r] }),
);

export default function EmployeForm({ initial }: { initial?: Employe }) {
  const router = useRouter();
  const { chantiers, refresh } = useData();

  const [form, setForm] = useState<Omit<Employe, "id" | "createdAt">>({
    nom: initial?.nom ?? "",
    prenom: initial?.prenom ?? "",
    role: initial?.role ?? "ouvrier",
    telephone: initial?.telephone ?? "",
    tauxJournalier: initial?.tauxJournalier ?? 0,
    chantierId: initial?.chantierId ?? "",
    actif: initial?.actif ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = "Le nom est requis";
    if (!form.prenom.trim()) e.prenom = "Le prénom est requis";
    if (!form.telephone.trim()) e.telephone = "Le téléphone est requis";
    if (form.tauxJournalier <= 0)
      e.tauxJournalier = "Le taux journalier doit être > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (initial) {
      updateItem<Employe>("employes", initial.id, form);
    } else {
      createItem<Employe>("employes", form);
    }
    refresh();
    router.push("/personnel");
  };

  const chantiersActifs = chantiers.filter(
    (c) => c.statut === "en_cours" || c.statut === "planifie",
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: C.white,
          border: `1px solid ${C.border}`,
        }}
      >
        <h3
          className="text-[15px] font-semibold mb-5 pb-3"
          style={{ color: C.ink, borderBottom: `1px solid ${C.border}` }}
        >
          Informations personnelles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom"
            required
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex. AGOSSOU"
            error={errors.nom}
          />
          <Input
            label="Prénom"
            required
            value={form.prenom}
            onChange={(e) => set("prenom", e.target.value)}
            placeholder="Ex. Pierre"
            error={errors.prenom}
          />
          <Input
            label="Téléphone"
            required
            type="tel"
            value={form.telephone}
            onChange={(e) => set("telephone", e.target.value)}
            placeholder="+229 97 00 00 00"
            error={errors.telephone}
          />
          <Select
            label="Rôle"
            required
            value={form.role}
            onChange={(e) => set("role", e.target.value as RoleEmploye)}
            options={ROLES_OPTIONS}
          />
        </div>
      </div>

      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: C.white,
          border: `1px solid ${C.border}`,
        }}
      >
        <h3
          className="text-[15px] font-semibold mb-5 pb-3"
          style={{ color: C.ink, borderBottom: `1px solid ${C.border}` }}
        >
          Affectation & rémunération
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Taux journalier (FCFA)"
            required
            type="number"
            min={0}
            value={form.tauxJournalier}
            onChange={(e) => set("tauxJournalier", Number(e.target.value) || 0)}
            error={errors.tauxJournalier}
          />
          <Select
            label="Chantier affecté"
            value={form.chantierId ?? ""}
            onChange={(e) => set("chantierId", e.target.value)}
            placeholder="— Aucun —"
            options={chantiersActifs.map((c) => ({
              value: c.id,
              label: c.nom,
            }))}
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <input
            id="actif"
            type="checkbox"
            checked={form.actif}
            onChange={(e) => set("actif", e.target.checked)}
            className="h-4 w-4 rounded cursor-pointer"
            style={{ accentColor: C.deep }}
          />
          <label
            htmlFor="actif"
            className="text-[13.5px] cursor-pointer select-none"
            style={{ color: C.ink }}
          >
            Employé actif (disponible pour affectation)
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          icon={<X size={16} />}
          onClick={() => router.push("/personnel")}
        >
          Annuler
        </Button>
        <Button type="submit" icon={<Save size={16} />}>
          {initial ? "Enregistrer les modifications" : "Ajouter l'employé"}
        </Button>
      </div>
    </form>
  );
}
