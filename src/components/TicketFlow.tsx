"use client";

import Image from "next/image";
import { useState } from "react";
import { CONFIRMATION_MESSAGE } from "@/lib/config";

type Step = "email" | "code" | "claim" | "done";

type TicketFlowProps = {
  initialAvailable: number;
  totalTickets: number;
};

function formatTicketNumber(n: number) {
  return `#${String(n).padStart(4, "0")}`;
}

export default function TicketFlow({
  initialAvailable,
  totalTickets,
}: TicketFlowProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [available, setAvailable] = useState(initialAvailable);
  const [tickets, setTickets] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const soldOut = available === 0;

  async function refreshAvailability() {
    try {
      const res = await fetch("/api/tickets/availability");
      const data = await res.json();
      if (res.ok) setAvailable(data.available);
    } catch {
      // ignore refresh errors
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar código");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      await refreshAvailability();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Código inválido");

      setToken(data.token);
      setTickets(data.tickets ?? []);
      if (typeof data.available === "number") setAvailable(data.available);

      if (data.remaining === 0) {
        setStep("done");
      } else if (data.available === 0) {
        setError("Se agotaron las entradas.");
      } else {
        setStep("claim");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tickets/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudieron reservar");

      setTickets((prev) => [...prev, ...data.tickets].sort((a, b) => a - b));
      if (typeof data.available === "number") setAvailable(data.available);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      await refreshAvailability();
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-[#8ed8e8] focus:ring-1 focus:ring-[#8ed8e8]/40";

  const buttonClass =
    "w-full rounded-lg bg-[#8ed8e8] px-4 py-3 font-medium uppercase tracking-wider text-black transition hover:bg-[#a8e4f0] disabled:opacity-50";

  if (soldOut && step === "email") {
    return (
      <div className="w-full rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
        <h2 className="font-display text-xl lowercase text-glow">
          entradas agotadas
        </h2>
        <p className="mt-3 text-sm text-white/50">
          Se reservaron las {totalTickets} entradas disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-white/15 bg-white/[0.03] p-8 backdrop-blur-sm">
      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-5">
          <div>
            <h2 className="font-display text-xl lowercase text-white">
              verificá tu correo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Te enviamos un código de 6 dígitos. 1 ticket por correo.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-widest text-white/60">
              Correo electrónico
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="space-y-5">
          <div>
            <h2 className="font-display text-xl lowercase text-white">
              ingresá el código
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Lo enviamos a{" "}
              <strong className="text-[#8ed8e8]">{email}</strong>
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-widest text-white/60">
              Código de verificación
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className={`${inputClass} text-center text-2xl tracking-[0.4em]`}
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Verificando..." : "Verificar"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="w-full text-sm text-white/40 underline-offset-2 hover:text-[#8ed8e8] hover:underline"
          >
            Cambiar correo
          </button>
        </form>
      )}

      {step === "claim" && (
        <form onSubmit={handleClaim} className="space-y-5">
          <div>
            <h2 className="font-display text-xl lowercase text-white">
              reservá tu entrada
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Vas a recibir 1 ticket con este correo.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Reservando..." : "Reservar entrada"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#8ed8e8]/40 bg-[#8ed8e8]/10 text-2xl text-[#8ed8e8]">
            ✓
          </div>
          <div>
            <h2 className="font-display text-xl lowercase text-glow">
              {tickets.length > 0 ? "listo" : "tus entradas"}
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Te enviamos un resumen a tu correo.
            </p>
          </div>

          {tickets.length > 0 && (
            <ul className="space-y-2">
              {tickets.map((n) => (
                <li
                  key={n}
                  className="rounded-lg border border-[#8ed8e8]/30 bg-[#8ed8e8]/5 px-4 py-3 font-mono text-lg font-semibold text-[#8ed8e8]"
                >
                  Ticket {formatTicketNumber(n)}
                </li>
              ))}
            </ul>
          )}

          {tickets.length > 0 && (
            <div className="space-y-4 pt-2">
              <p className="text-sm leading-relaxed text-white/80">
                {CONFIRMATION_MESSAGE}
              </p>
              <div className="mx-auto max-w-xs overflow-hidden rounded-xl border border-white/15 shadow-lg">
                <Image
                  src="/maikel-chango.png"
                  alt="Maikel Chango — Thriller"
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
              <p className="rounded-lg border border-[#8ed8e8]/20 bg-[#8ed8e8]/5 px-4 py-3 text-sm leading-relaxed text-white/70">
                La entrada es gratuita, pero podés contribuir a la causa en este
                alias{" "}
                <strong className="tracking-wide text-[#8ed8e8]">
                  CICLO.DISONANCIA
                </strong>
                , a nombre de{" "}
                <strong className="text-white">Nicolas Enrique Alonso</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
