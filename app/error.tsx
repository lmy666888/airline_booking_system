"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return
  (
    <PageShell title="Something went wrong">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Something went wrong</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          An unexpected error occurred. You can try again or go back to the home page.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={() => reset()}>Try again</Button>
          <Link href="/" className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[var(--border-strong)] px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50">
            Home
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
