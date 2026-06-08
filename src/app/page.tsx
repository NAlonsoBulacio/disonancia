import Image from "next/image";
import TicketFlow from "@/components/TicketFlow";
import { EVENT, MAX_TOTAL_TICKETS } from "@/lib/config";
import { getTicketAvailability } from "@/lib/tickets";

export default async function Home() {
  const { available } = await getTicketAvailability();

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-10 px-6 py-10 lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:px-10 lg:py-16">
        <section className="flex w-full max-w-sm flex-col items-center lg:sticky lg:top-16 lg:max-w-xs">
          <div className="relative w-full overflow-hidden shadow-[0_0_40px_rgba(142,216,232,0.15)]">
            <Image
              src="/flyer.png"
              alt={`Flyer — ${EVENT.name}`}
              width={400}
              height={500}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="mt-8 hidden w-full text-center lg:block">
            <p className="font-display text-sm tracking-wide text-white/70">
              Ciclo
            </p>
            <h1 className="font-display text-3xl lowercase text-glow">
              disonancia
            </h1>
            <div className="mx-auto my-4 h-px w-16 bg-white/30" />
            <ul className="space-y-1 text-sm uppercase tracking-widest text-white/80">
              {EVENT.artists.map((artist) => (
                <li key={artist}>{artist}</li>
              ))}
            </ul>
            <div className="mx-auto my-4 h-px w-16 bg-white/30" />
            <p className="text-sm uppercase tracking-widest">{EVENT.venue}</p>
            <p className="text-xs tracking-wider text-white/50">
              {EVENT.address}
            </p>
            <p className="mt-2 text-sm">{EVENT.time}</p>
            <p className="mt-4 inline-block rounded-full border border-white/40 px-4 py-1 text-xs uppercase tracking-wider">
              {EVENT.edition}
            </p>
          </div>
        </section>

        <section className="flex w-full max-w-md flex-col items-center lg:items-stretch lg:pt-8">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8ed8e8]">
              Entrada gratuita
            </p>
            <h2 className="mt-2 font-display text-2xl lowercase text-glow sm:text-3xl">
              sacá tus tickets
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              {EVENT.date} · {EVENT.time} · {EVENT.venue}
              <br />1 ticket por correo
            </p>

            <div className="mt-5 inline-block rounded-xl border border-[#8ed8e8]/40 bg-[#8ed8e8]/10 px-5 py-3">
              <p className="font-mono text-lg font-semibold text-[#8ed8e8]">
                {available} tickets disponibles de {MAX_TOTAL_TICKETS}
              </p>
            </div>
          </div>

          <TicketFlow
            initialAvailable={available}
            totalTickets={MAX_TOTAL_TICKETS}
          />
        </section>
      </main>
    </div>
  );
}
