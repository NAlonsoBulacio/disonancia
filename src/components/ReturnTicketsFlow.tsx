"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/config";

type ReturnInfo = {
  email: string;
  tickets: number[];
};

function formatTicketNumber(n: number) {
  return `#${String(n).padStart(4, "0")}`;
}

export default function ReturnTicketsFlow({ token }: { token: string }) {
  const [info, setInfo] = useState<ReturnInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [released, setReleased] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/returns/info?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Enlace inválido");
        setInfo(data);
        setQuantity(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleRelease(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/returns/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo liberar");

      setReleased(data.released);

      if (data.remaining.length === 0) {
        setDone(true);
        setSuccess("");
      } else {
        setInfo((prev) =>
          prev ? { ...prev, tickets: data.remaining } : prev,
        );
        setQuantity(1);
        setSuccess(
          `Liberaste ${data.released.length} entrada(s). Te quedan ${data.remaining.length}.`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#8ed8e8] focus:ring-1 focus:ring-[#8ed8e8]/40";

  const buttonClass =
    "w-full rounded-lg bg-[#8ed8e8] px-4 py-3 font-medium uppercase tracking-wider text-black transition hover:bg-[#a8e4f0] disabled:opacity-50";

  if (loading) {
    return (
      <div className="rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center">
        <p className="text-white/50">Cargando...</p>
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center">
        <h2 className="font-display text-xl lowercase text-red-400">
          enlace no válido
        </h2>
        <p className="mt-3 text-sm text-white/50">{error}</p>
      </div>
    );
  }

  if (!info) return null;

  if (info.tickets.length === 0) {
    return (
      <div className="rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center">
        <h2 className="font-display text-xl lowercase text-glow">
          sin entradas
        </h2>
        <p className="mt-3 text-sm text-white/50">
          Este correo ya no tiene entradas activas.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5 rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#8ed8e8]/40 bg-[#8ed8e8]/10 text-2xl text-[#8ed8e8]">
          ✓
        </div>
        <h2 className="font-display text-xl lowercase text-glow">
          entradas liberadas
        </h2>
        <p className="text-sm text-white/50">
          Liberaste {released.length} entrada(s). Gracias por avisar.
        </p>
        <ul className="space-y-2">
          {released.map((n) => (
            <li
              key={n}
              className="font-mono text-lg text-[#8ed8e8]/70 line-through"
            >
              {formatTicketNumber(n)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.03] p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-[#8ed8e8]">
        {EVENT.name}
      </p>
      <h2 className="mt-2 font-display text-2xl lowercase text-glow">
        liberar entradas
      </h2>
      <p className="mt-3 text-sm text-white/50">
        Correo: <strong className="text-white">{info.email}</strong>
      </p>

      <ul className="mt-5 space-y-2">
        {info.tickets.map((n) => (
          <li
            key={n}
            className="rounded-lg border border-[#8ed8e8]/30 bg-[#8ed8e8]/5 px-4 py-3 font-mono text-lg font-semibold text-[#8ed8e8]"
          >
            Ticket {formatTicketNumber(n)}
          </li>
        ))}
      </ul>

      <form onSubmit={handleRelease} className="mt-6 space-y-5">
        <div>
          <p className="text-sm text-white/60">
            ¿Cuántas entradas querés liberar?
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-widest text-white/60">
            Cantidad
          </span>
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={inputClass}
          >
            {info.tickets.map((_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="bg-black text-white">
                {n} {n === 1 ? "entrada" : "entradas"}
                {n === info.tickets.length ? " (todas)" : ""}
              </option>
            ))}
          </select>
        </label>

        {success && <p className="text-sm text-[#8ed8e8]">{success}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Liberando..." : "Liberar entradas"}
        </button>
      </form>
    </div>
  );
}
