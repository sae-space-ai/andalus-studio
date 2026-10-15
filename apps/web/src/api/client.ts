// Cliente HTTP hacia la API REAL. Sin localStorage para sesiones: cookies HttpOnly + header CSRF.
const API = "/api/v1";

let csrfToken = "";

async function refreshCsrf(): Promise<void> {
  const res = await fetch(`${API}/auth/csrf-token`, { credentials: "include" });
  if (res.ok) {
    const data = (await res.json()) as { csrfToken: string };
    csrfToken = data.csrfToken;
  }
}
// Se llama una vez al arrancar la app
export async function initApi(): Promise<void> {
  await refreshCsrf();
}

async function request<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T | null; error: string | null }> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (method !== "GET") headers["csrf-token"] = csrfToken;

  let res = await fetch(`${API}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Reintentar una vez con CSRF fresco (cookie rotada por el servidor)
  if (res.status === 403) {
    await refreshCsrf();
    headers["csrf-token"] = csrfToken;
    res = await fetch(`${API}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  if (res.status === 204) return { status: 204, data: null, error: null };
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (json as { error?: { message?: string } })?.error?.message ?? `Error ${res.status}`;
    return { status: res.status, data: null, error: msg };
  }
  return { status: res.status, data: json as T, error: null };
}

export const api = {
  get: <T>(p: string) => request<T>("GET", p),
  post: <T>(p: string, b?: unknown) => request<T>("POST", p, b ?? {}),
  patch: <T>(p: string, b?: unknown) => request<T>("PATCH", p, b ?? {}),
  uploadDocument: async (projectId: string, file: File, rightsBasis: string) => {
    const form = new FormData();
    form.append("rightsDeclared", "true");
    form.append("rightsBasis", rightsBasis);
    form.append("file", file);
    let res = await fetch(`${API}/projects/${projectId}/documents`, {
      method: "POST",
      credentials: "include",
      headers: { "csrf-token": csrfToken },
      body: form,
    });
    if (res.status === 403) {
      await refreshCsrf();
      res = await fetch(`${API}/projects/${projectId}/documents`, {
        method: "POST",
        credentials: "include",
        headers: { "csrf-token": csrfToken },
        body: form,
      });
    }
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (json as { error?: { message?: string } })?.error?.message ?? `Error ${res.status}`;
      return { status: res.status, data: null, error: msg };
    }
    return { status: res.status, data: json, error: null };
  },
};
