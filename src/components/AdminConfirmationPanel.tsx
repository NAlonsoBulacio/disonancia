"use client";

import { useCallback, useEffect, useState } from "react";

type Recipient = {
  email: string;
  ticketNumbers: number[];
};

function formatTicketNumber(n: number) {
  return `#${String(n).padStart(4, "0")}`;
}

export default function AdminConfirmationPanel() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | "all" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadRecipients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/confirmations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar correos");
      setRecipients(data.recipients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  async function sendConfirmation(email?: string) {
    setSending(email ?? "all");
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/confirmations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email ? { email } : { sendAll: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");

      setSuccess(
        email
          ? `Correo de confirmación enviado a ${email}.`
          : `Correos enviados: ${data.sent.length}.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSending(null);
    }
  }

  return (
    <section className="mb-10 rounded-xl border border-white/15 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8ed8e8]">
            Presencialidad
          </p>
          <h2 className="mt-2 font-display text-2xl lowercase text-white">
            correos con entradas activas
          </h2>
          <p className="mt-2 text-sm text-white/50">
            Enviá manualmente el correo de confirmación de presencialidad a los
            correos con entradas activas.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadRecipients}
            disabled={loading || sending !== null}
            className="rounded-lg border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-[#8ed8e8]/50 hover:text-[#8ed8e8] disabled:opacity-50"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => sendConfirmation()}
            disabled={loading || sending !== null || recipients.length === 0}
            className="rounded-lg bg-[#8ed8e8] px-4 py-2 text-xs font-medium uppercase tracking-wider text-black transition hover:bg-[#a8e4f0] disabled:opacity-50"
          >
            {sending === "all" ? "Enviando..." : "Enviar a todos"}
          </button>
        </div>
      </div>

      {success && <p className="mt-4 text-sm text-[#8ed8e8]">{success}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-white/40">
            Cargando correos activos...
          </p>
        ) : recipients.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-white/40">
            No hay correos con entradas activas.
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {recipients.map((recipient) => (
              <div
                key={recipient.email}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white/90">
                    {recipient.email}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#8ed8e8]">
                    {recipient.ticketNumbers.map(formatTicketNumber).join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => sendConfirmation(recipient.email)}
                  disabled={sending !== null}
                  className="rounded-lg border border-[#8ed8e8]/50 px-4 py-2 text-xs uppercase tracking-wider text-[#8ed8e8] transition hover:bg-[#8ed8e8]/10 disabled:opacity-50"
                >
                  {sending === recipient.email ? "Enviando..." : "Enviar correo"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
