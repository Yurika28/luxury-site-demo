import type { ReactNode } from "react";
import { BookingHydrator } from "@/components/booking/BookingHydrator";

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BookingHydrator />
      {children}
    </>
  );
}
