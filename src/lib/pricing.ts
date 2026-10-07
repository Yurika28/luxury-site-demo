import { ADDONS, PACKAGES, ROOMS, type AddonId, type PackageId, type RoomId } from "./catalog";

export interface Selection {
  mode: "package" | "build";
  guests: number;
  packageId: PackageId | null;
  roomId: RoomId | null;
  nights: number;
  addons: AddonId[];
}
export interface PriceLine {
  label: string;
  amount: number;
}

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function priceLines(s: Selection, unavailable: AddonId[] = []): PriceLine[] {
  const lines: PriceLine[] = [];
  if (s.mode === "package") {
    const p = PACKAGES.find((x) => x.id === s.packageId);
    if (p) lines.push({ label: `${p.name} · ${s.guests} × ${usd(p.price)}`, amount: p.price * s.guests });
  } else {
    const r = ROOMS.find((x) => x.id === s.roomId);
    if (r) lines.push({ label: `${r.name} · ${s.guests} × ${s.nights} nights × ${usd(r.perNight)}`, amount: r.perNight * s.nights * s.guests });
  }
  for (const id of s.addons) {
    if (unavailable.includes(id)) continue;
    const a = ADDONS.find((x) => x.id === id);
    if (a) lines.push({ label: `${a.name} · ${s.guests} × ${usd(a.price)}`, amount: a.price * s.guests });
  }
  return lines;
}

export const totalOf = (s: Selection, unavailable: AddonId[] = []) =>
  priceLines(s, unavailable).reduce((t, l) => t + l.amount, 0);
