// src/components/chantiers/ChantierForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem, updateItem } from "@/lib/storage";
import type { Chantier, StatutChantier } from "@/lib/types";
import { todayISO } from "@/lib/format";

const STATUTS: { value: StatutChantier; label: string }[] = [
  { value: "planifie", label: "Planifié" },
  { value: "en_cours", label: "En cours" },
  { value: "suspendu", label: "Suspendu" },
  { value: "termine", label: "Terminé" },
];

export default function ChantierForm({ initial }: { initial?: Chantier }) {
  const router = useRouter();
  const { clients, employes, refresh } = useData();

  const [form, setForm] = useState<Omit<Chantier, "id" | "createdAt">>({
    nom: initial?.nom ?? "",
    clientId: initial?.clientId ?? "",
    lieu: initial?.lieu ?? "",
    dateDebut: initial?.dateDebut?.split("T")[0] ?? todayISO(),
    dateFinPrevue: initial?.dateFinPrevue?.split("T")[0] ?? "",
    budget: initial?.budget ?? 0,
    depense: initial?.depense ?? 0,
    avancement: initial?.avancement ?? 0,
    statut: initial?.statut ?? "planifie",
    chefChantierId: initial?.chefChantierId ?? "",
    description: initial?.description ?? "",
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
    if (!form.clientId) e.clientId = "Sélectionnez un client";
    if (!form.lieu.trim()) e.lieu = "Le lieu est requis";
    if (!form.dateDebut) e.dateDebut = "Date requise";
    if (form.budget <= 0) e.budget = "Budget doit être > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      dateDebut: new Date(form.dateDebut).toISOString(),
      dateFinPrevue: form.dateFinPrevue
        ? new Date(form.dateFinPrevue).toISOString()
        : "",
    };

    if (initial) {
      updateItem<Chantier>("chantiers", initial.id, payload);
    } else {
      createItem<Chantier>("chantiers", payload);
    }
    refresh();
    router.push("/chantiers");
  };

  const chefOptions = employes
    .filter((e) => e.role === "chef_chantier" || e.role === "conducteur")
    .map((e) => ({ value: e.id, label: `${e.prenom} ${e.nom}` }));

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
          Informations générales
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Nom du chantier"
            required
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            placeholder="Ex. Réhabilitation voirie Akassato"
            error={errors.nom}
          />
          <Select
            label="Client"
            required
            value={form.clientId}
            onChange={(e) => set("clientId", e.target.value)}
            placeholder="— Sélectionner un client —"
            options={clients.map((c) => ({ value: c.id, label: c.nom }))}
            error={errors.clientId}
          />
          <Input
            label="Lieu"
            required
            value={form.lieu}
            onChange={(e) => set("lieu", e.target.value)}
            placeholder="Ex. Akassato, Abomey-Calavi"
            error={errors.lieu}
          />
          <Select
            label="Chef de chantier"
            value={form.chefChantierId ?? ""}
            onChange={(e) => set("chefChantierId", e.target.value)}
            placeholder="— Non assigné —"
            options={chefOptions}
          />
        </div>

        <div className="mt-5">
          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Nature des travaux, surface, particularités…"
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
          Planning & budget
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Date de début"
            type="date"
            required
            value={form.dateDebut}
            onChange={(e) => set("dateDebut", e.target.value)}
            error={errors.dateDebut}
          />
          <Input
            label="Date de fin prévue"
            type="date"
            value={form.dateFinPrevue}
            onChange={(e) => set("dateFinPrevue", e.target.value)}
          />
          <Input
            label="Budget (FCFA)"
            type="number"
            required
            min={0}
            value={form.budget}
            onChange={(e) => set("budget", Number(e.target.value))}
            error={errors.budget}
          />
          <Input
            label="Déjà dépensé (FCFA)"
            type="number"
            min={0}
            value={form.depense}
            onChange={(e) => set("depense", Number(e.target.value))}
          />
          <Input
            label="Avancement (%)"
            type="number"
            min={0}
            max={100}
            value={form.avancement}
            onChange={(e) => set("avancement", Number(e.target.value))}
          />
          <Select
            label="Statut"
            value={form.statut}
            onChange={(e) => set("statut", e.target.value as StatutChantier)}
            options={STATUTS}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          icon={<X size={16} />}
          onClick={() => router.push("/chantiers")}
        >
          Annuler
        </Button>
        <Button type="submit" icon={<Save size={16} />}>
          {initial ? "Enregistrer les modifications" : "Créer le chantier"}
        </Button>
      </div>
    </form>
  );
}
