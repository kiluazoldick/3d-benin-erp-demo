// src/components/materiaux/MateriauForm.tsx
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
import { UNITES_MATERIAU } from "@/lib/constants";
import type { Materiau } from "@/lib/types";

export default function MateriauForm({ initial }: { initial?: Materiau }) {
  const router = useRouter();
  const { fournisseurs, refresh } = useData();

  const [form, setForm] = useState<Omit<Materiau, "id" | "createdAt">>({
    nom: initial?.nom ?? "",
    unite: initial?.unite ?? "sac",
    stock: initial?.stock ?? 0,
    seuilAlerte: initial?.seuilAlerte ?? 0,
    prixUnitaire: initial?.prixUnitaire ?? 0,
    fournisseurId: initial?.fournisseurId ?? "",
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
    if (!form.unite) e.unite = "L'unité est requise";
    if (form.prixUnitaire <= 0) e.prixUnitaire = "Le prix doit être > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (initial) {
      updateItem<Materiau>("materiaux", initial.id, form);
    } else {
      createItem<Materiau>("materiaux", form);
    }
    refresh();
    router.push("/materiaux");
  };

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
          Informations du matériau
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom du matériau"
            required
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex. Ciment CIMBENIN 50kg"
            error={errors.nom}
          />
          <Select
            label="Unité de mesure"
            required
            value={form.unite}
            onChange={(e) => set("unite", e.target.value)}
            options={UNITES_MATERIAU.map((u) => ({ value: u, label: u }))}
            error={errors.unite}
          />
          <Input
            label="Prix unitaire (FCFA)"
            required
            type="number"
            min={0}
            value={form.prixUnitaire}
            onChange={(e) => set("prixUnitaire", Number(e.target.value) || 0)}
            error={errors.prixUnitaire}
          />
          <Select
            label="Fournisseur principal"
            value={form.fournisseurId ?? ""}
            onChange={(e) => set("fournisseurId", e.target.value)}
            placeholder="— Aucun —"
            options={fournisseurs.map((f) => ({
              value: f.id,
              label: f.nom,
            }))}
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
          Stock
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Stock initial"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => set("stock", Number(e.target.value) || 0)}
            hint="Peut être ajusté par des mouvements"
          />
          <Input
            label="Seuil d'alerte"
            type="number"
            min={0}
            value={form.seuilAlerte}
            onChange={(e) => set("seuilAlerte", Number(e.target.value) || 0)}
            hint="Déclenche une alerte quand le stock passe en dessous"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          icon={<X size={16} />}
          onClick={() => router.push("/materiaux")}
        >
          Annuler
        </Button>
        <Button type="submit" icon={<Save size={16} />}>
          {initial ? "Enregistrer les modifications" : "Créer le matériau"}
        </Button>
      </div>
    </form>
  );
}
