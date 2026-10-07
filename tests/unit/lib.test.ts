import { describe, expect, it, vi } from "vitest";
import { priceLines, totalOf, usd, type Selection } from "@/lib/pricing";
import { guestSchema, emptyGuest } from "@/lib/schema";
import { ApiError, fetchAddons, fetchPackages, shouldFail, submitBooking } from "@/lib/mockApi";
import { useBooking } from "@/store/booking";

const base: Selection = { mode: "package", guests: 2, packageId: "costa", roomId: "ocean", nights: 4, addons: [] };

describe("pricing", () => {
  it("formats USD", () => expect(usd(8100)).toBe("$8,100"));
  it("prices Costa plus yacht day for 2 guests at $8,100", () => {
    expect(totalOf({ ...base, addons: ["yacht"] })).toBe(8100);
  });
  it("prices build-your-own (suite, 4 nights, 2 guests, transfers, gala, yacht) at $6,520", () => {
    const s: Selection = { ...base, mode: "build", addons: ["transfers", "gala", "yacht"] };
    // 520 × 4 × 2 + (90 + 240 + 850) × 2
    expect(totalOf(s)).toBe(6520);
  });
  it("labels lines the way the design does", () => {
    expect(priceLines(base)[0].label).toBe("Costa · 2 × $3,200");
    expect(priceLines({ ...base, mode: "build" })[0].label).toBe("Ocean-view suite · 2 × 4 nights × $520");
  });
  it("leaves unavailable add-ons out of the total", () => {
    const s = { ...base, addons: ["yacht", "transfers"] as Selection["addons"] };
    expect(totalOf(s, ["yacht"])).toBe(6400 + 180);
  });
});

const valid = {
  name: "Sofia Marin",
  email: "sofia.marin@example.com",
  phone: "+34 612 345 678",
  nationality: "Spain",
  flight: "IB6275",
  arrivalDate: "2026-12-09",
  arrivalTime: "14:30",
};

describe("guestSchema", () => {
  it("accepts the demo guest", () => expect(guestSchema.safeParse(valid).success).toBe(true));
  it("rejects an empty form with a message per required field", () => {
    const r = guestSchema.safeParse(emptyGuest);
    expect(r.success).toBe(false);
    expect(r.error?.issues.length).toBeGreaterThanOrEqual(7);
  });
  it.each([
    ["email", "not-an-email"],
    ["phone", "123"],
    ["flight", "6275IB"],
    ["flight", "IB62750"],
    ["arrivalDate", "2026-12-07"],
    ["arrivalDate", "2026-12-11"],
  ])("rejects %s = %s", (k, v) => {
    expect(guestSchema.safeParse({ ...valid, [k]: v }).success).toBe(false);
  });
  it.each(["2026-12-08", "2026-12-09", "2026-12-10"])("accepts arrival %s", (d) => {
    expect(guestSchema.safeParse({ ...valid, arrivalDate: d }).success).toBe(true);
  });
});

describe("mockApi", () => {
  it("resolves packages and add-ons after the delay", async () => {
    vi.useFakeTimers();
    const p = fetchPackages();
    const a = fetchAddons();
    await vi.advanceTimersByTimeAsync(800);
    expect((await p).length).toBe(3);
    expect((await a).length).toBe(6);
  });
  it("fails when the toggle is set", async () => {
    vi.useFakeTimers();
    window.localStorage.setItem("mare:mock-fail", "packages");
    expect(shouldFail("packages")).toBe(true);
    expect(shouldFail("addons")).toBe(false);
    const p = fetchPackages();
    const caught = p.catch((e) => e);
    await vi.advanceTimersByTimeAsync(800);
    expect(await caught).toBeInstanceOf(ApiError);
  });
  it("marks sold-out and low-stock items from the URL toggles", async () => {
    vi.useFakeTimers();
    window.localStorage.setItem("mare:mock-soldout", "soberano,yacht");
    window.localStorage.setItem("mare:mock-low", "marea");
    const p = fetchPackages();
    const a = fetchAddons();
    await vi.advanceTimersByTimeAsync(800);
    const pk = await p;
    expect(pk.find((x) => x.id === "soberano")?.soldOut).toBe(true);
    expect(pk.find((x) => x.id === "marea")?.left).toBe(2);
    expect((await a).find((x) => x.id === "yacht")?.soldOut).toBe(true);
  });
  it("returns a booking reference", async () => {
    vi.useFakeTimers();
    const r = submitBooking(base, { ...emptyGuest, ...valid });
    await vi.advanceTimersByTimeAsync(1200);
    expect((await r).reference).toMatch(/^MC26-[A-Z0-9]{6}$/);
  });
});

describe("booking store", () => {
  it("clamps guests to 1–6 and nights to 1–4", () => {
    const s = useBooking.getState();
    s.setGuests(99);
    expect(useBooking.getState().guests).toBe(6);
    s.setGuests(0);
    expect(useBooking.getState().guests).toBe(1);
    s.setNights(9);
    expect(useBooking.getState().nights).toBe(4);
  });
  it("toggles and removes add-ons", () => {
    const s = useBooking.getState();
    s.toggleAddon("spa");
    expect(useBooking.getState().addons).toEqual(["spa"]);
    s.toggleAddon("spa");
    expect(useBooking.getState().addons).toEqual([]);
    s.toggleAddon("gala");
    s.removeAddon("gala");
    expect(useBooking.getState().addons).toEqual([]);
  });
  it("switches mode when a package or room is chosen", () => {
    useBooking.getState().setRoom("villa");
    expect(useBooking.getState().mode).toBe("build");
    useBooking.getState().setPackage("marea");
    expect(useBooking.getState().mode).toBe("package");
  });
  it("persists choices but not the runtime flags", () => {
    useBooking.getState().setGuests(3);
    const saved = JSON.parse(window.localStorage.getItem("mare-booking")!).state;
    expect(saved.guests).toBe(3);
    expect(saved).not.toHaveProperty("hydrated");
    expect(saved).not.toHaveProperty("restored");
  });
  it("reset restores the defaults", () => {
    useBooking.getState().setGuests(5);
    useBooking.getState().reset();
    expect(useBooking.getState().guests).toBe(2);
  });
});
