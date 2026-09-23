// src/components/clients/ClientForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem, updateItem } from "@/lib/storage";
import type { Client } from "@/lib/types";

export default function ClientForm({ initial }: { initial?: Client }) {
  const router = useRouter();
  const { refresh } = useData();

  const [form, setForm] = useState<Omit<Client, "id" | "createdAt">>({
    nom: initial?.nom ?? "",
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
      updateItem<Client>("clients", initial.id, form);
    } else {
      createItem<Client>("clients", form);
    }
    refresh();
    router.push("/clients");
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
          Informations du client
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom / Raison sociale"
            required
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex. Mairie d'Abomey-Calavi"
            error={errors.nom}
          />
          <Input
            label="Personne à contacter"
            value={form.contact}
            onChange={(e) => set("contact", e.target.value)}
            placeholder="Ex. M. DOSSOU"
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
          <Input
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="contact@exemple.bj"
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
          onClick={() => router.push("/clients")}
        >
          Annuler
        </Button>
        <Button type="submit" icon={<Save size={16} />}>
          {initial ? "Enregistrer les modifications" : "Créer le client"}
        </Button>
      </div>
    </form>
  );
}
