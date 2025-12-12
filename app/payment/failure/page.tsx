import Link from "next/link"

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
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
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600">
            Your payment could not be processed. Please try again.
          </p>
        </div>
        <Link
          href="/book"
          className="inline-block bg-blue-900 text-yellow-400 px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}

