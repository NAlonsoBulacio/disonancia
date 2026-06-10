import type { Metadata } from "next";
import ReturnTicketsFlow from "@/components/ReturnTicketsFlow";

export const metadata: Metadata = {
  title: "Liberar entradas — Ciclo disonancia",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function DevolverPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
      <div className="w-full max-w-md">
        {!token ? (
          <div className="rounded-xl border border-white/15 bg-white/[0.03] p-8 text-center">
            <h1 className="font-display text-xl lowercase text-glow">
              enlace inválido
            </h1>
            <p className="mt-3 text-sm text-white/50">
              Usá el enlace que te enviamos por correo para liberar tus
              entradas.
            </p>
          </div>
        ) : (
          <ReturnTicketsFlow token={token} />
        )}
      </div>
    </div>
  );
}
