import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
        <p className="text-7xl font-black text-blue-100 mb-2">404</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
