import { ADDONS, PACKAGES, type Addon, type Pkg } from "./catalog";
import type { GuestDetails } from "./schema";
import type { Selection } from "./pricing";

export const MOCK_DELAY_MS = 800;
const STORE_PREFIX = "mare:mock-";
export type FailTarget = "packages" | "addons" | "submit";

/** Reads a mock toggle from the URL (`?fail=`) or localStorage (`mare:mock-fail`). */
function flag(name: string): string | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get(name);
  if (q !== null) return q;
  try {
    return window.localStorage.getItem(STORE_PREFIX + name);
  } catch {
    return null;
  }
}

/** `?fail=packages|addons|submit|all` forces that call to fail. */
export function shouldFail(target: FailTarget): boolean {
  const v = flag("fail");
  return v === "all" || v === target;
}
/** `?soldout=soberano,yacht` marks packages or add-ons as sold out. */
const soldOut = () => (flag("soldout") ?? "").split(",").filter(Boolean);
/** `?low=marea` shows "Only 2 places left". */
const lowStock = () => (flag("low") ?? "").split(",").filter(Boolean);

export class ApiError extends Error {
  constructor(public target: FailTarget) {
    super(`Mock API failed: ${target}`);
  }
}

const wait = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms));

export async function fetchPackages(): Promise<Pkg[]> {
  await wait();
  if (shouldFail("packages")) throw new ApiError("packages");
  const gone = soldOut();
  const low = lowStock();
  return PACKAGES.map((p) => ({ ...p, soldOut: gone.includes(p.id), left: low.includes(p.id) ? 2 : undefined }));
}

export async function fetchAddons(): Promise<Addon[]> {
  await wait();
  if (shouldFail("addons")) throw new ApiError("addons");
  const gone = soldOut();
  return ADDONS.map((a) => ({ ...a, soldOut: gone.includes(a.id) }));
}

export async function submitBooking(sel: Selection, guest: GuestDetails): Promise<{ reference: string }> {
  void sel;
  void guest;
  await wait(1200);
  if (shouldFail("submit")) throw new ApiError("submit");
  return { reference: "MC26-" + Math.random().toString(36).slice(2, 8).toUpperCase() };
}
