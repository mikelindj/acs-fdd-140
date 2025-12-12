import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-blue-900 text-yellow-400 px-6 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}

