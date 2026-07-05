import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api-url";

type FetchApiResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
};

export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<FetchApiResult<T>> {
  const base = getApiUrl();
  const url = base ? `${base}${path}` : path;
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
