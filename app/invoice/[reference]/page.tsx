import { Suspense } from "react";
import { InvoiceClient } from "./invoice-client";

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-sm text-slate-600">Preparing invoice…</p>
        </main>
      }
    >
      <InvoiceClient />
    </Suspense>
  );
}
