"use client";

import { useEffect, useRef, useState } from "react";

export const LAB_ORDERS_KEY = "ebtesamty_lab_orders_v2";
export const LAB_ORDERS_EVENT = "ebtesamty-lab-orders-sync";
export const INVENTORY_ITEMS_KEY = "ebtesamty_inventory_items_v2";
export const INVENTORY_MOVEMENTS_KEY = "ebtesamty_inventory_movements_v2";
export const INVENTORY_EVENT = "ebtesamty-inventory-sync";
export const ATTENDANCE_KEY = "ebtesamty_attendance_v2";
export const ATTENDANCE_EVENT = "ebtesamty-attendance-sync";

export function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * useState backed by localStorage: survives reloads and stays in sync across
 * tabs (storage event) and same-tab widgets (custom sync event).
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  syncEvent?: string
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => readLocalJson<T>(key, initialValue));
  const lastSerialized = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const serialized = JSON.stringify(state);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    try {
      window.localStorage.setItem(key, serialized);
      if (syncEvent) window.dispatchEvent(new Event(syncEvent));
    } catch {
      // storage unavailable — keep in-memory state working
    }
  }, [key, state, syncEvent]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => {
      let raw: string | null = null;
      try {
        raw = window.localStorage.getItem(key);
      } catch {
        return;
      }
      if (!raw || raw === lastSerialized.current) return;
      lastSerialized.current = raw;
      try {
        setState(JSON.parse(raw) as T);
      } catch {}
    };
    window.addEventListener("storage", sync);
    if (syncEvent) window.addEventListener(syncEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      if (syncEvent) window.removeEventListener(syncEvent, sync);
    };
  }, [key, syncEvent]);

  return [state, setState];
}
