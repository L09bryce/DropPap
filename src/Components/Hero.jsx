import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

const Hero = () => {
  const [refText, textVisible] = useScrollReveal();
  const [refImage, imageVisible] = useScrollReveal();

  return (
    <section className="bg-[#F7F9FA] h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center min-h-screen lg:min-h-auto" style={{ height: '75vh' }}>
          {/* Left side - Text */}
          <div
            ref={refText}
            className={`flex-1 flex flex-col justify-center scroll-reveal ${textVisible ? 'visible' : ''}`}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Work smarter, not harder
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              DropPap delivers tools that help you collaborate with ease, move work forward faster, and keep it all safe.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => alert('Get Started')}
                className="text-white px-8 py-3 rounded-lg font-semibold bg-blue-600 w-fit"
              >
                Get started – it's free
              </button>
              <button
                onClick={() => alert('Learn More')}
                className="px-8 py-3 rounded-lg font-semibold text-dropbox-blue border-2 border-dropbox-blue hover:bg-light-grey transition-all duration-300 w-fit"
              >
                Learn more
              </button>
            </div>
          </div>

          {/* Right side - Image */}
          <div
            ref={refImage}
            className={`flex-1 flex justify-center scroll-reveal ${imageVisible ? 'visible' : ''}`}
          >
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=500&fit=crop"
              alt="Team collaboration"
              className="rounded-2xl shadow-lg object-cover w-full max-w-md h-96"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
