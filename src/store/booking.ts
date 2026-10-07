"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddonId, PackageId, RoomId } from "@/lib/catalog";
import { emptyGuest, type GuestDetails } from "@/lib/schema";
import type { Selection } from "@/lib/pricing";

interface BookingState extends Selection {
  guest: GuestDetails;
  reference: string | null;
  /** Runtime only, never persisted */
  hydrated: boolean;
  restored: boolean;
  restoredDismissed: boolean;
  setMode: (m: Selection["mode"]) => void;
  setGuests: (n: number) => void;
  setPackage: (id: PackageId) => void;
  setRoom: (id: RoomId) => void;
  setNights: (n: number) => void;
  toggleAddon: (id: AddonId) => void;
  removeAddon: (id: AddonId) => void;
  setGuest: (g: GuestDetails) => void;
  setReference: (r: string) => void;
  dismissRestored: () => void;
  reset: () => void;
}

const initial = {
  mode: "package" as Selection["mode"],
  guests: 2,
  packageId: "costa" as PackageId | null,
  roomId: "ocean" as RoomId | null,
  nights: 4,
  addons: [] as AddonId[],
  guest: emptyGuest,
  reference: null as string | null,
};

export const STORAGE_KEY = "mare-booking";

export const useBooking = create<BookingState>()(
  persist(
    (set) => ({
      ...initial,
      hydrated: false,
      restored: false,
      restoredDismissed: false,
      setMode: (mode) => set({ mode }),
      setGuests: (n) => set({ guests: Math.min(6, Math.max(1, n)) }),
      setPackage: (packageId) => set({ packageId, mode: "package" }),
      setRoom: (roomId) => set({ roomId, mode: "build" }),
      setNights: (n) => set({ nights: Math.min(4, Math.max(1, n)) }),
      toggleAddon: (id) =>
        set((s) => ({ addons: s.addons.includes(id) ? s.addons.filter((a) => a !== id) : [...s.addons, id] })),
      removeAddon: (id) => set((s) => ({ addons: s.addons.filter((a) => a !== id) })),
      setGuest: (guest) => set({ guest }),
      setReference: (reference) => set({ reference }),
      dismissRestored: () => set({ restoredDismissed: true }),
      reset: () => set({ ...initial }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      skipHydration: true,
      partialize: (s) => ({
        mode: s.mode,
        guests: s.guests,
        packageId: s.packageId,
        roomId: s.roomId,
        nights: s.nights,
        addons: s.addons,
        guest: s.guest,
        reference: s.reference,
      }),
    },
  ),
);
