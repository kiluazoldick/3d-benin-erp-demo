// src/components/engagements/ReglementModal.tsx
"use client";

import { useState } from "react";
import { Save, Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { formatFCFA, todayISO } from "@/lib/format";
import { updateItem } from "@/lib/storage";
import type { Engagement } from "@/lib/types";

export default function ReglementModal({
  open,
  onClose,
  engagement,
  tiersNom,
}: {
  open: boolean;
  onClose: () => void;
  engagement: Engagement;
  tiersNom: string;
}) {
  const { refresh } = useData();
  const reste = engagement.montant - engagement.montantRegle;

  const [montant, setMontant] = useState<number>(reste);
  const [date, setDate] = useState<string>(todayISO());
  const [notes, setNotes] = useState<string>("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (montant <= 0 || montant > reste) return;

    const nouveauRegle = engagement.montantRegle + montant;
    const nouveauStatut: Engagement["statut"] =
      nouveauRegle >= engagement.montant
        ? "regle"
        : nouveauRegle > 0
          ? "partiel"
          : "ouvert";

    const descriptionMiseAJour = notes
      ? `${engagement.description}\n[Règlement ${date}] ${montant} FCFA — ${notes}`
      : engagement.description;

    updateItem<Engagement>("engagements", engagement.id, {
      montantRegle: nouveauRegle,
      statut: nouveauStatut,
      description: descriptionMiseAJour,
    });

    refresh();
    onClose();
  };

  const isClient = engagement.type === "client";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isClient ? "Encaisser un règlement" : "Payer un fournisseur"}
      subtitle={`${tiersNom} — ${engagement.description.split("\n")[0]}`}
      size="sm"
    >
      <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            backgroundColor: isClient ? "#DCFCE7" : "#FEE2E2",
          }}
        >
          <div>
            <div
              className="text-[11.5px] font-semibold uppercase"
              style={{
                color: isClient ? "#166534" : "#991B1B",
                letterSpacing: "0.05em",
              }}
            >
              {isClient ? "Reste à encaisser" : "Reste à payer"}
            </div>
            <div
              className="mt-1 text-[18px] font-bold"
              style={{ color: isClient ? "#166534" : "#991B1B" }}
            >
              {formatFCFA(reste)}
            </div>
          </div>
          <Wallet
            size={22}
            style={{ color: isClient ? "#166534" : "#991B1B" }}
          />
        </div>

        <Input
          label={isClient ? "Montant encaissé (FCFA)" : "Montant payé (FCFA)"}
          type="number"
          required
          min={1}
          max={reste}
          value={montant}
          onChange={(e) => setMontant(Number(e.target.value) || 0)}
          hint={`Maximum : ${formatFCFA(reste)}`}
        />

        <Input
          label="Date du règlement"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Textarea
          label="Référence / Notes (optionnel)"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            isClient
              ? "Ex. Virement, chèque n°…, espèces"
              : "Ex. Virement bancaire, référence facture"
          }
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            icon={<Save size={15} />}
            variant={isClient ? "primary" : "danger"}
          >
            {isClient ? "Encaisser" : "Payer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
