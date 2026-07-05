import { LandingPageView } from "@/components/landing-page-view";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";
import { fetchApi } from "@/lib/api-server";
import type { LandingContent } from "@/lib/landing-content";

export default async function Home() {
  const { ok, data } = await fetchApi<{ content: LandingContent }>("/api/landing");
  const content = ok && data?.content ? data.content : DEFAULT_LANDING_CONTENT;

  return <LandingPageView content={content} />;
}
