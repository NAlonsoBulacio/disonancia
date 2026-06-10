"use client";

import { useCallback, useEffect, useState } from "react";
import SoldOutBanner from "@/components/SoldOutBanner";
import TicketFlow from "@/components/TicketFlow";

type Availability = {
  available: number;
  sold: number;
  total: number;
};

export default function TicketSection() {
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets/availability", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setData(json);
      return json as Availability;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  const soldOut = data?.available === 0;

  return (
    <>
      <div className="text-center lg:text-left">
        {loading && !data ? (
          <div className="mt-5 inline-block rounded-xl border border-[#8ed8e8]/40 bg-[#8ed8e8]/10 px-5 py-3">
            <p className="font-mono text-lg font-semibold text-[#8ed8e8]/60">
              Cargando disponibilidad...
            </p>
          </div>
        ) : soldOut ? (
          <SoldOutBanner compact />
        ) : data ? (
          <div className="mt-5 inline-block rounded-xl border border-[#8ed8e8]/40 bg-[#8ed8e8]/10 px-5 py-3">
            <p className="font-mono text-lg font-semibold text-[#8ed8e8]">
              {data.available} tickets disponibles de {data.total}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-8 w-full">
        {soldOut ? (
          <SoldOutBanner />
        ) : (
          <TicketFlow
            available={data?.available ?? null}
            totalTickets={data?.total ?? null}
            onAvailabilityChange={refresh}
          />
        )}
      </div>
    </>
  );
}
