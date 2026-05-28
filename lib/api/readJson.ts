import { errJson } from "./response";

export async function readJsonBody<T>(request: Request) {
  try {
    const body = (await request.json()) as T;
    return { ok: true as const, body };
  } catch {
    return { ok: false as const, response: errJson("INVALID_JSON", "Request body must be valid JSON.", 400) };
  }
}
