import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-6">
            ACS Founders' Day Dinner
          </h1>
          <p className="text-2xl md:text-3xl text-white mb-4">140 Years Celebration</p>
          <p className="text-lg text-blue-100 mb-12">
            Join us for an unforgettable evening celebrating 140 years of excellence
          </p>
          
          <div className="bg-white rounded-lg shadow-2xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Book Your Table or Seats</h2>
            <p className="text-gray-600 mb-8">
              Choose from VIP, School, OBA, or Guest categories. Tables seat 10-11 guests.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Full Table</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-2">$1,000 - $1,200</p>
                <p className="text-sm text-gray-600">Seats 10-11 guests</p>
              </div>
              <div className="border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Individual Seat</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-2">$100 - $120</p>
                <p className="text-sm text-gray-600">Per person</p>
              </div>
            </div>

            <Link
              href="/book"
              className="inline-block bg-blue-900 text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition-colors"
            >
              Book Now
            </Link>
          </div>

          <div className="text-white text-sm">
            <p>Questions? Contact us at events@acs.edu.sg</p>
          </div>
        </div>
      </div>
    </div>
  )
}

