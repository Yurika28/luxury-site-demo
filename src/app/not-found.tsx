import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col items-start justify-center gap-5 px-5 py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">404</p>
      <h1 className="font-display text-[44px] leading-none md:text-[64px]">We could not find that page</h1>
      <p className="text-base leading-relaxed text-muted">It may have moved, or the link may be mistyped. Your booking is safe.</p>
      <Link
        href="/"
        className="flex min-h-[52px] w-full items-center justify-center bg-terracotta px-7 text-[13px] font-semibold uppercase tracking-[0.16em] text-white hover:bg-[#9A4224] sm:w-fit"
      >
        Back to Maré Caribe
      </Link>
    </main>
  );
}
