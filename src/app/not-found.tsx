'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <Header />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#5243E9]/10 to-[#7C3AED]/10 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#06B6D4]/10 to-[#5243E9]/10 rounded-full blur-lg" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-[#5243E9]/15 to-[#7C3AED]/15 rounded-full blur-lg" />
      </div>

      {/* Main content */}
      <div className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* 404 Number with gradient */}
          <div className="mb-8">
            <h1 className="text-[12rem] sm:text-[16rem] lg:text-[20rem] font-bold leading-none tracking-tight">
              <span className="bg-gradient-to-br from-[#5243E9] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                404
              </span>
            </h1>
          </div>

          {/* Main heading */}
          <div className="mb-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-manrope">
              Oops! Page Not Found
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#5243E9] to-[#7C3AED] mx-auto rounded-full" />
          </div>

          {/* Description */}
          <div className="mb-12 max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed font-manrope">
              The page you're looking for seems to have wandered off into the digital void. 
              Don't worry though, we'll help you find your way back!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#5243E9] to-[#7C3AED] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#5243E9]/25 hover:-translate-y-1 font-manrope"
            >
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Back Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:border-[#5243E9] hover:text-[#5243E9] hover:shadow-md font-manrope"
            >
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Helpful links */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-6 font-manrope">Looking for something specific? Try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/about" className="text-[#5243E9] hover:text-[#7C3AED] transition-colors font-medium font-manrope">
                About Us
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/contact" className="text-[#5243E9] hover:text-[#7C3AED] transition-colors font-medium font-manrope">
                Contact
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/pricing" className="text-[#5243E9] hover:text-[#7C3AED] transition-colors font-medium font-manrope">
                Pricing
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/faq" className="text-[#5243E9] hover:text-[#7C3AED] transition-colors font-medium font-manrope">
                FAQ
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
} 
