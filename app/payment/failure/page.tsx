import Link from "next/link"

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 max-w-md w-full text-center shadow-sm">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-slate-600">
            Your payment could not be processed. Please try again.
          </p>
        </div>
        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}

