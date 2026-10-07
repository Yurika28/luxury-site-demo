// Photo assets (Unsplash, free to use under the Unsplash licence). Swap an id to change a picture.
// Video is intentionally unused: the brief allows a hero loop, but the design uses a still.
// To add one later, set HERO_VIDEO to a URL and render it behind the hero image.
import type { AddonId } from "./catalog";

const BASE = "https://images.unsplash.com";
export const photoUrl = (id: string) => `${BASE}/${id}?auto=format&fit=crop&q=80`;

export interface Photo {
  src: string;
  alt: string;
}
const photo = (id: string, alt: string): Photo => ({ src: photoUrl(id), alt });

export const HERO_VIDEO: string | null = null;

export const HERO = photo("photo-1692017827893-f97d95397b49", "A quiet white-sand beach and turquoise water along the Caribbean coast");
export const PLACE = photo("photo-1777291126955-8c85847c4a1e", "A villa terrace with a long pool at dusk");

export const ADDON_PHOTOS: Record<AddonId, Photo> = {
  transfers: photo("photo-1772990914622-4ee26e085381", "A dark green saloon car waiting for guests"),
  gala: photo("photo-1676027647672-1230463791a9", "A long dinner table laid with flowers under string lights"),
  farewell: photo("photo-1680956987778-205d101369fd", "A table set for two under a canopy on the beach at sunset"),
  chef: photo("photo-1572715376701-98568319fd0b", "A chef plating a dish of greens and sauce"),
  yacht: photo("photo-1747370640889-0914b3cbdb44", "A white yacht cruising across turquoise water, seen from above"),
  spa: photo("photo-1706795033855-eee02f726868", "Rolled towels and soft lights in a spa room"),
};

// Places shown on the landing page below "The place". Photos are reused from the add-ons for now.
export interface Place {
  id: string;
  number: string;
  title: string;
  text: string;
  photo: Photo;
}
export const PLACES: Place[] = [
  {
    id: "spa",
    number: "02 · Spa & wellness",
    title: "A quiet room to slow down in.",
    text: "Warm light, soft towels and unhurried hands. Book a treatment between the tide and dinner, or simply sit for a while.",
    photo: ADDON_PHOTOS.spa,
  },
  {
    id: "terrace",
    number: "03 · Dining terrace",
    title: "Long tables, set by the water.",
    text: "The gala and the farewell dinner are laid out on the terrace and the sand, with the sea always within earshot.",
    photo: ADDON_PHOTOS.farewell,
  },
];
