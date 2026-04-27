/** Safe parse for fetch() when the server may return HTML or an empty body. */
export async function readResponseJson<T>(
  res: Response,
): Promise<
  | { ok: true; status: number; body: T }
  | { ok: false; status: number; message: string }
> {
  const raw = await res.text();
  const status = res.status;
  if (!raw.trim()) {
    if (!res.ok) {
      return { ok: false, status, message: `Request failed (${status})` };
    }
    return { ok: true, status, body: {} as T };
  }
  try {
    return { ok: true, status, body: JSON.parse(raw) as T };
  } catch {
    return {
      ok: false,
      status,
      message: "Server returned a non-JSON response",
    };
  }
}
