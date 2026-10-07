"use client";
import Link from "next/link";
import { ROOMS } from "@/lib/catalog";
import { useBooking } from "@/store/booking";
import { AddonsStep } from "@/components/booking/AddonsStep";

function RoomStrip() {
  const { hydrated, roomId, nights, guests } = useBooking();
  const room = ROOMS.find((r) => r.id === roomId);
  if (!hydrated || !room) return null;
  return (
    <div className="flex items-center justify-between gap-4 border border-hairline bg-paper px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-medium">{room.name}</span>
        <span className="text-[13px] text-muted">{nights} nights · {guests} {guests === 1 ? "guest" : "guests"}</span>
      </div>
      <Link href="/booking/build/room" className="inline-flex min-h-11 items-center text-sm font-medium text-terracotta underline underline-offset-4">
        Change
      </Link>
    </div>
  );
}

export default function BuildExperiences() {
  return (
    <AddonsStep
      step={2}
      label="Your experiences"
      back="/booking/build/room"
      title="Choose experiences"
      lede="Add what you like. You can leave this empty and still stay with us."
      nextHref="/booking/guest"
      top={<RoomStrip />}
    />
  );
}
