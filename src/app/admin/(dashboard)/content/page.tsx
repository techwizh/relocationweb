import { LandingContentEditor } from "@/components/admin/landing-content-editor";

export default function AdminContentPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Edit landing page</h1>
      <p className="mt-3 text-slate-600">
        Update headlines, descriptions, and upload photos to make the home page
        more engaging for customers.
      </p>

      <div className="mt-8">
        <LandingContentEditor />
      </div>
    </div>
  );
}
