// src/components/pointage/PointageForm.tsx
"use client";

import { useState, useMemo } from "react";
import { Plus, Check, Clock, Wallet, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { createItem } from "@/lib/storage";
import { formatFCFA, todayISO } from "@/lib/format";
import type { Pointage } from "@/lib/types";

type LigneSaisie = {
  employeId: string;
  heures: number;
  description: string;
  checked: boolean;
};

export default function PointageForm() {
  const { chantiers, employes, refresh } = useData();

  const [date, setDate] = useState<string>(todayISO());
  const [chantierId, setChantierId] = useState<string>("");
  const [lignes, setLignes] = useState<LigneSaisie[]>([]);
  const [success, setSuccess] = useState(false);

  const chantiersActifs = chantiers.filter(
    (c) => c.statut === "en_cours" || c.statut === "planifie",
  );

  // Employés affectés au chantier sélectionné
  const employesDuChantier = useMemo(() => {
    if (!chantierId) return [];
    return employes.filter(
      (e) => e.actif && (e.chantierId === chantierId || !e.chantierId),
    );
  }, [chantierId, employes]);

  // Initialise les lignes quand le chantier change
  const handleChantierChange = (id: string) => {
    setChantierId(id);
    if (!id) {
      setLignes([]);
      return;
    }
    const emp = employes.filter(
      (e) => e.actif && (e.chantierId === id || !e.chantierId),
    );
    setLignes(
      emp.map((e) => ({
        employeId: e.id,
        heures: 8,
        description: "Journée normale",
        checked: false,
      })),
    );
  };

  const toggleLigne = (employeId: string) => {
    setLignes((arr) =>
      arr.map((l) =>
        l.employeId === employeId ? { ...l, checked: !l.checked } : l,
      ),
    );
  };

  const toggleAll = () => {
    const allChecked = lignes.every((l) => l.checked);
    setLignes((arr) => arr.map((l) => ({ ...l, checked: !allChecked })));
  };

  const updateLigne = (
    employeId: string,
    patch: Partial<Omit<LigneSaisie, "employeId">>,
  ) => {
    setLignes((arr) =>
      arr.map((l) => (l.employeId === employeId ? { ...l, ...patch } : l)),
    );
  };

  // Totaux
  const lignesSelectionnees = lignes.filter((l) => l.checked);
  const totalHeures = lignesSelectionnees.reduce((s, l) => s + l.heures, 0);
  const totalCout = lignesSelectionnees.reduce((s, l) => {
    const emp = employes.find((e) => e.id === l.employeId);
    return s + (emp ? (emp.tauxJournalier / 8) * l.heures : 0);
  }, 0);

  const onSubmit = () => {
    if (!chantierId || !date || lignesSelectionnees.length === 0) return;

    lignesSelectionnees.forEach((l) => {
      createItem<Pointage>("pointages", {
        employeId: l.employeId,
        chantierId,
        date: new Date(date).toISOString().split("T")[0],
        heures: l.heures,
        description: l.description,
      });
    });

    refresh();
    setSuccess(true);
    setLignes((arr) => arr.map((l) => ({ ...l, checked: false })));

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
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
        <Plus size={16} style={{ color: C.deep }} />
        <h3 className="text-[15px] font-semibold" style={{ color: C.ink }}>
          Nouvelle saisie de pointage
        </h3>
      </div>

      {/* Sélection date + chantier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Date du pointage"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Select
          label="Chantier"
          value={chantierId}
          onChange={(e) => handleChantierChange(e.target.value)}
          placeholder="— Sélectionner un chantier —"
          options={chantiersActifs.map((c) => ({
            value: c.id,
            label: c.nom,
          }))}
          required
        />
      </div>

      {/* Liste des employés */}
      {chantierId && (
        <div className="mt-6">
          {employesDuChantier.length === 0 ? (
            <div
              className="rounded-xl p-6 text-center text-[13px]"
              style={{ backgroundColor: C.smoke, color: C.slate }}
            >
              Aucun employé actif à affecter. Ajoutez des employés au préalable.
            </div>
          ) : (
            <>
              {/* Barre de contrôle */}
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-[12.5px] font-semibold inline-flex items-center gap-1.5"
                  style={{ color: C.deep }}
                >
                  <Users size={13} />
                  {lignes.every((l) => l.checked)
                    ? "Tout décocher"
                    : "Tout cocher"}
                </button>
                <span
                  className="text-[12.5px] font-semibold"
                  style={{ color: C.slate }}
                >
                  {lignesSelectionnees.length} / {lignes.length} sélectionné(s)
                </span>
              </div>

              {/* Tableau */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}
              >
                {/* Header */}
                <div
                  className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 text-[11px] font-semibold uppercase"
                  style={{
                    backgroundColor: C.smoke,
                    color: C.slate,
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div className="col-span-1" />
                  <div className="col-span-4">Employé</div>
                  <div className="col-span-2">Heures</div>
                  <div className="col-span-4">Description</div>
                  <div className="col-span-1 text-right">Coût</div>
                </div>

                {lignes.map((l, idx) => {
                  const emp = employes.find((e) => e.id === l.employeId);
                  if (!emp) return null;
                  const cout = (emp.tauxJournalier / 8) * l.heures;

                  return (
                    <div
                      key={l.employeId}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 px-4 py-3 items-center transition-colors"
                      style={{
                        borderBottom:
                          idx < lignes.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                        backgroundColor: l.checked ? "#EFF6FF" : C.white,
                      }}
                    >
                      <div className="md:col-span-1">
                        <input
                          type="checkbox"
                          checked={l.checked}
                          onChange={() => toggleLigne(l.employeId)}
                          className="h-4 w-4 cursor-pointer"
                          style={{ accentColor: C.deep }}
                        />
                      </div>

                      <div className="md:col-span-4 flex items-center gap-2.5 min-w-0">
                        <div
                          className="grid place-items-center h-9 w-9 rounded-full text-[11px] font-bold shrink-0"
                          style={{
                            backgroundColor: C.deep,
                            color: C.white,
                          }}
                        >
                          {emp.prenom[0]}
                          {emp.nom[0]}
                        </div>
                        <div className="min-w-0">
                          <div
                            className="text-[13px] font-semibold truncate"
                            style={{ color: C.ink }}
                          >
                            {emp.prenom} {emp.nom}
                          </div>
                          <div
                            className="text-[11.5px] truncate"
                            style={{ color: C.slate }}
                          >
                            {formatFCFA(emp.tauxJournalier)}/j
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          min={0}
                          max={24}
                          step="0.5"
                          value={l.heures}
                          onChange={(e) =>
                            updateLigne(l.employeId, {
                              heures: Number(e.target.value) || 0,
                            })
                          }
                          disabled={!l.checked}
                          className="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
                          style={{
                            backgroundColor: l.checked ? C.white : C.smoke,
                            border: `1px solid ${C.border}`,
                            color: C.ink,
                          }}
                        />
                      </div>

                      <div className="md:col-span-4">
                        <input
                          type="text"
                          value={l.description}
                          onChange={(e) =>
                            updateLigne(l.employeId, {
                              description: e.target.value,
                            })
                          }
                          disabled={!l.checked}
                          placeholder="Ex. Coffrage, maçonnerie…"
                          className="w-full h-9 px-3 rounded-lg text-[13px] outline-none"
                          style={{
                            backgroundColor: l.checked ? C.white : C.smoke,
                            border: `1px solid ${C.border}`,
                            color: C.ink,
                          }}
                        />
                      </div>

                      <div className="md:col-span-1 text-right">
                        <span
                          className="text-[12.5px] font-semibold"
                          style={{
                            color: l.checked ? C.deep : C.light,
                          }}
                        >
                          {l.checked ? formatFCFA(cout) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totaux + bouton */}
              <div
                className="mt-5 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ backgroundColor: C.smoke }}
              >
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Clock size={16} style={{ color: C.deep }} />
                    <div>
                      <div
                        className="text-[11px] uppercase font-semibold"
                        style={{ color: C.slate, letterSpacing: "0.05em" }}
                      >
                        Total heures
                      </div>
                      <div
                        className="text-[15px] font-bold"
                        style={{ color: C.ink }}
                      >
                        {totalHeures} h
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet size={16} style={{ color: C.warning }} />
                    <div>
                      <div
                        className="text-[11px] uppercase font-semibold"
                        style={{ color: C.slate, letterSpacing: "0.05em" }}
                      >
                        Coût main-d&apos;œuvre
                      </div>
                      <div
                        className="text-[15px] font-bold"
                        style={{ color: C.warning }}
                      >
                        {formatFCFA(totalCout)}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onSubmit}
                  disabled={lignesSelectionnees.length === 0}
                  icon={success ? <Check size={16} /> : <Plus size={16} />}
                >
                  {success
                    ? "Pointage enregistré !"
                    : `Enregistrer ${lignesSelectionnees.length} pointage(s)`}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {!chantierId && (
        <div
          className="mt-6 rounded-xl p-8 text-center text-[13px]"
          style={{ backgroundColor: C.smoke, color: C.slate }}
        >
          Sélectionnez une date et un chantier pour commencer la saisie.
        </div>
      )}
    </div>
  );
}
