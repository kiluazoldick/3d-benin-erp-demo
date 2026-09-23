// src/components/pointage/PointageHistorique.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, Clock, Wallet } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { C } from "@/lib/theme";
import { useData } from "@/context/DataContext";
import { deleteItem } from "@/lib/storage";
import { formatFCFA, formatDate } from "@/lib/format";
import type { Pointage } from "@/lib/types";

export default function PointageHistorique() {
  const { pointages, employes, chantiers, refresh } = useData();
  const [search, setSearch] = useState("");
  const [chantierFiltre, setChantierFiltre] = useState<string>("tous");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...pointages];

    if (chantierFiltre !== "tous")
      list = list.filter((p) => p.chantierId === chantierFiltre);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const emp = employes.find((e) => e.id === p.employeId);
        const ch = chantiers.find((c) => c.id === p.chantierId);
        return (
          (emp && `${emp.prenom} ${emp.nom}`.toLowerCase().includes(q)) ||
          (ch && ch.nom.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
        );
      });
    }

    return list
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 100); // limite pour la démo
  }, [pointages, employes, chantiers, search, chantierFiltre]);

  const handleDelete = (id: string) => {
    if (!window.confirm("Supprimer ce pointage ?")) return;
    deleteItem<Pointage>("pointages", id);
    refresh();
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        backgroundColor: C.white,
        border: `1px solid ${C.border}`,
      }}
    >
      {/* En-tête + filtres */}
      <div
        className="px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div>
          <h3 className="text-[15px] font-semibold" style={{ color: C.ink }}>
            Historique des pointages
          </h3>
          <p className="text-[13px] mt-0.5" style={{ color: C.slate }}>
            {filtered.length} pointage(s) affiché(s)
          </p>
        </div>

        <div className="lg:ml-auto flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div
            className="flex items-center gap-2 h-10 px-4 rounded-xl min-w-[220px]"
            style={{
              backgroundColor: C.smoke,
              border: `1px solid ${C.border}`,
            }}
          >
            <Search size={16} style={{ color: C.light }} />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[13.5px]"
              style={{ color: C.ink }}
            />
          </div>

          <select
            value={chantierFiltre}
            onChange={(e) => setChantierFiltre(e.target.value)}
            className="h-10 px-3 rounded-xl text-[13px] font-medium outline-none cursor-pointer"
            style={{
              backgroundColor: C.smoke,
              color: C.ink,
              border: `1px solid ${C.border}`,
            }}
          >
            <option value="tous">Tous les chantiers</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div
          className="p-12 text-center text-[13px]"
          style={{ color: C.slate }}
        >
          Aucun pointage trouvé.
        </div>
      ) : (
        <div>
          {/* Header desktop */}
          <div
            className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-[11.5px] font-semibold uppercase"
            style={{
              backgroundColor: C.smoke,
              color: C.slate,
              letterSpacing: "0.05em",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div className="col-span-2">Date</div>
            <div className="col-span-3">Employé</div>
            <div className="col-span-3">Chantier</div>
            <div className="col-span-1 text-right">Heures</div>
            <div className="col-span-2 text-right">Coût</div>
            <div className="col-span-1 text-right"></div>
          </div>

          {filtered.map((p, idx) => {
            const emp = employes.find((e) => e.id === p.employeId);
            const ch = chantiers.find((c) => c.id === p.chantierId);
            const cout = emp ? (emp.tauxJournalier / 8) * p.heures : 0;
            const isHover = hoverId === p.id;

            return (
              <div
                key={p.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-3.5 items-center transition-colors"
                style={{
                  borderBottom:
                    idx < filtered.length - 1
                      ? `1px solid ${C.border}`
                      : "none",
                  backgroundColor: isHover ? C.smoke : "transparent",
                }}
                onMouseEnter={() => setHoverId(p.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                <div
                  className="lg:col-span-2 text-[13px] font-semibold"
                  style={{ color: C.ink }}
                >
                  {formatDate(p.date)}
                </div>

                <div className="lg:col-span-3 flex items-center gap-2 min-w-0">
                  {emp && (
                    <>
                      <div
                        className="grid place-items-center h-8 w-8 rounded-full text-[10.5px] font-bold shrink-0"
                        style={{
                          backgroundColor: C.smoke,
                          color: C.deep,
                        }}
                      >
                        {emp.prenom[0]}
                        {emp.nom[0]}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-[13px] font-medium truncate"
                          style={{ color: C.ink }}
                        >
                          {emp.prenom} {emp.nom}
                        </div>
                        <div
                          className="text-[11.5px] truncate"
                          style={{ color: C.slate }}
                        >
                          {p.description}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="lg:col-span-3 text-[12.5px] truncate"
                  style={{ color: C.slate }}
                >
                  {ch?.nom ?? "—"}
                </div>

                <div className="lg:col-span-1 text-right">
                  <span
                    className="inline-flex items-center gap-1 text-[13px] font-bold"
                    style={{ color: C.deep }}
                  >
                    <Clock size={12} />
                    {p.heures}h
                  </span>
                </div>

                <div className="lg:col-span-2 text-right">
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: C.warning }}
                  >
                    {formatFCFA(cout)}
                  </span>
                </div>

                <div className="lg:col-span-1 flex lg:justify-end">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="grid place-items-center h-8 w-8 rounded-lg"
                    style={{ color: C.danger }}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
