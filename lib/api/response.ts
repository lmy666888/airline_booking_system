import { NextResponse } from "next/server";

export function okJson<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    { ok: true as const, data },
    { status: init?.status ?? 200, headers: init?.headers },
  );
}

export function errJson(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false as const, error: { code, message } }, { status });
}
