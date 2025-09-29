import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        
        <Link
          href="/"
          className="inline-block bg-rose-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-rose-600 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
