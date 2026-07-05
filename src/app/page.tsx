import { LandingPageView } from "@/components/landing-page-view";
import { getLandingContent } from "@/lib/landing-content";

export default async function Home() {
  const content = await getLandingContent();

  return <LandingPageView content={content} />;
}
