import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              ACS Founders&apos; Day Dinner
            </h1>
            <p className="mt-6 text-2xl leading-8 text-slate-600">
              140 Years Celebration
            </p>
            <p className="mt-4 text-lg leading-7 text-slate-500">
              Join us for an unforgettable evening celebrating 140 years of excellence
            </p>
          </div>

          <div className="mt-16 rounded-2xl bg-slate-50 p-8 sm:p-12 shadow-sm border border-slate-200">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6">
              Book Your Table or Seats
            </h2>
            <p className="text-base leading-7 text-slate-600 mb-8">
              Choose from VIP, School, OBA, or Guest categories. Tables seat 10-11 guests.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Full Table</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">$1,000 - $1,200</p>
                <p className="text-sm text-slate-500">Seats 10-11 guests</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Individual Seat</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">$100 - $120</p>
                <p className="text-sm text-slate-500">Per person</p>
              </div>
            </div>

            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Book Now
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
              Questions? Contact us at{" "}
              <a href="mailto:events@acs.edu.sg" className="font-medium text-blue-600 hover:text-blue-500">
                events@acs.edu.sg
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

