// src/lib/format.ts

export function formatFCFA(montant: number): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(montant) + " FCFA"
  );
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateCourt(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function joursRestants(dateEcheance: string): number {
  const now = new Date();
  const ech = new Date(dateEcheance);
  const diff = Math.ceil(
    (ech.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff;
}

export function initiales(nom: string, prenom?: string): string {
  if (prenom) return (nom[0] + prenom[0]).toUpperCase();
  const parts = nom.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
