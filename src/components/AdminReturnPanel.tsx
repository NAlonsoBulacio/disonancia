"use client";

import { useState } from "react";

type ReturnLinkResult = {
  email: string;
  url: string;
  subject: string;
  body: string;
  tickets: number[];
  expiresAt: string;
};

function formatTicketNumber(n: number) {
  return `#${String(n).padStart(4, "0")}`;
}

export default function AdminReturnPanel() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnLinkResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/return-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar enlace");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-[#8ed8e8] focus:ring-1 focus:ring-[#8ed8e8]/40";

  return (
    <section className="mb-10 rounded-xl border border-white/15 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[#8ed8e8]">
        Envío manual
      </p>
      <h2 className="mt-2 font-display text-2xl lowercase text-white">
        liberar entradas
      </h2>
      <p className="mt-2 text-sm text-white/50">
        Generá un enlace personalizado por correo. Copiá el mail y enviálo
        manualmente a cada persona.
      </p>

      <form onSubmit={handleGenerate} className="mt-6 flex flex-col gap-4 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-[#8ed8e8] px-6 py-3 text-sm font-medium uppercase tracking-wider text-black transition hover:bg-[#a8e4f0] disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar enlace"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">
              Entradas activas
            </p>
            <p className="mt-2 font-mono text-[#8ed8e8]">
              {result.tickets.map(formatTicketNumber).join(" · ")}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Enlace
              </p>
              <button
                type="button"
                onClick={() => copyText("url", result.url)}
                className="text-xs uppercase tracking-wider text-[#8ed8e8] hover:underline"
              >
                {copied === "url" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="break-all rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
              {result.url}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Asunto del correo
              </p>
              <button
                type="button"
                onClick={() => copyText("subject", result.subject)}
                className="text-xs uppercase tracking-wider text-[#8ed8e8] hover:underline"
              >
                {copied === "subject" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80">
              {result.subject}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Cuerpo del correo
              </p>
              <button
                type="button"
                onClick={() => copyText("body", result.body)}
                className="text-xs uppercase tracking-wider text-[#8ed8e8] hover:underline"
              >
                {copied === "body" ? "Copiado" : "Copiar"}
              </button>
            </div>
            <textarea
              readOnly
              value={result.body}
              rows={10}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm leading-relaxed text-white/80 outline-none"
            />
          </div>
        </div>
      )}
    </section>
  );
}
