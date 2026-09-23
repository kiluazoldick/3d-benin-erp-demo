// src/components/factures/PaiementModal.tsx
"use client";

import { useState } from "react";
import { Save, Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { C } from "@/lib/theme";
import { formatFCFA, todayISO } from "@/lib/format";
import { updateItem } from "@/lib/storage";
import { useData } from "@/context/DataContext";
import type { Facture, Engagement } from "@/lib/types";

export default function PaiementModal({
  open,
  onClose,
  facture,
}: {
  open: boolean;
  onClose: () => void;
  facture: Facture;
}) {
  const { engagements, refresh } = useData();
  const reste = facture.montantTTC - facture.montantPaye;

  const [montant, setMontant] = useState<number>(reste);
  const [date, setDate] = useState<string>(todayISO());
  const [notes, setNotes] = useState<string>("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (montant <= 0 || montant > reste) return;

    const nouveauPaye = facture.montantPaye + montant;
    const nouveauStatut: Facture["statut"] =
      nouveauPaye >= facture.montantTTC ? "payee" : "envoyee";

    updateItem<Facture>("factures", facture.id, {
      montantPaye: nouveauPaye,
      statut: nouveauStatut,
      notes: notes
        ? `${facture.notes}\n[Paiement ${date}] ${montant} FCFA — ${notes}`
        : facture.notes,
    });

    // Mettre à jour l'engagement client associé
    const eng = engagements.find(
      (e) =>
        e.type === "client" &&
        e.description.includes(facture.numero) &&
        e.statut !== "regle",
    );
    if (eng) {
      const nouveauRegle = eng.montantRegle + montant;
      updateItem<Engagement>("engagements", eng.id, {
        montantRegle: nouveauRegle,
        statut:
          nouveauRegle >= eng.montant
            ? "regle"
            : nouveauRegle > 0
              ? "partiel"
              : "ouvert",
      });
    }

    refresh();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enregistrer un paiement"
      subtitle={`Facture ${facture.numero}`}
      size="sm"
    >
      <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: C.smoke }}
        >
          <div>
            <div
              className="text-[11.5px] font-semibold uppercase"
              style={{ color: C.slate, letterSpacing: "0.05em" }}
            >
              Reste à payer
            </div>
            <div
              className="mt-1 text-[18px] font-bold"
              style={{ color: C.danger }}
            >
              {formatFCFA(reste)}
            </div>
          </div>
          <Wallet size={22} style={{ color: C.danger }} />
        </div>

        <Input
          label="Montant reçu (FCFA)"
          type="number"
          required
          min={1}
          max={reste}
          value={montant}
          onChange={(e) => setMontant(Number(e.target.value) || 0)}
          hint={`Maximum : ${formatFCFA(reste)}`}
        />

        <Input
          label="Date du paiement"
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
          placeholder="Ex. Virement bancaire, chèque n°…, espèces"
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" icon={<Save size={15} />}>
            Enregistrer le paiement
          </Button>
        </div>
      </form>
    </Modal>
  );
}
