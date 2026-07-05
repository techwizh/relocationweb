"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { LandingContent } from "@/lib/landing-content";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing-content";

export function LandingContentEditor() {
  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch("/api/admin/content");
        const data = (await response.json()) as {
          content?: LandingContent;
          error?: string;
        };

        if (response.ok && data.content) {
          setContent(data.content);
        } else {
          setError(data.error ?? "Could not load content.");
        }
      } catch {
        setError("Could not load content.");
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  function updateStep(index: number, value: string) {
    setContent((current) => {
      const steps = [...current.howItWorksSteps];
      steps[index] = value;
      return { ...current, howItWorksSteps: steps };
    });
  }

  function addStep() {
    setContent((current) => ({
      ...current,
      howItWorksSteps: [...current.howItWorksSteps, ""],
    }));
  }

  function removeStep(index: number) {
    setContent((current) => ({
      ...current,
      howItWorksSteps: current.howItWorksSteps.filter((_, stepIndex) => stepIndex !== index),
    }));
  }

  function removeGalleryImage(index: number) {
    setContent((current) => ({
      ...current,
      galleryImages: current.galleryImages.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  async function uploadImage(
    file: File,
    onUploaded: (url: string) => void,
  ) {
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      onUploaded(data.url);
      setMessage("Image uploaded.");
    } catch {
      setError("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = (await response.json()) as {
        content?: LandingContent;
        error?: string;
      };

      if (!response.ok || !data.content) {
        setError(data.error ?? "Could not save content.");
        return;
      }

      setContent(data.content);
      setMessage("Landing page updated successfully.");
    } catch {
      setError("Could not save content.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-slate-600">Loading editor...</p>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Hero section</h2>
        <div className="mt-4 grid gap-4">
          <TextField
            label="Badge text"
            value={content.badgeText}
            onChange={(value) => setContent({ ...content, badgeText: value })}
          />
          <TextField
            label="Main headline"
            value={content.heroTitle}
            onChange={(value) => setContent({ ...content, heroTitle: value })}
          />
          <TextArea
            label="Hero description"
            value={content.heroDescription}
            onChange={(value) => setContent({ ...content, heroDescription: value })}
          />
          <TextField
            label="Primary button text"
            value={content.primaryButtonText}
            onChange={(value) => setContent({ ...content, primaryButtonText: value })}
          />
          <TextField
            label="Secondary button text"
            value={content.secondaryButtonText}
            onChange={(value) => setContent({ ...content, secondaryButtonText: value })}
          />

          <div>
            <p className="text-sm font-medium text-slate-700">Hero image</p>
            {content.heroImageUrl ? (
              <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200">
                <Image
                  src={content.heroImageUrl}
                  alt="Hero preview"
                  width={1200}
                  height={700}
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No hero image uploaded yet.</p>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  uploadImage(file, (url) => {
                    setContent((current) => ({ ...current, heroImageUrl: url }));
                  });
                }
              }}
              className="mt-3 block w-full text-sm text-slate-600"
            />
            {content.heroImageUrl ? (
              <button
                type="button"
                onClick={() => setContent({ ...content, heroImageUrl: null })}
                className="mt-2 text-sm font-medium text-red-600 hover:underline"
              >
                Remove hero image
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
        <div className="mt-4 grid gap-4">
          <TextField
            label="Section title"
            value={content.howItWorksTitle}
            onChange={(value) => setContent({ ...content, howItWorksTitle: value })}
          />
          {content.howItWorksSteps.map((step, index) => (
            <div key={index} className="flex gap-3">
              <input
                type="text"
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                placeholder={`Step ${index + 1}`}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-teal-700"
          >
            Add step
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Vehicles section</h2>
        <div className="mt-4 grid gap-4">
          <TextField
            label="Section title"
            value={content.vehiclesSectionTitle}
            onChange={(value) => setContent({ ...content, vehiclesSectionTitle: value })}
          />
          <TextArea
            label="Section description"
            value={content.vehiclesSectionDescription}
            onChange={(value) =>
              setContent({ ...content, vehiclesSectionDescription: value })
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Photo gallery</h2>
        <div className="mt-4 grid gap-4">
          <TextField
            label="Gallery title"
            value={content.galleryTitle}
            onChange={(value) => setContent({ ...content, galleryTitle: value })}
          />
          <TextArea
            label="Gallery description"
            value={content.galleryDescription}
            onChange={(value) => setContent({ ...content, galleryDescription: value })}
          />

          {content.galleryImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.galleryImages.map((imageUrl, index) => (
                <div key={imageUrl} className="overflow-hidden rounded-2xl border border-slate-200">
                  <Image
                    src={imageUrl}
                    alt={`Gallery image ${index + 1}`}
                    width={600}
                    height={400}
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No gallery images yet.</p>
          )}

          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                uploadImage(file, (url) => {
                  setContent((current) => ({
                    ...current,
                    galleryImages: [...current.galleryImages, url],
                  }));
                });
              }
            }}
            className="block w-full text-sm text-slate-600"
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">{message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving || isUploading}
        className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save landing page"}
      </button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
      />
    </label>
  );
}
