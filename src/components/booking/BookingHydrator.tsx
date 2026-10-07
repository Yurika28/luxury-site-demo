"use client";
import { useEffect } from "react";
import { STORAGE_KEY, useBooking } from "@/store/booking";

const SEEN_KEY = "mare:seen";

/** Rehydrates the persisted store once after mount, and works out whether this is a returning visit. */
export function BookingHydrator() {
  useEffect(() => {
    let had = false;
    let seen = false;
    try {
      had = window.localStorage.getItem(STORAGE_KEY) !== null;
      seen = window.sessionStorage.getItem(SEEN_KEY) !== null;
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: behave as a first visit */
    }
    Promise.resolve(useBooking.persist.rehydrate()).then(() => {
      useBooking.setState({ hydrated: true, restored: had && !seen });
    });
  }, []);
  return null;
}
