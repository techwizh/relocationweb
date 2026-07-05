import Link from "next/link";

export default function DriverRegisterSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8">
        <h1 className="text-2xl font-bold text-teal-900">Application submitted</h1>
        <p className="mt-3 text-teal-800">
          Your driver profile and vehicle details are pending admin review. You
          will be able to sign in and accept jobs once approved.
        </p>
        <p className="mt-3 text-sm text-teal-800">
          After approval, sign in at{" "}
          <Link href="/login" className="font-medium text-teal-700 hover:underline">
            /login
          </Link>{" "}
          to open your driver portal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Back to home
          </Link>
          <Link
            href="/driver/register"
            className="rounded-full border border-teal-300 px-6 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-100"
          >
            Register another driver
          </Link>
        </div>
      </div>
    </div>
  );
}
