import { prisma } from "@/lib/prisma";

export type LandingContent = {
  badgeText: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string | null;
  primaryButtonText: string;
  secondaryButtonText: string;
  howItWorksTitle: string;
  howItWorksSteps: string[];
  vehiclesSectionTitle: string;
  vehiclesSectionDescription: string;
  galleryTitle: string;
  galleryDescription: string;
  galleryImages: string[];
};

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  badgeText: "Mombasa, Kenya",
  heroTitle: "Move your belongings with the right vehicle",
  heroDescription:
    "Relocate helps you book a van, pickup, canter, or lorry for your next home. Choose capacity, get a price, pay with M-Pesa, and track your driver on move day.",
  heroImageUrl: null,
  primaryButtonText: "Book a move",
  secondaryButtonText: "Join as a driver",
  howItWorksTitle: "How it works",
  howItWorksSteps: [
    "Enter pick-up and drop-off locations in Mombasa.",
    "Pick a vehicle size based on how much you own.",
    "Pay with M-Pesa and get a confirmed booking.",
    "Track your driver while your items are on the move.",
  ],
  vehiclesSectionTitle: "Choose your vehicle",
  vehiclesSectionDescription:
    "Not sure? Choose the next size up. It is better to have extra space than to run out on move day.",
  galleryTitle: "Reliable moves across the coast",
  galleryDescription:
    "Professional drivers, the right vehicle for every home size, and secure in-app communication.",
  galleryImages: [],
};

function parseLandingContent(raw: string): LandingContent {
  try {
    const parsed = JSON.parse(raw) as Partial<LandingContent>;
    return {
      ...DEFAULT_LANDING_CONTENT,
      ...parsed,
      howItWorksSteps:
        parsed.howItWorksSteps?.length ? parsed.howItWorksSteps : DEFAULT_LANDING_CONTENT.howItWorksSteps,
      galleryImages: parsed.galleryImages ?? DEFAULT_LANDING_CONTENT.galleryImages,
    };
  } catch {
    return DEFAULT_LANDING_CONTENT;
  }
}

export async function getLandingContent(): Promise<LandingContent> {
  try {
    const existing = await prisma.landingPageContent.findUnique({
      where: { id: "default" },
    });

    if (existing) {
      return parseLandingContent(existing.content);
    }

    const created = await prisma.landingPageContent.create({
      data: {
        id: "default",
        content: JSON.stringify(DEFAULT_LANDING_CONTENT),
      },
    });

    return parseLandingContent(created.content);
  } catch (error) {
    console.error("Failed to load landing content from database:", error);
    return DEFAULT_LANDING_CONTENT;
  }
}

export async function updateLandingContent(content: LandingContent): Promise<LandingContent> {
  try {
    const saved = await prisma.landingPageContent.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        content: JSON.stringify(content),
      },
      update: {
        content: JSON.stringify(content),
      },
    });

    return parseLandingContent(saved.content);
  } catch (error) {
    console.error("Failed to save landing content:", error);
    throw error;
  }
}
