import { EVENT, SOLD_OUT_MESSAGE, SOLD_OUT_TITLE } from "@/lib/config";

export default function SoldOutBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="mt-5 inline-block rounded-xl border border-[#8ed8e8]/40 bg-[#8ed8e8]/10 px-5 py-3">
        <p className="font-mono text-lg font-semibold uppercase tracking-wider text-[#8ed8e8]">
          {SOLD_OUT_TITLE}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#8ed8e8]/30 bg-[#8ed8e8]/5 p-8 text-center backdrop-blur-sm">
      <p className="font-mono text-2xl font-bold uppercase tracking-[0.2em] text-[#8ed8e8]">
        {SOLD_OUT_TITLE}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        {SOLD_OUT_MESSAGE}
      </p>
      <ul className="mt-5 space-y-1 text-xs uppercase tracking-widest text-white/50">
        {EVENT.artists.map((artist) => (
          <li key={artist}>{artist}</li>
        ))}
      </ul>
    </div>
  );
}
