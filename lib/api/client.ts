// parses the { ok, data } / { ok, error } envelope returned by API routes
export async function parseApiResponse<T>(res: Response): Promise<
  | { ok: true; data: T; status: number }
  | { ok: false; message: string; code?: string; status: number }
> {
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { ok: false, message: "Unable to read the server response.", status: res.status };
  }

  const obj = json as Record<string, unknown> | null;

  if (obj && obj.ok === true && "data" in obj) {
    return { ok: true, data: obj.data as T, status: res.status };
  }

  if (obj && obj.ok === false)
  {
    const err = obj.error as { code?: string; message?: string } | undefined;
    return {
      ok: false,
      message: err?.message ?? "Something went wrong.",
      code: err?.code,
      status: res.status,
    };
  }

  return { ok: false, message: "Unexpected response from the server.", status: res.status };
}
