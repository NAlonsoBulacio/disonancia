"use client";

import { useCallback, useEffect, useState } from "react";
import AdminConfirmationPanel from "@/components/AdminConfirmationPanel";
import AdminReturnPanel from "@/components/AdminReturnPanel";
import { EVENT, TICKET_STATUS } from "@/lib/config";

type Ticket = {
  id: string;
  ticketNumber: number;
  email: string;
  status: string;
  createdAt: string;
};

type Stats = {
  total: number;
  issued: number;
  released: number;
  uniqueEmails: number;
  available: number;
  capacity: number;
};

function formatTicketNumber(n: number) {
  return `#${String(n).padStart(4, "0")}`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

const ticketStatusLabels = {
  [TICKET_STATUS.active]: "activa",
  [TICKET_STATUS.released]: "liberada",
};

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar");
      setTickets(data.tickets);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  useEffect(() => {
    if (authenticated) loadTickets();
  }, [authenticated, loadTickets]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Contraseña incorrecta");
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setTickets([]);
    setStats(null);
  }

  async function handleTicketStatusChange(ticket: Ticket, status: string) {
    if (ticket.status === status) return;

    setUpdatingTicketId(ticket.id);
    setError("");
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticket.id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al actualizar");

      setTickets((current) =>
        current.map((item) => (item.id === data.ticket.id ? data.ticket : item)),
      );
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-[#8ed8e8] focus:ring-1 focus:ring-[#8ed8e8]/40";

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-white/50">Cargando...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-xl border border-white/15 bg-white/[0.03] p-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#8ed8e8]">
            Admin
          </p>
          <h1 className="mt-2 font-display text-2xl lowercase text-glow">
            dashboard
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Ingresá la contraseña para ver las entradas emitidas.
          </p>

          <label className="mt-6 block">
            <span className="mb-2 block text-xs uppercase tracking-widest text-white/60">
              Contraseña
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </label>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-[#8ed8e8] px-4 py-3 font-medium uppercase tracking-wider text-black transition hover:bg-[#a8e4f0] disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#8ed8e8]">
              Admin · {EVENT.name}
            </p>
            <h1 className="mt-2 font-display text-3xl lowercase text-glow">
              entradas emitidas
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadTickets}
              disabled={loading}
              className="rounded-lg border border-[#8ed8e8]/50 px-4 py-2 text-sm uppercase tracking-wider text-[#8ed8e8] transition hover:bg-[#8ed8e8]/10 disabled:opacity-50"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm uppercase tracking-wider text-white/60 transition hover:bg-white/5"
            >
              Salir
            </button>
          </div>
        </header>

        {stats && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#8ed8e8]/30 bg-[#8ed8e8]/5 p-5">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Activas
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-[#8ed8e8]">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Liberadas
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-white/70">
                {stats.released}
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Disponibles
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-white">
                {stats.available}
              </p>
              <p className="mt-1 text-xs text-white/40">de {stats.capacity}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-widest text-white/50">
                Correos únicos
              </p>
              <p className="mt-2 font-mono text-3xl font-bold text-white">
                {stats.uniqueEmails}
              </p>
            </div>
          </div>
        )}

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <AdminConfirmationPanel />

        <AdminReturnPanel />

        <div className="overflow-hidden rounded-xl border border-white/15">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-widest text-white/50">
                  <th className="px-5 py-4">Ticket</th>
                  <th className="px-5 py-4">Correo</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading && tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-white/40">
                      Cargando entradas...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-white/40">
                      Todavía no hay entradas emitidas.
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-mono text-base font-semibold text-[#8ed8e8]">
                        {formatTicketNumber(ticket.ticketNumber)}
                      </td>
                      <td className="px-5 py-4 text-white/80">{ticket.email}</td>
                      <td className="px-5 py-4 text-white/50">
                        <select
                          value={ticket.status}
                          disabled={updatingTicketId === ticket.id}
                          onChange={(e) =>
                            handleTicketStatusChange(ticket, e.target.value)
                          }
                          className="rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-[#8ed8e8] disabled:opacity-50"
                        >
                          {Object.values(TICKET_STATUS).map((status) => (
                            <option key={status} value={status}>
                              {ticketStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-white/50">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
