// Fictional demo data. Prices are USD, per person.
export const EVENT = {
  name: "Maré Caribe",
  place: "Cap Cana, Dominican Republic",
  dates: "10–13 December 2026",
  arrival: "2026-12-09",
  maxGuests: 6,
} as const;

export type PackageId = "marea" | "costa" | "soberano";
export type RoomId = "garden" | "ocean" | "villa";
export type AddonId = "transfers" | "gala" | "farewell" | "chef" | "yacht" | "spa";

export interface Pkg {
  id: PackageId;
  name: string;
  sub: string;
  nights: number;
  price: number;
  items: string[];
  left?: number;
  soldOut?: boolean;
}
export interface Room {
  id: RoomId;
  name: string;
  perNight: number;
  note: string;
}
export interface Addon {
  id: AddonId;
  name: string;
  price: number;
  desc: string;
  group: "Arrival" | "Evenings" | "Days";
  soldOut?: boolean;
}

export const PACKAGES: Pkg[] = [
  { id: "marea", name: "Marea", sub: "Three nights, garden-view room", nights: 3, price: 1800, items: ["Welcome dinner and a beach day", "Shared airport transfers"] },
  { id: "costa", name: "Costa", sub: "Four nights, ocean-view suite", nights: 4, price: 3200, items: ["Every gala evening", "Private airport transfers", "Daily breakfast on your terrace"] },
  { id: "soberano", name: "Soberano", sub: "Four nights, private villa with pool", nights: 4, price: 6500, items: ["A yacht day and a chef’s dinner", "Your own concierge, all weekend", "Every gala evening, front table"] },
];

export const ROOMS: Room[] = [
  { id: "garden", name: "Garden-view room", perNight: 320, note: "King bed, terrace" },
  { id: "ocean", name: "Ocean-view suite", perNight: 520, note: "Sitting room, sea terrace" },
  { id: "villa", name: "Private villa with pool", perNight: 900, note: "Two bedrooms, own pool" },
];

export const ADDONS: Addon[] = [
  { id: "transfers", name: "Private transfers", price: 90, group: "Arrival", desc: "Met at the airport and driven to your door, both ways." },
  { id: "gala", name: "Gala evening", price: 240, group: "Evenings", desc: "Friday, 11 December. Dinner and music on the terrace." },
  { id: "farewell", name: "Farewell evening", price: 240, group: "Evenings", desc: "Saturday, 12 December. A long table by the sea." },
  { id: "chef", name: "Private chef dinner", price: 540, group: "Evenings", desc: "A tasting menu cooked at your terrace." },
  { id: "yacht", name: "Yacht day", price: 850, group: "Days", desc: "A private day off Cap Cana, lunch on board." },
  { id: "spa", name: "Spa ritual", price: 320, group: "Days", desc: "Ninety minutes of massage and a sea-salt scrub." },
];
