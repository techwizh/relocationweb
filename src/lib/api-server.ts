import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

type FetchApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

function resolveApiUrl(path: string): string {
  const remoteBase = getApiUrl();
  if (remoteBase) {
    return `${remoteBase}${path}`;
  }

  const localOrigin =
    process.env.RENDER_EXTERNAL_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    `http://localhost:${process.env.PORT ?? 3000}`;

  return `${localOrigin.replace(/\/$/, "")}${path}`;
}

export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<FetchApiResult<T>> {
  const url = resolveApiUrl(path);
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return { ok: false, status: response.status, data: null };
  }

  const data = (await response.json()) as T;
  return { ok: true, status: response.status, data };
}
