import React from 'react';
import Image from 'next/image';
import { ExternalLink, Rocket, Star, Trophy, Users, TrendingUp, Heart, Zap } from 'lucide-react';

interface ProductHuntSectionProps {
  heading?: string;
  description?: string;
  badgeUrl?: string;
  badgeAlt?: string;
  productHuntUrl?: string;
  callToAction?: string;
  className?: string;
}

const ProductHuntSection: React.FC<ProductHuntSectionProps> = ({
  heading = "We're Launching on Product Hunt!",
  description = "Mark your calendars! Saski AI is launching on Product Hunt on July 7th. Join thousands of entrepreneurs, developers, and business leaders who are discovering the future of AI-powered customer support.",
  badgeUrl = "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=965134&theme=light&t=1748875046361",
  badgeAlt = "Saski AI - Saski AI – Multichannel AI Support Built for SMB's | Product Hunt",
  productHuntUrl = "https://www.producthunt.com/products/saski-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-saski-ai",
  callToAction = "Get notified when we launch and help us reach #1 Product of the Day!",
  className = ""
}) => {
  return (
    <section className={`py-10 bg-gradient-to-br from-[#F6F8FC] to-[#FBFBFB] ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Main Container */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8 md:p-10" style={{
          background: 'radial-gradient(ellipse at center, #FBFBFB 0%, #F6F8FC 100%)'
        }}>
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-[#5243E9]/8 via-[#6366F1]/5 to-[#8B5CF6]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#8B5CF6]/6 via-[#6366F1]/4 to-[#5243E9]/6 rounded-full blur-3xl" />
          
          <div className="relative">
            {/* Compact Header Section */}
            <div className="text-center mb-6">
              {/* Badge with Rocket Icon */}
              <div className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4 shadow-lg">
                <Rocket className="inline w-6 h-6 mr-2 text-white" />
                We're Live on Product Hunt!
              </div>

              {/* Compact Main Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                <span className="bg-gradient-to-r from-[#5243E9] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  <Rocket className="inline w-6 h-6 mr-2 text-[#5243E9]" />
                  {heading}
                </span>
              </h2>

              {/* Condensed Description */}
              <p className="text-base text-gray-600 leading-relaxed max-w-2xl mx-auto mb-4" style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '500' }}>
                We're launching on Product Hunt — join us as we showcase AI-powered customer support for modern businesses.
              </p>
            </div>

            {/* Compact Product Hunt Badge Section */}
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#5243E9] via-[#6366F1] to-[#8B5CF6] rounded-lg blur-sm opacity-15 group-hover:opacity-25 transition-opacity duration-300" />
                <a 
                  href={productHuntUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block bg-white rounded-lg p-3 shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <Image
                    src={badgeUrl}
                    alt={badgeAlt}
                    width={240}
                    height={40}
                    className="mx-auto"
                    priority={false}
                  />
                </a>
              </div>
            </div>

            {/* Compact Stats Section */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-[var(--color-primary)]" />
                  <span className="text-xs font-medium text-gray-700">4.9 Stars</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[var(--color-primary-light)]" />
                  <span className="text-xs font-medium text-gray-700">500+ Users</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-[#8B5CF6]" />
                  <span className="text-xs font-medium text-gray-700">#3 Product</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-[#A855F7]" />
                  <span className="text-xs font-medium text-gray-700">200+ Upvotes</span>
                </div>
              </div>
            </div>

            {/* Compact Call to Action Section */}
            <div className="text-center">
              <p className="text-base font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {callToAction}
              </p>
              
              {/* Action Button with Microanimation */}
              <div className="flex flex-col items-center gap-3">
                <a
                  href={productHuntUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-lg transition-all duration-300 hover:bg-[var(--color-primary-dark)] hover:shadow-lg hover:scale-105 shadow-md"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  Get Notified
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                </a>
                
                <p className="text-xs text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  It takes less than 15 seconds to vote. Every click helps us grow.
                </p>
              </div>

              {/* Condensed Support Message */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  <span className="font-semibold text-[var(--color-primary)]">Thank you</span> for being part of our journey! 
                  Every vote helps us reach more small businesses who need AI automation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHuntSection; 
