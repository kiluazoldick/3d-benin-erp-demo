// src/components/materiaux/MouvementModal.tsx
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Save } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem, updateItem } from "@/lib/storage";
import { todayISO } from "@/lib/format";
import type { Materiau, MouvementMateriau } from "@/lib/types";

export default function MouvementModal({
  open,
  onClose,
  materiau,
}: {
  open: boolean;
  onClose: () => void;
  materiau: Materiau;
}) {
  const { chantiers, refresh } = useData();

  const [type, setType] = useState<"entree" | "sortie">("entree");
  const [quantite, setQuantite] = useState<number>(1);
  const [chantierId, setChantierId] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [notes, setNotes] = useState<string>("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantite <= 0) return;
    if (type === "sortie" && quantite > materiau.stock) {
      alert("Quantité supérieure au stock disponible.");
      return;
    }

    // 1. Enregistrer le mouvement
    createItem<MouvementMateriau>("mouvements", {
      materiauId: materiau.id,
      chantierId: chantierId || "",
      type,
      quantite,
      date: new Date(date).toISOString().split("T")[0],
      notes,
    });

    // 2. Mettre à jour le stock du matériau
    const nouveauStock =
      type === "entree" ? materiau.stock + quantite : materiau.stock - quantite;

    updateItem<Materiau>("materiaux", materiau.id, {
      stock: nouveauStock,
    });

    refresh();
    onClose();
    setQuantite(1);
    setChantierId("");
    setNotes("");
    setType("entree");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mouvement de stock"
      subtitle={`${materiau.nom} — Stock actuel : ${materiau.stock} ${materiau.unite}`}
      size="sm"
    >
      <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
        {/* Type */}
        <div>
          <label
            className="block text-[12.5px] font-semibold mb-2"
            style={{ color: C.ink }}
          >
            Type de mouvement
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("entree")}
              className="h-12 rounded-xl font-semibold text-[13.5px] inline-flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: type === "entree" ? "#DCFCE7" : C.smoke,
                color: type === "entree" ? "#166534" : C.slate,
                border: `1px solid ${type === "entree" ? "#86EFAC" : C.border}`,
              }}
            >
              <ArrowDown size={15} /> Entrée
            </button>
            <button
              type="button"
              onClick={() => setType("sortie")}
              className="h-12 rounded-xl font-semibold text-[13.5px] inline-flex items-center justify-center gap-2 transition-colors"
              style={{
                backgroundColor: type === "sortie" ? "#FEE2E2" : C.smoke,
                color: type === "sortie" ? "#991B1B" : C.slate,
                border: `1px solid ${type === "sortie" ? "#FCA5A5" : C.border}`,
              }}
            >
              <ArrowUp size={15} /> Sortie
            </button>
          </div>
        </div>

        <Input
          label={`Quantité (${materiau.unite})`}
          type="number"
          required
          min={1}
          max={type === "sortie" ? materiau.stock : undefined}
          value={quantite}
          onChange={(e) => setQuantite(Number(e.target.value) || 0)}
          hint={
            type === "sortie"
              ? `Maximum : ${materiau.stock} ${materiau.unite}`
              : undefined
          }
        />

        <Select
          label={
            type === "entree"
              ? "Chantier destinataire (optionnel)"
              : "Chantier consommateur"
          }
          value={chantierId}
          onChange={(e) => setChantierId(e.target.value)}
          placeholder="— Non affecté —"
          options={chantiers.map((c) => ({ value: c.id, label: c.nom }))}
        />

        <Input
          label="Date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Textarea
          label="Notes (optionnel)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            type === "entree"
              ? "Ex. Livraison fournisseur, référence BL n°…"
              : "Ex. Utilisé pour coulage dalle"
          }
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            icon={<Save size={15} />}
            variant={type === "sortie" ? "danger" : "primary"}
          >
            Enregistrer {type === "entree" ? "l'entrée" : "la sortie"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
