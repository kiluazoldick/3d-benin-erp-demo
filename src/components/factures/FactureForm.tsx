// src/components/factures/FactureForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Plus, Trash2, Calculator } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem, updateItem, readCollection } from "@/lib/storage";
import { formatFCFA, todayISO } from "@/lib/format";
import { TVA_TAUX } from "@/lib/constants";
import type { Facture, LigneDevis, StatutFacture } from "@/lib/types";

const STATUTS: { value: StatutFacture; label: string }[] = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoyee", label: "Envoyée" },
  { value: "payee", label: "Payée" },
  { value: "impayee", label: "Impayée" },
];

function generateNumero(): string {
  const all = readCollection<Facture>("factures");
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  const nums = all
    .filter((f) => f.numero.startsWith(prefix))
    .map((f) => parseInt(f.numero.replace(prefix, ""), 10) || 0);
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

const emptyLigne = (): LigneDevis => ({
  designation: "",
  quantite: 1,
  prixUnitaire: 0,
});

export default function FactureForm({ initial }: { initial?: Facture }) {
  const router = useRouter();
  const { clients, chantiers, refresh } = useData();

  const [form, setForm] = useState<Omit<Facture, "id" | "createdAt">>({
    numero: initial?.numero ?? generateNumero(),
    clientId: initial?.clientId ?? "",
    chantierId: initial?.chantierId ?? "",
    devisId: initial?.devisId,
    date: initial?.date?.split("T")[0] ?? todayISO(),
    dateEcheance: initial?.dateEcheance?.split("T")[0] ?? "",
    montantHT: initial?.montantHT ?? 0,
    tva: initial?.tva ?? 0,
    montantTTC: initial?.montantTTC ?? 0,
    montantPaye: initial?.montantPaye ?? 0,
    statut: initial?.statut ?? "brouillon",
    notes: initial?.notes ?? "",
  });

  // Lignes locales (non persistées sur Facture — juste pour la saisie)
  const [lignes, setLignes] = useState<LigneDevis[]>([emptyLigne()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totaux = (() => {
    const ht = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0);
    const tva = ht * TVA_TAUX;
    return { ht, tva, ttc: ht + tva };
  })();

  const set = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const updateLigne = (idx: number, patch: Partial<LigneDevis>) => {
    setLignes((arr) => arr.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const addLigne = () => setLignes((arr) => [...arr, emptyLigne()]);
  const removeLigne = (idx: number) =>
    setLignes((arr) => arr.filter((_, i) => i !== idx));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.clientId) e.clientId = "Sélectionnez un client";
    if (!form.date) e.date = "Date requise";
    if (!form.dateEcheance) e.dateEcheance = "Échéance requise";
    if (lignes.length === 0) e.lignes = "Ajoutez au moins une ligne";
    if (lignes.some((l) => !l.designation.trim()))
      e.lignes = "Toutes les lignes doivent avoir une désignation";
    if (lignes.some((l) => l.quantite <= 0 || l.prixUnitaire <= 0))
      e.lignes = "Quantités et prix doivent être > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload: Omit<Facture, "id" | "createdAt"> = {
      ...form,
      date: new Date(form.date).toISOString(),
      dateEcheance: new Date(form.dateEcheance).toISOString(),
      montantHT: totaux.ht,
      tva: totaux.tva,
      montantTTC: totaux.ttc,
    };

    if (initial) {
      updateItem<Facture>("factures", initial.id, payload);
    } else {
      createItem<Facture>("factures", payload);
    }
    refresh();
    router.push("/factures");
  };

  const chantiersDuClient = chantiers.filter(
    (c) => c.clientId === form.clientId,
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Bloc 1 */}
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
          Informations de la facture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Numéro de facture"
            value={form.numero}
            onChange={(e) => set("numero", e.target.value)}
            required
          />
          <Select
            label="Client"
            required
            value={form.clientId}
            onChange={(e) => {
              set("clientId", e.target.value);
              set("chantierId", "");
            }}
            placeholder="— Sélectionner un client —"
            options={clients.map((c) => ({ value: c.id, label: c.nom }))}
            error={errors.clientId}
          />
          <Select
            label="Chantier lié (optionnel)"
            value={form.chantierId ?? ""}
            onChange={(e) => set("chantierId", e.target.value)}
            placeholder={
              form.clientId
                ? chantiersDuClient.length
                  ? "— Aucun —"
                  : "— Aucun chantier pour ce client —"
                : "Sélectionnez d'abord un client"
            }
            options={chantiersDuClient.map((c) => ({
              value: c.id,
              label: c.nom,
            }))}
          />
          <Select
            label="Statut"
            value={form.statut}
            onChange={(e) => set("statut", e.target.value as StatutFacture)}
            options={STATUTS}
          />
          <Input
            label="Date d'émission"
            type="date"
            required
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            error={errors.date}
          />
          <Input
            label="Date d'échéance"
            type="date"
            required
            value={form.dateEcheance}
            onChange={(e) => set("dateEcheance", e.target.value)}
            error={errors.dateEcheance}
          />
        </div>
      </div>

      {/* Bloc 2 : lignes */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: C.white,
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          className="flex items-center justify-between mb-5 pb-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <h3 className="text-[15px] font-semibold" style={{ color: C.ink }}>
            Lignes de la facture
          </h3>
          <Button
            type="button"
            size="sm"
            variant="outline"
            icon={<Plus size={14} />}
            onClick={addLigne}
          >
            Ajouter une ligne
          </Button>
        </div>

        {errors.lignes && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-[12.5px]"
            style={{ backgroundColor: "#FEE2E2", color: C.danger }}
          >
            {errors.lignes}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {lignes.map((l, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end md:items-center p-3 rounded-xl"
              style={{ backgroundColor: C.smoke }}
            >
              <div className="md:col-span-5">
                <input
                  type="text"
                  value={l.designation}
                  onChange={(e) =>
                    updateLigne(idx, { designation: e.target.value })
                  }
                  placeholder="Désignation"
                  className="w-full h-10 px-3 rounded-lg text-[13px] outline-none"
                  style={{
                    backgroundColor: C.white,
                    border: `1px solid ${C.border}`,
                    color: C.ink,
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={l.quantite}
                  onChange={(e) =>
                    updateLigne(idx, { quantite: Number(e.target.value) || 0 })
                  }
                  placeholder="Qté"
                  className="w-full h-10 px-3 rounded-lg text-[13px] outline-none"
                  style={{
                    backgroundColor: C.white,
                    border: `1px solid ${C.border}`,
                    color: C.ink,
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={l.prixUnitaire}
                  onChange={(e) =>
                    updateLigne(idx, {
                      prixUnitaire: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="Prix unit."
                  className="w-full h-10 px-3 rounded-lg text-[13px] outline-none"
                  style={{
                    backgroundColor: C.white,
                    border: `1px solid ${C.border}`,
                    color: C.ink,
                  }}
                />
              </div>
              <div className="md:col-span-2 text-right">
                <span
                  className="font-semibold text-[13px]"
                  style={{ color: C.ink }}
                >
                  {formatFCFA(l.quantite * l.prixUnitaire)}
                </span>
              </div>
              <div className="md:col-span-1 flex md:justify-end">
                <button
                  type="button"
                  onClick={() => removeLigne(idx)}
                  disabled={lignes.length === 1}
                  className="grid place-items-center h-10 w-10 rounded-lg"
                  style={{
                    color: C.danger,
                    opacity: lignes.length === 1 ? 0.3 : 1,
                    cursor: lignes.length === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloc 3 : totaux */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          backgroundColor: C.white,
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          className="flex items-center gap-3 mb-5 pb-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <Calculator size={16} style={{ color: C.deep }} />
          <h3 className="text-[15px] font-semibold" style={{ color: C.ink }}>
            Récapitulatif
          </h3>
        </div>

        <div className="flex flex-col gap-3 max-w-md ml-auto">
          <Row label="Total HT" value={formatFCFA(totaux.ht)} />
          <Row
            label={`TVA (${Math.round(TVA_TAUX * 100)}%)`}
            value={formatFCFA(totaux.tva)}
          />
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <Row label="Total TTC" value={formatFCFA(totaux.ttc)} strong />
          </div>
        </div>

        <div className="mt-6">
          <Textarea
            label="Notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Conditions de paiement, référence, etc."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          icon={<X size={16} />}
          onClick={() => router.push("/factures")}
        >
          Annuler
        </Button>
        <Button type="submit" icon={<Save size={16} />}>
          {initial ? "Enregistrer les modifications" : "Créer la facture"}
        </Button>
      </div>
    </form>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={strong ? "text-[15px] font-semibold" : "text-[13.5px]"}
        style={{ color: strong ? C.ink : C.slate }}
      >
        {label}
      </span>
      <span
        className={
          strong ? "text-[18px] font-bold" : "text-[14px] font-semibold"
        }
        style={{ color: strong ? C.deep : C.ink }}
      >
        {value}
      </span>
    </div>
  );
}
