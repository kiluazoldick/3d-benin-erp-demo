// src/components/fournisseurs/FournisseurForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem, updateItem } from "@/lib/storage";
import { CATEGORIES_FOURNISSEUR } from "@/lib/constants";
import type { Fournisseur } from "@/lib/types";

export default function FournisseurForm({
  initial,
}: {
  initial?: Fournisseur;
}) {
  const router = useRouter();
  const { refresh } = useData();

  const [form, setForm] = useState<Omit<Fournisseur, "id" | "createdAt">>({
    nom: initial?.nom ?? "",
    categorie: initial?.categorie ?? CATEGORIES_FOURNISSEUR[0],
    contact: initial?.contact ?? "",
    telephone: initial?.telephone ?? "",
    email: initial?.email ?? "",
    adresse: initial?.adresse ?? "",
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
    if (!form.telephone.trim()) e.telephone = "Le téléphone est requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Format d'e-mail invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    if (initial) {
      updateItem<Fournisseur>("fournisseurs", initial.id, form);
    } else {
      createItem<Fournisseur>("fournisseurs", form);
    }
    refresh();
    router.push("/fournisseurs");
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
          Informations du fournisseur
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom / Raison sociale"
            required
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex. CIMBENIN"
            error={errors.nom}
          />
          <Select
            label="Catégorie"
            required
            value={form.categorie}
            onChange={(e) => set("categorie", e.target.value)}
            options={CATEGORIES_FOURNISSEUR.map((c) => ({
              value: c,
              label: c,
            }))}
          />
          <Input
            label="Personne à contacter"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            placeholder="Ex. Service commercial"
          />
          <Input
            label="Téléphone"
            required
            type="tel"
            value={form.telephone}
            onChange={(e) => set("telephone", e.target.value)}
            placeholder="+229 21 00 00 00"
            error={errors.telephone}
          />
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="contact@fournisseur.bj"
            error={errors.email}
          />
        </div>

        <div className="mt-5">
          <Textarea
            label="Adresse"
            rows={2}
            value={form.adresse}
            onChange={(e) => set("adresse", e.target.value)}
            placeholder="Quartier, ville, pays"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          icon={<X size={16} />}
          onClick={() => router.push("/fournisseurs")}
        >
          Annuler
        </Button>
        <Button type="submit" icon={<Save size={16} />}>
          {initial ? "Enregistrer les modifications" : "Créer le fournisseur"}
        </Button>
      </div>
    </form>
  );
}
