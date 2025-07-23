import React from 'react';

interface VideoSectionProps {
  heading?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  videoId?: string;
  className?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  heading = "See Saski AI in Action",
  title = "See How Easily You Can Launch Your AI Assistant",
  description = "In under 3 minutes, see how Saski AI helps you automate support, connect your tools, and launch your assistant across multiple channels without any technical setup.",
  videoUrl = "https://youtu.be/SQp3KsYigJw?si=404RMXbZafG78Lay",
  videoId = "SQp3KsYigJw",
  className = ""
}) => {
  // Extract video ID from URL if needed
  const getVideoId = (url: string) => {
    if (videoId) return videoId;
    
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : 'SQp3KsYigJw';
  };

  const embedVideoId = getVideoId(videoUrl);

  return (
    <section className={`py-16 lg:py-20 bg-gradient-to-b from-[#F6F8FC] to-[#FBFBFB] ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="flex-1 space-y-6">
            {/* Badge Label */}
            <div className="inline-block px-3 py-1 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-light-200)] rounded-full" style={{ fontFamily: 'Manrope, sans-serif' }}>
              ✨ Live Demo
            </div>
            
            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {heading}
            </h2>
            
            {/* Description */}
            <p className="text-lg text-[var(--color-dark-600)] leading-relaxed max-w-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {description}
            </p>

            {/* Watch Full Demo Link */}
            <a 
              href="#demo"
              className="text-sm text-[var(--color-primary)] font-medium hover:underline mt-4 inline-block transition-colors duration-200"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Watch Full Demo →
            </a>
          </div>

          {/* Right Column - Video */}
          <div className="flex-1 relative">
            {/* Responsive Video Container */}
            <div className="relative w-full max-w-xl mx-auto">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <div className="absolute inset-0 rounded-xl overflow-hidden shadow-xl ring-1 ring-[#CBD4E1] bg-gray-900">
                  {/* Video iframe */}
                  <iframe
                    className="absolute inset-0 w-full h-full animate-fade-in-up"
                    src={`https://www.youtube.com/embed/${embedVideoId}?controls=1&rel=0&playsinline=1&cc_load_policy=0&autoplay=0&modestbranding=1`}
                    title="Saski AI Demo Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>

              {/* Video Caption */}
              <p className="text-sm text-[var(--color-dark-500)] text-center mt-4 leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Real customer conversation • Automated response • Lead captured in under 30 seconds
              </p>
            </div>

            {/* Decorative elements - subtle */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[var(--color-primary)]/10 rounded-full opacity-30 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[var(--color-primary-light)]/10 rounded-full opacity-30 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 
