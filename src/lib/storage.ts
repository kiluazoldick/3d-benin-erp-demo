// src/lib/storage.ts
"use client";

/**
 * Petit moteur CRUD basé sur localStorage.
 * Utilisé UNIQUEMENT pour la démo.
 * La version prod utilisera Supabase.
 */

const PREFIX = "btp-erp:";

function key(collection: string): string {
  return `${PREFIX}${collection}`;
}

export function readCollection<T>(collection: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(collection));
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function writeCollection<T>(collection: string, data: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(collection), JSON.stringify(data));
}

export function createItem<T extends { id: string }>(
  collection: string,
  item: Omit<T, "id" | "createdAt"> & { id?: string; createdAt?: string },
): T {
  const list = readCollection<T>(collection);
  const newItem = {
    ...item,
    id: item.id ?? crypto.randomUUID(),
    createdAt: item.createdAt ?? new Date().toISOString(),
  } as unknown as T;
  list.push(newItem);
  writeCollection(collection, list);
  return newItem;
}

export function updateItem<T extends { id: string }>(
  collection: string,
  id: string,
  patch: Partial<T>,
): T | null {
  const list = readCollection<T>(collection);
  const idx = list.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  writeCollection(collection, list);
  return list[idx];
}

export function deleteItem<T extends { id: string }>(
  collection: string,
  id: string,
): boolean {
  const list = readCollection<T>(collection);
  const next = list.filter((i) => i.id !== id);
  if (next.length === list.length) return false;
  writeCollection(collection, next);
  return true;
}

export function getById<T extends { id: string }>(
  collection: string,
  id: string,
): T | null {
  const list = readCollection<T>(collection);
  return list.find((i) => i.id === id) ?? null;
}

/** Utilitaire : vide une collection (utile pour reset démo) */
export function clearCollection(collection: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(collection));
}

/** Utilitaire : vérifie si les données de démo ont déjà été chargées */
export function isSeeded(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(`${PREFIX}seeded`) === "1";
}

export function markSeeded(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PREFIX}seeded`, "1");
}
